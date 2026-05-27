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
const questions = [ /* твои 10 вопросов */ ];

let currentQ = 0, score = 0, userName = "", answers = [];

// ... (все функции saveResultToFirebase, showAllResults и т.д. как раньше)

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
    let html = `<p class="mb-4">Всего прохождений: ${snapshot.size}</p>`;

    snapshot.forEach(doc => {
      const r = doc.data();
      html += `
        <div class="result-item">
          <div><strong>${r.name}</strong><br><small>${r.date}</small></div>
          <span class="font-bold text-emerald-600">${r.score}%</span>
        </div>`;
    });

    container.innerHTML = html || '<p>Пока нет результатов</p>';
  } catch (e) {
    container.innerHTML = '<p>Ошибка загрузки</p>';
  }
}

// Показ админ-панели
function showAdminPanel() {
  document.getElementById('resultScreen').classList.add('hidden');
  const pass = prompt("Введите пароль администратора:");
  if (pass === "sofr2928") {
    document.getElementById('adminContent').classList.remove('hidden');
    showAllResults();
  } else {
    alert("Неверный пароль!");
    document.getElementById('resultScreen').classList.remove('hidden');
  }
}

// Остальные функции (startQuiz, showQuestion, showResult и т.д.)
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
  circle.style.borderColor = percent >= 80 ? '#10b981' : '#eab308';

  document.getElementById('resultMsg').textContent = percent >= 80 
    ? 'Отличный результат! 🏆' 
    : 'Есть над чем поработать 📚';

  await saveResultToFirebase(percent);
}

function restartQuiz() {
  location.reload();
}
