// ================== FIREBASE ==================
const firebaseConfig = {
  apiKey: "AIzaSyDDuEf9tOaOz5ekzunSSgaxSvxXOTiZa2k",
  authDomain: "klesh-test.firebaseapp.com",
  projectId: "klesh-test",
  storageBucket: "klesh-test.firebasestorage.app",
  messagingSenderId: "282009735770",
  appId: "1:282009735770:web:234d7944039fd68f62fe63"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================== ВОПРОСЫ ==================
const questions = [
  { q: "Что является основным переносчиком клещевого энцефалита?", options: ["Комары", "Клещи", "Мухи", "Блохи"], correct: 1 },
  { q: "В какое время года наиболее активны клещи?", options: ["Зима", "Весна и осень", "Только лето", "Круглый год"], correct: 1 },
  { q: "Можно ли заразиться через сырое молоко?", options: ["Нет", "Да", "Только через укус", "Через воздух"], correct: 1 },
  { q: "Как правильно удалять присосавшегося клеща?", options: ["По часовой стрелке", "Против часовой стрелки", "Сдавливать", "Прижигать"], correct: 1 },
  { q: "Существует ли вакцина от клещевого энцефалита?", options: ["Нет", "Да", "Только для детей", "Только для пожилых"], correct: 1 },
  { q: "Что делать сразу после укуса клеща?", options: ["Ничего", "Удалить и обработать", "Пить антибиотики", "Наложить масло"], correct: 1 },
  { q: "Какой цвет одежды лучше защищает от клещей?", options: ["Чёрный", "Светлый", "Красный", "Зелёный"], correct: 1 },
  { q: "Можно ли использовать масло при удалении клеща?", options: ["Да", "Нет, это опасно", "Только спирт", "Только масло"], correct: 1 },
  { q: "Сколько примерно длится инкубационный период?", options: ["1-3 дня", "7-14 дней", "1 месяц", "3 месяца"], correct: 1 },
  { q: "Что является самым надёжным методом защиты?", options: ["Только репелленты", "Вакцина + защита от укусов", "Только осмотр", "Антибиотики"], correct: 1 }
];

let currentQ = 0, score = 0, userName = "", answers = [];

// ================== СТАТИЧЕСКИЙ ОПРОС О ПРИВИВКЕ ==================
let hasVoted = false;

async function answerVaccine(yes) {
  if (hasVoted) return;

  hasVoted = true;

  // Блокируем кнопки
  document.getElementById('btnYes').disabled = true;
  document.getElementById('btnNo').disabled = true;

  // Показываем спасибо
  document.getElementById('vaccineThankYou').classList.remove('hidden');

  try {
    await db.collection("vaccineStats").add({
      vaccinated: yes,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {}

  loadVaccineStats();
}

async function loadVaccineStats() {
  const statsEl = document.getElementById('vaccineStats');
  try {
    const snapshot = await db.collection("vaccineStats").get();
    let yesCount = 0, total = 0;

    snapshot.forEach(doc => {
      total++;
      if (doc.data().vaccinated) yesCount++;
    });

    const yesPercent = total > 0 ? Math.round((yesCount / total) * 100) : 0;
    const noPercent = 100 - yesPercent;

    statsEl.innerHTML = `
      <strong>Статистика прививок:</strong><br>
      ✅ Да — ${yesPercent}% (${yesCount} чел.) &nbsp;&nbsp; 
      ❌ Нет — ${noPercent}% (${total - yesCount} чел.)
    `;
  } catch (e) {
    statsEl.textContent = "Статистика прививок загружается...";
  }
}

// ================== ЛИДЕРБОРД ==================
async function loadLeaderboard() {
  const container = document.getElementById('leaderboard');
  try {
    const snapshot = await db.collection("testResults")
      .orderBy("score", "desc")
      .limit(3)
      .get();

    let html = '';
    let place = 1;
    const medals = ['🥇', '🥈', '🥉'];

    snapshot.forEach(doc => {
      const r = doc.data();
      html += `
        <div class="leader-item">
          <span class="medal">${medals[place-1]}</span>
          <strong>${r.name}</strong>
          <span class="leader-score">${r.score}%</span>
        </div>`;
      place++;
    });

    container.innerHTML = html || '<p>Пока нет результатов</p>';
  } catch (e) {
    container.innerHTML = '<p>Ошибка загрузки лидерборда</p>';
  }
}

// ================== ПОГОДА ==================
async function loadWeather() {
  const weatherEl = document.getElementById('weather');
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.95&longitude=92.35&current_weather=true');
    const data = await res.json();
    const temp = Math.round(data.current_weather.temperature);
    weatherEl.innerHTML = `🌡️ Дивногорск: <strong>${temp}°C</strong>`;
  } catch (e) {
    weatherEl.textContent = '🌡️ Дивногорск — погода загружается...';
  }
}

// ================== АДМИН ==================
async function showAllResults() {
  const container = document.getElementById('adminResults');
  container.innerHTML = '<p>Загрузка...</p>';

  try {
    const snapshot = await db.collection("testResults").orderBy("timestamp", "desc").get();
    let html = `<p style="margin-bottom:15px; font-weight:600;">Всего прохождений: ${snapshot.size}</p>`;

    snapshot.forEach(doc => {
      const r = doc.data();
      const docId = doc.id;
      html += `
        <div class="result-item">
          <div><strong>${r.name}</strong><br><small>${r.date}</small></div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="score">${r.score}%</span>
            <button onclick="deleteResult('${docId}')" class="delete-btn">🗑️</button>
          </div>
        </div>`;
    });

    container.innerHTML = html || '<p>Пока нет результатов</p>';
  } catch (e) {
    container.innerHTML = '<p>Ошибка загрузки</p>';
  }
}

function deleteResult(docId) {
  if (confirm("Удалить этот результат?")) {
    db.collection("testResults").doc(docId).delete().then(() => {
      showAllResults();
      loadLeaderboard();
    });
  }
}

function loginAdmin() {
  const pass = prompt("Введите пароль администратора:");
  if (pass === "sofr2928") {
    document.getElementById('adminContent').classList.remove('hidden');
    showAllResults();
  } else {
    alert("Неверный пароль!");
  }
}

// ================== ОСНОВНОЙ ТЕСТ ==================
async function saveResultToFirebase(percent) {
  try {
    await db.collection("testResults").add({
      name: userName,
      date: new Date().toLocaleString('ru-RU'),
      score: percent,
      correct: score,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {}
}

function startQuiz() {
  userName = document.getElementById('userName').value.trim();
  if (!userName) return alert("Введите имя!");

  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.remove('hidden');

  currentQ = 0;
  answers = [];
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQ];
  document.getElementById('qNum').textContent = currentQ + 1;
  document.getElementById('questionText').textContent = q.q;

  const opts = document.getElementById('options');
  opts.innerHTML = '';

  q.options.forEach((text, i) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerHTML = `<input type="radio" name="q${currentQ}" onchange="selectAnswer(${i})"> ${text}`;
    opts.appendChild(div);
  });

  document.getElementById('nextBtn').classList.add('hidden');
}

function selectAnswer(index) {
  answers[currentQ] = index;
  document.getElementById('nextBtn').classList.remove('hidden');
}

function nextQuestion() {
  currentQ++;
  if (currentQ < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

async function showResult() {
  document.getElementById('quizScreen').classList.add('hidden');
  document.getElementById('resultScreen').classList.remove('hidden');

  score = 0;
  answers.forEach((ans, i) => {
    if (ans === questions[i].correct) score++;
  });

  const percent = Math.round((score / 10) * 100);
  document.getElementById('resultUser').textContent = userName;

  const circle = document.getElementById('scoreCircle');
  circle.textContent = percent + '%';
  circle.style.borderColor = percent >= 80 ? '#22c55e' : '#eab308';

  document.getElementById('resultMsg').innerHTML = percent >= 80 
    ? 'Отличный результат! 🏆' 
    : 'Есть над чем поработать 📚';

  await saveResultToFirebase(percent);
  loadLeaderboard();
}

function restartQuiz() {
  location.reload();
}

// ================== ЗАПУСК ==================
window.onload = () => {
  loadWeather();
  loadLeaderboard();
  loadVaccineStats();
};
