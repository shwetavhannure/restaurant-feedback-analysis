Chart.register(ChartDataLabels);

const COLORS_SENTIMENT = ['#6970f0', '#4f56e8', '#a8aff3'];
const COLORS_EMOTION = ['#66fcf1', '#c3073f', '#ff6b6b', '#ffd166', '#ff8fa3', '#9ad1d4', '#7ef0a3', '#b39ddb'];

let sentimentChart, emotionChart;
let hasSpun = false; 

function renderChart(id, labels, data, colors, showPercentages = true, spin = false) {
  const ctx = document.getElementById(id).getContext('2d');
  if (id === 'sentimentChart' && sentimentChart) sentimentChart.destroy();
  if (id === 'emotionChart' && emotionChart) emotionChart.destroy();

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: {
      responsive: true,
      animation: spin && !hasSpun ? {
        duration: 2000,
        easing: 'easeOutCubic',
        animateRotate: true,
        animateScale: true
      } : false, 
      rotation: -90, 
      circumference: 360, 
      plugins: {
        legend: {
          display: true,
          position: 'right',
          align: 'center',
          labels: { color: '#fff', boxWidth: 15, padding: 10 }
        },
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: 13 },
          formatter: (value, ctx) => {
            if (!showPercentages) return '';
            const dataset = ctx.chart.data.datasets[0].data;
            const total = dataset.reduce((a, b) => a + b, 0);
            if (!total || value === 0) return '';
            const percent = Math.round((value / total) * 100);
            return `${percent}% ${ctx.chart.data.labels[ctx.dataIndex]}`;
          }
        }
      },
      maintainAspectRatio: false
    },
    plugins: [ChartDataLabels]
  });

  if (id === 'sentimentChart') sentimentChart = chart;
  else emotionChart = chart;
}

function updateDashboard(initial = false) {
  fetch('/get_stats')
    .then(r => r.json())
    .then(data => {
      document.getElementById('totalCard').innerText = `📝 Total Reviews: ${data.total}`;
      document.getElementById('positiveCard').innerText = `😊 Positive Feedbacks: ${data.positive}`;
      document.getElementById('neutralCard').innerText = `😐 Neutral Feedbacks: ${data.sentiment_data.neutral}`; // ✅ new line
      document.getElementById('negativeCard').innerText = `😞 Negative Feedbacks: ${data.negative}`;

      const emotionLabels = Object.keys(data.emotion_data);
      const emotionCounts = Object.values(data.emotion_data);

      if (data.total === 0) {
        renderChart('sentimentChart', ['Positive', 'Negative', 'Neutral'], [1, 1, 1], COLORS_SENTIMENT, false, initial);
        renderChart('emotionChart', emotionLabels, new Array(emotionLabels.length).fill(1), COLORS_EMOTION, false, initial);
      } else {
        const sentimentData = [
          data.sentiment_data.positive,
          data.sentiment_data.negative,
          data.sentiment_data.neutral
        ];
        renderChart('sentimentChart', ['Positive', 'Negative', 'Neutral'], sentimentData, COLORS_SENTIMENT, true, initial);
        renderChart('emotionChart', emotionLabels, emotionCounts, COLORS_EMOTION, true, initial);
      }

      
      if (initial && !hasSpun) {
        hasSpun = true;
      }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  updateDashboard(true);
  setInterval(() => updateDashboard(false), 3000);

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      hasSpun = false;
      updateDashboard(true);
    }
  });
});
