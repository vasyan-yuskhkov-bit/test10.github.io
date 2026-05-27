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

const questions = [
  { q: "Что является основным переносчиком клещевого энцефалита?", options: ["Комары", "Клещи", "Мухи", "Блохи"], correct: 1 },
  { q: "В какое время года наиболее активны клещи?", options: ["Зима", "Весна и осень", "Только лето", "Круглый год"], correct: 1 },
  { q: "Можно ли заразиться через сырое молоко?", options: ["Нет", "Да", "Только через укус", "Через воздух"], correct: 1 },
  { q: "Как правильно удалять клеща?", options: ["По часовой стрелке", "Против часовой стрелки", "Сдавливать", "Прижигать"], correct: 1 },
  { q: "Существует ли вакцина от клещевого энцефалита?", options: ["Нет", "Да", "Только для детей", "Только для пожилых"], correct: 1 },
  { q: "Что делать сразу после укуса?", options: ["Ничего", "Удалить и обработать", "Пить антибиотики", "Наложить масло"], correct: 1 },
  { q: "Какой цвет одежды лучше защищает?", options: ["Чёрный", "Светлый", "Красный", "Зелёный"], correct: 1 },
  { q: "Можно ли использовать масло при удалении клеща?", options: ["Да", "Нет, опасно", "Только спирт", "Только масло"], correct: 1 },
  { q: "Сколько длится инкубационный период?", options: ["1-3 дня", "7-14 дней", "1 месяц", "3 месяца"], correct: 1 },
  { q: "Самый надёжный метод защиты?", options: ["Репелленты", "Вакцина + защита", "Только осмотр", "Антибиотики"], correct: 1 }
];

let currentQ = 0, score = 0, userName = "", answers = [];

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

async function showAllResults() {
  const container = document.getElementById('adminResults');
  container.innerHTML = '<p>Загрузка...</p>';
  try {
    const snapshot = await db.collection("testResults").orderBy("timestamp", "desc").get();
    let html = `<p style="margin-bottom:15px; font-weight:600;">Всего прохождений: ${snapshot.size}</p>`;
    snapshot.forEach(doc => {
      const r = doc.data();
      html += `<div style="padding:16px; background:#f8fafc; border-radius:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div><strong>${r.name}</strong><br><small>${r.date}</small></div>
        <span style="font-size:26px; font-weight:700; color:#6366f1;">${r.score}%</span>
      </div>`;
    });
    container.innerHTML = html || '<p>Пока нет результатов</p>';
  } catch (e) {
    container.innerHTML = '<p>Ошибка загрузки</p>';
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
}

function restartQuiz() {
  location.reload();
}
