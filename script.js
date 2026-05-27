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
const questions = [ /* все 10 вопросов остаются те же */ 
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
let hasVoted = false;

// ================== ОПРОС О ПРИВИВКЕ ==================
async function answerVaccine(yes) {
  if (hasVoted) return;
  hasVoted = true;

  document.getElementById('btnYes').disabled = true;
  document.getElementById('btnNo').disabled = true;
  document.getElementById('vaccineThankYou').classList.remove('hidden');

  try {
    await db.collection("vaccineStats").add({ vaccinated: yes, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
  } catch (e) {}
  loadVaccineStats();
}

async function loadVaccineStats() { /* ... тот же код ... */ 
  // (оставил без изменений)
  const statsEl = document.getElementById('vaccineStats');
  try {
    const snapshot = await db.collection("vaccineStats").get();
    let yesCount = 0, total = 0;
    snapshot.forEach(doc => { total++; if (doc.data().vaccinated) yesCount++; });
    const yesPercent = total > 0 ? Math.round((yesCount / total) * 100) : 0;
    statsEl.innerHTML = `<strong>Статистика прививок:</strong><br>✅ Да — ${yesPercent}% &nbsp;&nbsp; ❌ Нет — ${100-yesPercent}%`;
  } catch (e) {}
}

// ================== ТЕСТ ==================
function startQuiz() {
  userName = document.getElementById('userName').value.trim();
  if (!userName) return alert("Введите ваше имя!");

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
  opts.classList.add('fade-in');

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

async function showResult() { /* ... тот же код ... */ 
  // (оставил без изменений)
  document.getElementById('quizScreen').classList.add('hidden');
  document.getElementById('resultScreen').classList.remove('hidden');

  score = 0;
  answers.forEach((ans, i) => { if (ans === questions[i].correct) score++; });

  const percent = Math.round((score / 10) * 100);
  document.getElementById('resultUser').textContent = userName;

  const circle = document.getElementById('scoreCircle');
  circle.textContent = percent + '%';
  circle.style.borderColor = percent >= 80 ? '#22c55e' : '#eab308';

  document.getElementById('resultMsg').innerHTML = percent >= 80 ? 'Отличный результат! 🏆' : 'Есть над чем поработать 📚';

  await saveResultToFirebase(percent);
  loadLeaderboard();
}

async function saveResultToFirebase(percent) { /* ... */ }

// ================== ЗАПУСК ==================
window.onload = () => {
  loadWeather();
  loadLeaderboard();
  loadVaccineStats();
};
