// ===============================
// Southern African Assembly Knowledge Quiz
// Stable Load + Single Welcome Screen Fix
// ===============================

// --- Configuration ---
const PASSING_SCORE = 70;
const VOLUNTEER_TRIGGER = 80;
const TOTAL_LEVELS = 100;

// --- Universal base path for GitHub Pages ---
const basePath = window.location.pathname.includes("The-Quiz---Are-you-Status-Corrected-")
  ? "/The-Quiz---Are-you-Status-Corrected-/"
  : "/";

// --- State variables ---
let currentLevel = parseInt(localStorage.getItem("tsaaLevel")) || 1;
let currentQuestion = 0;
let score = 0;
let levelData = [];
let playerName = localStorage.getItem("playerName") || "";

// --- Elements ---
const quizContainer = document.getElementById("quiz");
const nextBtn = document.getElementById("nextBtn");
const resultContainer = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");
const progressBar = document.getElementById("progressBar");
const levelTitle = document.getElementById("levelTitle");

// --- Reference existing Welcome Screen (no duplicates) ---
let welcomeScreen = document.getElementById("welcomeScreen");

// If not present, create dynamically
if (!welcomeScreen) {
  welcomeScreen = document.createElement("div");
  welcomeScreen.id = "welcomeScreen";
  welcomeScreen.innerHTML = `
    <h2>Welcome to the Southern African Assembly Knowledge Quiz</h2>
    <p>Please enter your name to begin:</p>
    <input type="text" id="playerNameInput" placeholder="Your full name" />
    <button id="startQuizBtn">Start Quiz</button>
  `;
  document.getElementById("container").prepend(welcomeScreen);
}

// --- Initialize ---
document.addEventListener("DOMContentLoaded", () => {
  if (!playerName) {
    showWelcomeScreen();
  } else {
    startQuiz();
  }
});

// --- Welcome Screen Logic ---
function showWelcomeScreen() {
  quizContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");
  resultContainer.classList.add("hidden");
  welcomeScreen.classList.remove("hidden");

  const startBtn = document.getElementById("startQuizBtn");
  if (startBtn) {
    startBtn.onclick = () => {
      const nameInput = document.getElementById("playerNameInput").value.trim();
      if (nameInput.length < 2) {
        alert("Please enter your full name to continue.");
        return;
      }
      playerName = nameInput;
      localStorage.setItem("playerName", playerName);
      welcomeScreen.classList.add("hidden");
      startQuiz();
    };
  }
}

// --- Core Game Start ---
function startQuiz() {
  quizContainer.classList.remove("hidden");
  loadLevel(currentLevel);
}

// --- Load a specific level (robust for GitHub Pages) ---
function loadLevel(level) {
  quizContainer.classList.remove("hidden");
  resultContainer.classList.add("hidden");
  restartBtn.classList.add("hidden");
  nextBtn.classList.add("hidden");
  progressBar.style.width = "0%";
  quizContainer.innerHTML = "";

  fetch(`${basePath}questions/level${level}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`Level ${level} file not found`);
      return res.json();
    })
    .then(data => {
      levelData = data.questions || [];
      currentQuestion = 0;
      score = 0;

      if (levelTitle) {
        levelTitle.innerHTML = `Level ${data.level}: ${data.title || ""}`;
      }

      if (data.summary) {
        quizContainer.innerHTML = `
          <div class="summary-card">
            <h3>Level Overview</h3>
            <p>${data.summary}</p>
            <button id="startLevelBtn">Start Level ${data.level}</button>
          </div>
        `;
        nextBtn.classList.add("hidden");
        const startBtn = document.getElementById("startLevelBtn");
        if (startBtn) {
          startBtn.addEventListener("click", () => {
            nextBtn.classList.remove("hidden");
            loadQuestion();
          });
        }
        return;
      }

      loadQuestion();
      nextBtn.classList.remove("hidden");
    })
    .catch(err => {
      console.error("Error loading level:", err);
      quizContainer.innerHTML = `
        <p style="color:#b22222;">⚠️ Could not load Level ${level}.<br>
        Please ensure the file <strong>questions/level${level}.json</strong> exists.</p>
      `;
      nextBtn.classList.add("hidden");
      resultContainer.classList.add("hidden");
      restartBtn.classList.remove("hidden");
    });
}

// --- Display Questions ---
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

// --- Handle Answer Selection ---
function selectAnswer(index, btn) {
  levelData[currentQuestion].selected = index;
  nextBtn.disabled = false;
  document.querySelectorAll(".option").forEach(opt => (opt.style.background = "#fff"));
  btn.style.background = "#c5f2cc";
}

// --- Next Question / Level Progression ---
nextBtn.addEventListener("click", () => {
  const current = levelData[currentQuestion];
  if (current.selected === current.correctIndex) score++;
  currentQuestion++;

  if (currentQuestion < levelData.length) loadQuestion();
  else finishLevel();
});

// --- Level Completion ---
function finishLevel() {
  progressBar.style.width = "100%";
  const total = levelData.length;
  const percent = (score / total) * 100;

  quizContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  restartBtn.classList.remove("hidden");

  let color = percent >= PASSING_SCORE ? "#d8f7d3" : "#f9d3d3";
  resultContainer.style.background = color;

  let feedback =
    percent >= 90
      ? "🌟 Excellent! You’ve mastered this level."
      : percent >= 70
      ? "✅ Great job! You passed and built strong understanding."
      : "⚠️ Keep going! Try again for a higher score.";

  resultContainer.innerHTML = `
    <h2>Level ${currentLevel} Complete</h2>
    <p>Well done, ${playerName}!</p>
    <h3>Your Score: ${score}/${total} (${Math.round(percent)}%)</h3>
    <p>${feedback}</p>
  `;

  // Volunteer popup
  if (percent >= VOLUNTEER_TRIGGER) {
    setTimeout(() => {
      if (confirm("Wow you really understand all this! Have you thought about being a volunteer for the Assembly?")) {
        window.open("https://thesouthafricanassembly.org/contact-us/", "_blank");
      } else {
        alert("👍 Maybe in the future! Let's hammer on and see what else you know!");
      }
    }, 300);
  }

  // Save score
  let tsaaScores = JSON.parse(localStorage.getItem("tsaaScores")) || {};
  tsaaScores[`level${currentLevel}`] = percent;
  localStorage.setItem("tsaaScores", JSON.stringify(tsaaScores));

  // Next level button
  if (percent >= PASSING_SCORE && currentLevel < TOTAL_LEVELS) {
    resultContainer.innerHTML += `<button id="nextLevelBtn">Next Level</button>`;
    document.getElementById("nextLevelBtn").addEventListener("click", () => {
      currentLevel++;
      localStorage.setItem("tsaaLevel", currentLevel);
      loadLevel(currentLevel);
    });
  }
}

// --- Restart Level ---
restartBtn.addEventListener("click", () => {
  loadLevel(currentLevel);
});

// --- Full Reset (Safe Mode) ---
const resetAllBtn = document.getElementById("resetAllBtn");
if (resetAllBtn) {
  resetAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to restart from Level 1?")) {
      localStorage.clear();
      currentLevel = 1;
      currentQuestion = 0;
      showWelcomeScreen();
    }
  });
}
