// ===============================
//  Southern African Assembly Knowledge Quiz
// ===============================

const PASSING_SCORE = 70;
const TOTAL_LEVELS = 100;
let currentLevel = parseInt(localStorage.getItem("tsaaLevel")) || 1;
let currentQuestion = 0;
let score = 0;
let levelData = [];
let playerName = localStorage.getItem("playerName") || "";

// --- HTML elements ---
const quizContainer = document.getElementById("quiz");
const nextBtn = document.getElementById("nextBtn");
const resultContainer = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");
const progressBar = document.getElementById("progressBar");
const levelTitle = document.getElementById("levelTitle");
const resetAllBtn = document.getElementById("resetAllBtn");
const progressDiv = document.getElementById("progress");

// --- Welcome screen elements ---
const welcomeScreen = document.getElementById("welcomeScreen");
const playerNameInput = document.getElementById("playerNameInput");
const startQuizBtn = document.getElementById("startQuizBtn");

// --- Returning user (Welcome Back) elements ---
const welcomeBackScreen = document.getElementById("welcomeBackScreen");
const returningName = document.getElementById("returningName");
const continueBtn = document.getElementById("continueBtn");
const restartFromBeginningBtn = document.getElementById("restartFromBeginningBtn");

// --- Handle welcome + returning players ---
document.addEventListener("DOMContentLoaded", () => {
  if (playerName) {
    // Returning player
    returningName.textContent = playerName;
    welcomeBackScreen.classList.remove("hidden");
  } else {
    // New player
    welcomeScreen.classList.remove("hidden");
  }
});

// --- New player starts quiz ---
startQuizBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (name.length < 2) {
    alert("Please enter your full name to continue.");
    return;
  }

  // Save player name
  playerName = name;
  localStorage.setItem("playerName", playerName);

  // Hide welcome and show quiz interface
  welcomeScreen.classList.add("hidden");
  welcomeBackScreen.classList.add("hidden");
  startQuiz();
});

// --- Returning player continues ---
continueBtn.addEventListener("click", () => {
  welcomeBackScreen.classList.add("hidden");
  startQuiz();
});

// --- Returning player restarts ---
restartFromBeginningBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to start over from Level 1?")) {
    localStorage.clear();
    currentLevel = 1;
    location.reload();
  }
});

// --- Function to start the quiz ---
function startQuiz() {
  levelTitle.classList.remove("hidden");
  quizContainer.classList.remove("hidden");
  progressDiv.classList.remove("hidden");
  nextBtn.classList.remove("hidden");

  // ✅ Now actually load the level
  loadLevel(currentLevel);
}

// --- Load a specific level ---
function loadLevel(level) {
  quizContainer.innerHTML = "";
  resultContainer.classList.add("hidden");
  restartBtn.classList.add("hidden");
  nextBtn.classList.add("hidden");
  progressBar.style.width = "0%";

  fetch(`questions/level${level}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`Level ${level} file not found`);
      return res.json();
    })
    .then(data => {
      levelData = data.questions;
      currentQuestion = 0;
      score = 0;
      levelTitle.innerHTML = `Level ${data.level}: ${data.title}`;

      // If there's a summary, show it before starting
      if (data.summary) {
        quizContainer.innerHTML = `
          <div class="summary-card">
            <h3>Hello ${playerName} 👋</h3>
            <p>${data.summary}</p>
            <button id="startLevelBtn">Start Level ${data.level}</button>
          </div>
        `;
        nextBtn.classList.add("hidden");

        document.getElementById("startLevelBtn").addEventListener("click", () => {
          loadQuestion();
          nextBtn.classList.remove("hidden");
        });
        return;
      }

      loadQuestion();
      nextBtn.classList.remove("hidden");
    })
    .catch(err => {
      quizContainer.innerHTML = `
        <p style="color:#b22222;">⚠️ Could not load Level ${level}.<br>
        Please ensure the file <strong>questions/level${level}.json</strong> exists.</p>
      `;
      console.error("Error loading level:", err);
    });
}

// --- Load one question at a time ---
function loadQuestion() {
  const q = levelData[currentQuestion];
  progressBar.style.width = `${(currentQuestion / levelData.length) * 100}%`;
  quizContainer.innerHTML = `
    <div class="question">
      <h3>Question ${currentQuestion + 1} of ${levelData.length}</h3>
      <p>${q.question}</p>
    </div>
  `;

  q.options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("option");
    btn.addEventListener("click", () => selectAnswer(i, btn));
    quizContainer.appendChild(btn);
  });

  nextBtn.disabled = true;
}

// --- Select answer ---
function selectAnswer(index, btn) {
  levelData[currentQuestion].selected = index;
  nextBtn.disabled = false;
  document.querySelectorAll(".option").forEach(opt => (opt.style.background = "#fff"));
  btn.style.background = "#c5f2cc";
}

// --- Handle "Next" button ---
nextBtn.addEventListener("click", () => {
  const current = levelData[currentQuestion];
  if (current.selected === current.correctIndex) score++;
  currentQuestion++;
  if (currentQuestion < levelData.length) loadQuestion();
  else finishLevel();
});

// --- Finish level + summary ---
function finishLevel() {
  progressBar.style.width = "100%";
  const totalQuestions = levelData.length;
  const percent = (score / totalQuestions) * 100;

  let tsaaScores = JSON.parse(localStorage.getItem("tsaaScores")) || {};
  tsaaScores[`level${currentLevel}`] = percent;
  localStorage.setItem("tsaaScores", JSON.stringify(tsaaScores));

  quizContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
  restartBtn.classList.remove("hidden");
  resultContainer.classList.remove("hidden");

  let color = percent >= PASSING_SCORE ? "#d8f7d3" : "#f9d3d3";
  resultContainer.style.background = color;

  let feedback =
    percent >= 90
      ? `🌟 Outstanding work, ${playerName}! You’ve mastered this level.`
      : percent >= 70
      ? `✅ Great job, ${playerName}! You passed this level.`
      : `⚠️ Keep studying, ${playerName} — try again soon.`;

  const levelsCompleted = Object.keys(tsaaScores).length;
  const total = Object.values(tsaaScores).reduce((a, b) => a + b, 0);
  const avg = total / levelsCompleted;

  resultContainer.innerHTML = `
    <h2>Level ${currentLevel} Complete</h2>
    <h3>Your Score: ${score} / ${totalQuestions} (${Math.round(percent)}%)</h3>
    <p>${feedback}</p>
    <hr>
    <p><strong>Levels Completed:</strong> ${levelsCompleted}</p>
    <p><strong>Average Score:</strong> ${Math.round(avg)}%</p>
  `;

  if (percent >= PASSING_SCORE && currentLevel < TOTAL_LEVELS) {
    resultContainer.innerHTML += `
      <button id="nextLevelBtn">Next Level</button>
    `;
    document.getElementById("nextLevelBtn").addEventListener("click", () => {
      currentLevel++;
      localStorage.setItem("tsaaLevel", currentLevel);
      loadLevel(currentLevel);
    });
  }
}

// --- Restart current level ---
restartBtn.addEventListener("click", () => {
  loadLevel(currentLevel);
});

// --- Reset the entire quiz ---
resetAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to restart the entire quiz from Level 1?")) {
    localStorage.clear();
    currentLevel = 1;
    location.reload();
  }
});
