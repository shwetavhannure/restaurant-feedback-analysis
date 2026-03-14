# Sentiment and Emotion Analysis of Restaurant Feedback

Restaurant Feedback Analysis is a web-based application that analyzes restaurant customer reviews to determine **sentiment (positive, negative, neutral)** and **emotions** from feedback text.

Built using **Python Flask** with a simple web interface, the system allows users to submit feedback along with star ratings and view real-time analytics through an interactive dashboard.

---

## 🚀 Features

* 📝 Submit restaurant feedback with ratings
* 😊 Sentiment classification (Positive / Negative / Neutral)
* 🎭 Emotion detection from feedback text
* 📊 Interactive dashboard with sentiment distribution charts
* 📈 Emotion distribution visualization
* ⚡ Real-time dashboard updates

---

## 🛠 Tech Stack

* Python
* Flask
* HTML
* CSS
* JavaScript
* Chart.js
* NLTK (VADER Sentiment Analyzer)

---

## 📁 Folder Structure

```
restaurant-feedback-analysis
│
├── app.py
├── Restaurant_Reviews.tsv
│
├── templates/
│   ├── dashboard.html
│   ├── reviews.html
│   └── analyze.html
│
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```

---

## 🔧 Installation & Setup

### 📦 Prerequisites

* Python installed
* pip package manager

### 🚀 Run Locally

```bash
# Clone the repository
git clone https://github.com/your-username/restaurant-feedback-analysis.git

# Navigate into the project folder
cd restaurant-feedback-analysis

# Install required packages
pip install flask nltk

# Download VADER sentiment lexicon
python -c "import nltk; nltk.download('vader_lexicon')"

# Run the Flask application
python app.py
```

Open in browser:

```
http://127.0.0.1:5000/
```

---

## 📊 How It Works

* User submits feedback and ratings
* Text sentiment is analyzed using VADER
* Ratings are combined with text sentiment to compute the final score
* Emotion is detected using keyword matching and similarity comparison
* Results are displayed on the dashboard using charts

---

## 🚀 Deployment

Currently runs locally using the Flask development server.

Can be deployed using platforms like:

* Render
* Railway
* Heroku

---

