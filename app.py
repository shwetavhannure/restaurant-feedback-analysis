from flask import Flask, render_template, request, jsonify
import os, csv
from difflib import SequenceMatcher

try:
    from nltk.sentiment.vader import SentimentIntensityAnalyzer
    SIA_AVAILABLE = True
except Exception:
    SIA_AVAILABLE = False

app = Flask(__name__)

DATASET_PATH = os.path.join(os.path.dirname(__file__), 'Restaurant_Reviews.tsv')
dataset_reviews = []
if os.path.exists(DATASET_PATH):
    try:
        with open(DATASET_PATH, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f, delimiter='\t')
            cols = reader.fieldnames or []
            text_col = None
            for c in cols:
                if 'review' in c.lower() or 'text' in c.lower():
                    text_col = c
                    break
            if not text_col and cols:
                text_col = cols[0]
            for row in reader:
                txt = row.get(text_col, '').strip() if text_col else list(row.values())[0].strip()
                if txt:
                    dataset_reviews.append(txt.lower())
    except Exception as e:
        print("Failed to read dataset:", e)

feedbacks = []

EMOTIONS = ["satisfied", "disappointed", "happy", "angry", "sad", "neutral", "excited", "disgusted"]

EMOTION_KEYWORDS = {
    "satisfied": ["good", "great", "excellent", "nice", "delicious", "tasty", "satisfied", "pleasant", "yummy", "perfect", "amazing", "best"],
    "happy": ["happy", "joy", "joyful", "love", "loved", "enjoyed", "pleased"],
    "excited": ["excited", "awesome", "fantastic", "thrilled"],
    "disappointed": ["disappoint", "bad", "poor", "not good", "unhappy"],
    "angry": ["angry", "mad", "furious", "rude"],
    "sad": ["sad", "upset", "down"],
    "disgusted": ["disgust", "gross", "nasty", "vomit"],
    "neutral" : ["okay", "fine", "average", "normal", "decent"],
}

def detect_emotion(text):
    text = text.lower()
    for emo, words in EMOTION_KEYWORDS.items():
        for w in words:
            if w in text:
                return emo
            
    best = ("neutral", 0.0)
    for d in dataset_reviews:
        sim = SequenceMatcher(None, text, d).ratio()
        if sim > best[1]:
            best = (guess_emotion_from_text(d), sim)
    if best[1] > 0.6:
        return best[0]
    return "neutral"

def guess_emotion_from_text(text):
    text = text.lower()
    for emo, words in EMOTION_KEYWORDS.items():
        for w in words:
            if w in text:
                return emo
    return "neutral"

def simple_heuristic_score(text):
    pos_words = ["good","great","excellent","amazing","nice","delicious","tasty","yummy","love","loved","best"]
    neg_words = ["bad","terrible","awful","cold","nasty","disgust","hate","horrible","slow","noisy","rude","rudeness","rude."]
    t = text.lower()
    p = sum(t.count(w) for w in pos_words)
    n = sum(t.count(w) for w in neg_words)
    if p==0 and n==0:
        return 0.0
    score = (p - n) / max(p + n, 1)
    return float(score)

def compute_sentiment_score(text, ratings=None):
    score = 0.0
    if SIA_AVAILABLE:
        try:
            sia = SentimentIntensityAnalyzer()
            score = sia.polarity_scores(text)['compound']
        except Exception:
            score = simple_heuristic_score(text)
    else:
        score = simple_heuristic_score(text)

    if ratings and isinstance(ratings, list):
        try:
            vals = [int(r) for r in ratings if r is not None and r != 0]
            if vals:
                avg_rating = sum(vals)/len(vals)
                rating_score = (avg_rating - 3) / 2.0
                score = (score * 0.75) + (rating_score * 0.25)
        except Exception:
            pass
    return round(score, 2)

def categorize(score):
    if score > 0.05:
        return "positive"
    elif score < -0.05:
        return "negative"
    else:
        return "neutral"


@app.route('/')
def dashboard():
    total = len(feedbacks)
    positive = len([f for f in feedbacks if f['category'] == 'positive'])
    negative = len([f for f in feedbacks if f['category'] == 'negative'])
    neutral = total - (positive + negative)
    sentiment_data = {"positive": positive, "negative": negative, "neutral": neutral}
    emotion_data = {e: 0 for e in EMOTIONS}
    for f in feedbacks:
        emotion_data[f.get("emotion","neutral")] += 1
    return render_template("dashboard.html",
                           total=total,
                           positive=positive,
                           negative=negative,
                           sentiment_data=sentiment_data,
                           emotion_data=emotion_data,
                           emotions=EMOTIONS)

@app.route('/reviews')
def reviews():
    return render_template("reviews.html")

@app.route('/analyze')
def analyze():
    return render_template("analyze.html", feedbacks=feedbacks)

@app.route('/submit_feedback', methods=["POST"])
def submit_feedback():
    data = request.get_json()
    text = data.get("feedback", "").strip()
    ratings = data.get("ratings", [])
    if not text:
        return jsonify({"error": "Feedback is empty"}), 400

    score = compute_sentiment_score(text, ratings)
    category = categorize(score)
    emotion = detect_emotion(text)

    emotion_to_sentiment = {
        "angry": "negative",
        "sad": "negative",
        "disappointed": "negative",
        "disgusted": "negative",
        "happy": "positive",
        "excited": "positive",
        "satisfied": "positive",
        "neutral": "neutral"
    }

    if emotion in emotion_to_sentiment:
        category = emotion_to_sentiment[emotion]

    feedback_obj = {
        "text": text,
        "sentiment": score,
        "category": category,
        "emotion": emotion,
        "ratings": ratings
    }
    feedbacks.append(feedback_obj)

    return jsonify({"message": "✅ Feedback submitted!", "feedback": feedback_obj})


@app.route('/get_stats')
def get_stats():
    total = len(feedbacks)
    positive = len([f for f in feedbacks if f['category'] == 'positive'])
    negative = len([f for f in feedbacks if f['category'] == 'negative'])
    neutral = total - (positive + negative)
    sentiment_data = {"positive": positive, "negative": negative, "neutral": neutral}
    emotion_data = {e: 0 for e in EMOTIONS}
    for f in feedbacks:
        emotion_data[f.get("emotion","neutral")] += 1
    return jsonify({
        "total": total,
        "positive": positive,
        "negative": negative,
        "sentiment_data": sentiment_data,
        "emotion_data": emotion_data
    })

if __name__ == '__main__':
    if not SIA_AVAILABLE:
        print("NLTK VADER not available. To enable better sentiment scoring, run:")
        print("  pip install nltk")
        print('  python -c "import nltk; nltk.download(\'vader_lexicon\')"')
    app.run(debug=True)
