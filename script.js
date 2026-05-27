// ================== ЗВУКИ ==================
const clickSound = new Audio('https://freesound.org/data/previews/66/66929_931655-lq.mp3');
const successSound = new Audio('https://freesound.org/data/previews/387/387186_7258992-lq.mp3');
const warningSound = new Audio('https://freesound.org/data/previews/276/276951_5121236-lq.mp3');

// ================== FIREBASE + ВОПРОСЫ (оставь как было) ==================

// ... (весь код Firebase и questions из предыдущей версии)

// ================== ТАЙМЕР С ЗВУКОМ ==================
function startTimer() {
  let timeLeft = 480;
  const timerEl = document.getElementById('timeLeft');

  timerInterval = setInterval(() => {
    timeLeft--;
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerEl.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;

    if (timeLeft === 60) warningSound.play();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Время вышло!");
      showResult();
    }
  }, 1000);
}

// ================== КЛИК ПО ОТВЕТУ ==================
function selectAnswer(index) {
  answers[currentQ] = index;
  clickSound.play();
  document.getElementById('nextBtn').classList.remove('hidden');
}

// ================== ЗАВЕРШЕНИЕ ТЕСТА ==================
async function showResult() {
  document.getElementById('quizScreen').classList.add('hidden');
  document.getElementById('resultScreen').classList.remove('hidden');

  // ... (подсчёт результата)

  if (percent >= 80) successSound.play();

  // ... (остальной код showResult)
}

// ================== ЗАПУСК ==================
window.onload = () => {
  loadWeather();
  loadLeaderboard();
};
