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
  {
    q: "Что является переносчиком клещевого энцефалита?",
    options: ["Комары", "Клещи", "Мухи", "Блохи"],
    correct: 1
  },
  {
    q: "В какое время года наиболее активны клещи?",
    options: ["Зима", "Весна и осень", "Только лето", "Круглый год"],
    correct: 1
  },
  {
    q: "Можно ли заразиться клещевым энцефалитом через молоко?",
    options: ["Нет", "Да, через сырое козье/коровье молоко", "Только через укус", "Только воздушно-капельным путём"],
    correct: 1
  },
  {
    q: "Какой метод удаления клеща правильный?",
    options: ["Выкручивать по часовой стрелке", "Выкручивать против часовой стрелки", "Сдавливать пальцами", "Прижигать"],
    correct: 1
  },
  {
    q: "Существует ли вакцина от клещевого энцефалита?",
    options: ["Нет", "Да", "Только для детей", "Только для пожилых"],
    correct: 1
  },
  {
    q: "Что делать сразу после укуса клеща?",
    options: ["Ничего не делать", "Удалить клеща и обработать место", "Сразу пить антибиотики", "Наложить повязку с маслом"],
    correct: 1
  },
  {
    q: "Какой цвет одежды лучше всего защищает от клещей?",
    options: ["Чёрный", "Светлый (белый, бежевый)", "Красный", "Зелёный"],
    correct: 1
  },
  {
    q: "Можно ли использовать масло или спирт для удаления клеща?",
    options: ["Да", "Нет, это опасно", "Только спирт", "Только масло"],
    correct: 1
  },
  {
    q: "Сколько дней обычно длится инкубационный период клещевого энцефалита?",
    options: ["1–3 дня", "7–14 дней", "1 месяц", "3 месяца"],
    correct: 1
  },
  {
    q: "Что является самым надёжным методом профилактики?",
    options: ["Репелленты", "Вакцинация + защита от укусов", "Только осмотр", "Антибиотики"],
    correct: 1
  }
];

let currentQ = 0, score = 0, userName = "", answers = [];

// ================== ФУНКЦИИ ==================
async function saveResultToFirebase(percent) {
  try {
    await db.collection("testResults").add({
      name: userName,
      date: new Date().toLocaleString('ru-RU'),
      score: percent,
      correct: score,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) { console.error(e); }
}

async function showAllResults() {
  const container = document.getElementById('adminResults');
  container.innerHTML = '<p>Загрузка...</p>';

  try {
    const snapshot = await db.collection("testResults").orderBy("timestamp", "desc").get();
    let html = `<p class="mb-4">Всего прохождений: ${snapshot.size}</p>`;

    snapshot.forEach(doc => {
      const r = doc.data();
      const docId = doc.id;
      html += `
        <div class="result-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #eee;">
          <div>
            <strong>${r.name}</strong><br>
            <small>${r.date}</small>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="font-bold text-emerald-600">${r.score}%</span>
            <button onclick="deleteResult('${docId}')" style="background:#ef4444; color:white; border:none; padding:6px 10px; border-radius:8px; cursor:pointer;">🗑️</button>
          </div>
        </div>`;
    });

    container.innerHTML = html || '<p>Пока нет результатов</p>';
  } catch (e) {
    container.innerHTML = '<p>Ошибка загрузки результатов</p>';
  }
}

function deleteResult(docId) {
  if (confirm("Удалить этот результат?")) {
    db.collection("testResults").doc(docId).delete().then(() => {
      showAllResults();
    });
  }
}

function exportToCSV() {
  alert("Экспорт в CSV будет добавлен в следующей версии.\nПока можно скопировать результаты вручную.");
  // Полноценный экспорт можно сделать позже
}

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

function hideAdminPanel() {
  document.getElementById('adminContent').classList.add('hidden');
  document.getElementById('resultScreen').classList.remove('hidden');
}

// ================== ОСНОВНЫЕ ФУНКЦИИ ТЕСТА ==================
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
