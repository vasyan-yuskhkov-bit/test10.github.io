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
const questions = [ /* все 10 вопросов */ 
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

// ================== ПРИВИВКА ==================
async function answerVaccine(yes) {
  if (hasVoted) return;
  hasVoted = true;

  document.getElementById('btnYes').disabled = true;
  document.getElementById('btnNo').disabled = true;
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
    statsEl.innerHTML = `
      <strong>Статистика прививок:</strong><br>
      ✅ Да — ${yesPercent}% (${yesCount} чел.) &nbsp;&nbsp; 
      ❌ Нет — ${100 - yesPercent}% (${total - yesCount} чел.)
    `;
  } catch (e) {
    statsEl.textContent = "Статистика обновляется...";
  }
}

// ================== ПОГОДА (улучшено) ==================
async function loadWeather() {
  const weatherEl = document.getElementById('weather');
  weatherEl.textContent = '🌡️ Загрузка...';
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.95&longitude=92.35&current_weather=true', { 
      method: 'GET',
      cache: 'no-cache'
    });
    const data = await res.json();
    const temp = Math.round(data.current_weather.temperature);
    weatherEl.innerHTML = `🌡️ Дивногорск: <strong>${temp}°C</strong>`;
  } catch (e) {
    weatherEl.innerHTML = `🌡️ Дивногорск: <strong>— °C</strong>`;
  }
}

// ================== АДМИН ==================
function loginAdmin() {
  const pass = prompt("Введите пароль администратора:");
  if (pass === "sofr2928") {
    document.getElementById('adminContent').classList.remove('hidden');
    showAllResults();
  } else {
    alert("Неверный пароль!");
  }
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

// (остальные функции showQuestion, selectAnswer, nextQuestion, showResult и т.д. — оставлены как в предыдущей версии)

window.onload = () => {
  loadWeather();
  loadLeaderboard();
  loadVaccineStats();
};
