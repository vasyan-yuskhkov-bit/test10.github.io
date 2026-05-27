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
const questions = [ /* твои 10 вопросов */ 
  { q: "Где обычно можно встретить иксодового клеща — переносчика вируса?", options: ["Только в густом еловом лесу","В траве, кустарниках, на лесных тропах и опушках, в парках","Только в болотистой местности","В сухой степи без растительности"], correct: 1 },
  { q: "В какое время года риск укуса клеща наиболее высок?", options: ["Декабрь–февраль","Апрель–июнь и август–сентябрь","Только июль","Круглый год одинаков"], correct: 1 },
  { q: "Как чаще всего клещ попадает на человека?", options: ["Падает с дерева","Прицепляется с травы или кустарника на одежду/обувь","Прыгает с земли","Заносится домашними животными"], correct: 1 },
  { q: "Что нужно сделать сразу после обнаружения присосавшегося клеща?", options: ["Залить его маслом","Аккуратно удалить и поместить в контейнер","Прижечь йодом","Срочно принять антибиотик"], correct: 1 },
  { q: "Куда лучше всего обращаться для исследования клеща?", options: ["В продуктовый магазин","В лабораторию Роспотребнадзора","В аптеку","В ветеринарную клинику"], correct: 1 },
  { q: "Какие симптомы указывают на начало клещевого энцефалита?", options: ["Только боль в месте укуса","Высокая температура, головная боль, тошнота","Зуд и сыпь по всему телу","Кашель и насморк"], correct: 1 },
  { q: "Существует ли прививка против клещевого энцефалита?", options: ["Да, есть эффективные вакцины","Нет, только антибиотики","Есть, но она не помогает","Только народные средства"], correct: 0 },
  { q: "Кому рекомендуется вакцинация в первую очередь?", options: ["Только детям до 7 лет","Только пенсионерам","Жителям эндемичных районов, лесникам, туристам","Никому"], correct: 2 },
  { q: "Какая защита в лесу наиболее эффективна?", options: ["Короткие шорты","Светлая закрытая одежда + репелленты","Нательный крестик","Громкое пение"], correct: 1 },
  { q: "Что может назначить врач для экстренной профилактики?", options: ["Греющий компресс","Банки и горчичники","Иммуноглобулин","Слабительные"], correct: 2 }
];

let currentQ = 0, score = 0, userName = "", answers = [];

// Автообновление админ-панели
let autoUpdateInterval;

async function saveResultToFirebase(percent) {
  try {
    await db.collection("testResults").add({
      name: userName,
      date: new Date().toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
      score: percent,
      correct: score,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {}
}

async function showAllResults() {
  try {
    const snapshot = await db.collection("testResults").orderBy("timestamp", "desc").get();
    let html = `<p class="mb-4">Всего прохождений: ${snapshot.size}</p>`;

    snapshot.forEach(doc => {
      const r = doc.data();
      html += `
        <div class="p-4 bg-gray-50 rounded-2xl mb-3">
          <strong>${r.name}</strong><br>
          <small>${r.date}</small> — <span class="font-bold text-indigo-600">${r.score}%</span>
        </div>`;
    });

    document.getElementById('adminResults').innerHTML = html || '<p>Пока нет результатов</p>';
  } catch (e) {
    document.getElementById('adminResults').innerHTML = '<p>Ошибка загрузки</p>';
  }
}

function startQuiz() {
  userName = document.getElementById('userName').value.trim();
  if (!userName) return alert("Введите имя!");

  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.remove('hidden');
  document.getElementById('quizUser').textContent = userName;

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
    const label = document.createElement('label');
    label.className = "option-label";
    label.innerHTML = `<input type="radio" name="q${currentQ}" onchange="selectAnswer(${i})"> ${text}`;
    opts.appendChild(label);
  });

  document.getElementById('nextBtn').classList.add('hidden');
}

function selectAnswer(i) {
  answers[currentQ] = i;
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

  document.getElementById('resultMsg').textContent = percent >= 80 
    ? 'Отличный результат! 🏆' 
    : 'Есть над чем поработать 📚';

  await saveResultToFirebase(percent);
}

function loginAdmin() {
  const pass = document.getElementById('adminPass').value;
  if (pass === "sofr2928") {
    document.getElementById('adminContent').classList.remove('hidden');
    showAllResults();
    // Автообновление каждые 5 секунд
    if (!autoUpdateInterval) {
      autoUpdateInterval = setInterval(showAllResults, 5000);
    }
  } else {
    alert("Неверный пароль!");
  }
}

function restartQuiz() {
  location.reload();
}
