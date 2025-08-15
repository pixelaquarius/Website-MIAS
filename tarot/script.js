const API_URL = 'https://website-mias.vercel.app/api/ai-reading';

let currentCards = [];
let historyData = JSON.parse(localStorage.getItem('tarotHistory') || '[]');
let currentSession = [];

document.getElementById('draw-btn').addEventListener('click', drawCards);
document.getElementById('finish-btn').addEventListener('click', finishReading);
document.getElementById('deep-btn').addEventListener('click', deepReading);
document.getElementById('combine-btn').addEventListener('click', combineReading);
document.getElementById('new-btn').addEventListener('click', newReading);
document.getElementById('ai-btn').addEventListener('click', callAI);
document.getElementById('close-popup').addEventListener('click', () => {
  document.getElementById('popup').classList.add('hidden');
});

function drawCards() {
  currentCards = generateRandomCards(3);
  renderCards(currentCards);
  document.getElementById('finish-btn').disabled = false;
}

function finishReading() {
  currentSession.push(currentCards);
  saveHistory();
  renderHistory();
  document.getElementById('deep-btn').disabled = false;
  document.getElementById('new-btn').disabled = false;
}

function deepReading() {
  const newDraw = generateRandomCards(1);
  currentSession.push(newDraw);
  saveHistory();
  renderHistory();
  if (currentSession.length >= 2) {
    document.getElementById('combine-btn').disabled = false;
  }
}

function combineReading() {
  const combinedCards = currentSession.flat();
  document.getElementById('question').value += ' (Kết hợp tất cả)';
  currentCards = combinedCards;
  callAI();
}

function newReading() {
  currentSession = [];
  currentCards = [];
  renderCards([]);
  document.getElementById('finish-btn').disabled = true;
  document.getElementById('deep-btn').disabled = true;
  document.getElementById('combine-btn').disabled = true;
  document.getElementById('new-btn').disabled = true;
}

function renderCards(cards) {
  const area = document.getElementById('card-area');
  area.innerHTML = cards.map(c => `<div class="card">${c.name}</div>`).join('');
}

function generateRandomCards(n) {
  const deck = [
    { name: 'The Fool' }, { name: 'The Magician' }, { name: 'Five of Wands' },
    { name: 'Five of Cups' }, { name: 'The Lovers' }, { name: 'The Hermit' }
  ];
  return Array.from({ length: n }, () => deck[Math.floor(Math.random() * deck.length)]);
}

function callAI() {
  const question = document.getElementById('question').value;
  const meta = document.getElementById('meta').value;

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cards: currentCards, question, meta })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('ai-result').innerText = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      document.getElementById('ai-result').innerText = 'Lỗi AI: ' + err.message;
    });
}

function saveHistory() {
  historyData.push([...currentSession]);
  localStorage.setItem('tarotHistory', JSON.stringify(historyData));
}

function renderHistory() {
  const container = document.getElementById('history');
  container.innerHTML = historyData.map((session, idx) =>
    `<button onclick="showPopup(${idx})">Lượt ${idx + 1}</button>`
  ).join('');
}

function showPopup(index) {
  const popup = document.getElementById('popup');
  const content = document.getElementById('popup-content');
  const session = historyData[index];
  content.innerHTML = session.map((draw, i) =>
    `<h4>Lần bóc ${i + 1}</h4><p>${draw.map(c => c.name).join(', ')}</p>`
  ).join('');
  popup.classList.remove('hidden');
}

renderHistory();
