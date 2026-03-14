document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const feedbackInput = document.getElementById('feedbackInput');
  const messageArea = document.getElementById('messageArea');
  const submitHeading = document.querySelector('.submit-heading');
  const subtext = document.querySelector('.subtext');
  const starContainers = document.querySelectorAll('.stars');
  const ratings = [0, 0, 0, 0, 0];

  starContainers.forEach(cont => {
    const q = parseInt(cont.dataset.q, 10);
    for (let i = 1; i <= 5; i++) {
      const s = document.createElement('span');
      s.classList.add('star');
      s.dataset.value = i;
      s.textContent = '★';
      cont.appendChild(s);
    }

    cont.addEventListener('mouseover', e => {
      if (e.target.classList.contains('star')) highlightStars(cont, parseInt(e.target.dataset.value));
    });
    cont.addEventListener('mouseout', () => highlightStars(cont, ratings[q]));
    cont.addEventListener('click', e => {
      if (e.target.classList.contains('star')) {
        const val = parseInt(e.target.dataset.value);
        ratings[q] = val;
        highlightStars(cont, val);
      }
    });
  });

  function highlightStars(container, count) {
    Array.from(container.children).forEach((star, i) => {
      star.style.color = i < count ? '#FFD700' : '#c5c6c7';
    });
  }

  
  function isValidFeedback(text) {
    if (text.length < 11) return false;
    const wordPattern = /([a-zA-Z]{3,}\s+){1,}[a-zA-Z]{3,}/;
    return wordPattern.test(text);
  }

 
  nextBtn.addEventListener('click', () => {
    const txt = feedbackInput.value.trim();
    if (!isValidFeedback(txt)) {
      alert('Please enter a valid feedback (at least 11 letters and meaningful words).');
      return;
    }

    
    step1.style.display = 'none';
    step2.style.display = 'block';
    messageArea.style.display = 'none';
    submitHeading.style.display = 'none';
    subtext.style.display = 'none';
  });

  
  submitBtn.addEventListener('click', async () => {
    const allRated = ratings.every(r => r > 0);
    if (!allRated) {
      alert('Please rate all questions before submitting.');
      return;
    }

    const txt = feedbackInput.value.trim();
    if (!txt) return;

    try {
      await fetch('/submit_feedback', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ feedback: txt, ratings })
      });
    } catch {}

    messageArea.style.display = 'block';

    setTimeout(() => {
      step2.style.display = 'none';
      step1.style.display = 'block';
      feedbackInput.value = '';
      messageArea.style.display = 'none';
      submitHeading.style.display = 'block';
      subtext.style.display = 'block';
      starContainers.forEach(c => Array.from(c.children).forEach(s => s.style.color = '#c5c6c7'));
      ratings.fill(0);
    }, 2000);
  });
});
