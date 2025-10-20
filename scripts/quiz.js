// ===============================
//  Southern African Assembly Knowledge Quiz
//  (with Save, Resume & Save & Exit Support)
// ===============================

const PASSING_SCORE = 70;
const TOTAL_LEVELS = 5;
let currentLevel = parseInt(localStorage.getItem("tsaaLevel")) || 1;
let currentQuestion = parseInt(localStorage.getItem("tsaaQuestion")) || 0;
let score = parseInt(localStorage.getItem("tsaaScore")) || 0;
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

// --- Header + Tracker ---
const playerWelcome = document.getElementById("playerWelcome");
const progressTracker = document.getElementById("progressTracker");

// --- Welcome screen elements ---
const welcomeScreen = document.getElementById("welcomeScreen");
const playerNameInput = document.getElementById("playerNameInput");
const startQuizBtn = document.getElementById("startQuizBtn");

// --- Returning user (Welcome Back) elements ---
const welcomeBackScreen = document.getElementById("welcomeBackScreen");
const returningName = document.getElementById("returningName");
const continueBtn = document.getElementById("continueBtn");
const restartFromBeginningBtn = document.getElementById("restartFromBeginningBtn");

// --- Create Save & Exit button dynamically ---
const saveExitBtn = document.createElement("button");
saveExitBtn.id = "saveExitBtn";
saveExitBtn.textContent = "Save & Exit";
saveExitBtn.style.background = "#ff9933";
saveExitBtn.style.color = "white";
saveExitBtn.style.border = "none";
saveExitBtn.style.borderRadius = "6px";
saveExitBtn.style.padding = "10px 24px";
saveExitBtn.style.cursor = "pointer";
saveExitBtn.style.margin = "15px 5px 0 5px";
saveExitBtn.style.transition = "background 0.3s ease";
saveExitBtn.addEventListener("mouseover", () => (saveExitBtn.style.background = "#e68a00"));
saveExitBtn.addEventListener("mouseout", () => (saveExitBtn.style.background = "#ff9933"));
saveExitBtn.addEventListener("click", saveAndExit);

// --- Handle welcome + returning players ---
document.addEventListener("DOMContentLoaded", () => {
  if (playerName) {
    returningName.textContent = playerName;
    welcomeBackScreen.classList.remove("hidden");
  } else {
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

  playerName = name;
  localStorage.setItem("playerName", playerName);
  welcomeScreen.classList.add("hidden");
  startQuiz();
});

// --- Returning player continues ---
continueBtn.addEventListener("click", () => {
  welcomeBackScreen.classList.add("hidden");
  startQuiz(true); // resume mode
});

// --- Returning player restarts ---
restartFromBeginningBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to start over from Level 1?")) {
    localStorage.clear();
    currentLevel = 1;
    currentQuestion = 0;
    score = 0;
    location.reload();
  }
});

// --- Start quiz (resume-aware) ---
function startQuiz(resume = false) {
  playerWelcome.textContent = `Welcome, ${playerName}!`;
  playerWelcome.classList.remove("hidden");

  updateProgressTracker();

  levelTitle.classList.remove("hidden");
  quizContainer.classList.remove("hidden");
  progressDiv.classList.remove("hidden");
  nextBtn.classList.remove("hidden");

  // Add Save & Exit button next to Next
  if (!document.getElementById("saveExitBtn")) {
    nextBtn.insertAdjacentElement("afterend", saveExitBtn);
  }

  loadLevel(currentLevel, resume);
}

// --- Load a specific level ---
function loadLevel(level, resume = false) {
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

      const savedSelections = JSON.parse(localStorage.getItem(`tsaaSelections_level${level}`)) || [];
      levelData.forEach((q, i) => {
        q.selected = savedSelections[i] !== undefined ? savedSelections[i] : null;
      });

      levelTitle.innerHTML = `Level ${data.level}: ${data.title}`;

      if (data.summary && !resume) {
        quizContainer.innerHTML = `
          <div class="summary-card">
            <h3>Hello ${playerName} 👋</h3>
            <p>${data.summary}</p>
            <button id="startLevelBtn">Start Level ${data.level}</button>
          </div>
        `;
        nextBtn.classList.add("hidden");
        saveExitBtn.classList.add("hidden");
        document.getElementById("startLevelBtn").addEventListener("click", () => {
          currentQuestion = 0;
          loadQuestion();
          nextBtn.classList.remove("hidden");
          saveExitBtn.classList.remove("hidden");
        });
        return;
      }

      loadQuestion(resume);
      nextBtn.classList.remove("hidden");
      saveExitBtn.classList.remove("hidden");
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
function loadQuestion(resume = false) {
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

    if (q.selected === i) btn.style.background = "#c5f2cc";

    btn.addEventListener("click", () => selectAnswer(i, btn));
    quizContainer.appendChild(btn);
  });

  nextBtn.disabled = true;
  if (q.selected !== null && q.selected !== undefined) nextBtn.disabled = false;
}

// --- Select answer and save progress ---
function selectAnswer(index, btn) {
  levelData[currentQuestion].selected = index;
  nextBtn.disabled = false;
  document.querySelectorAll(".option").forEach(opt => (opt.style.background = "#fff"));
  btn.style.background = "#c5f2cc";
  saveProgress();
}

// --- Save progress ---
function saveProgress() {
  localStorage.setItem("tsaaLevel", currentLevel);
  localStorage.setItem("tsaaQuestion", currentQuestion);
  localStorage.setItem("tsaaScore", score);

  const selections = levelData.map(q => q.selected);
  localStorage.setItem(`tsaaSelections_level${currentLevel}`, JSON.stringify(selections));
}

// --- Save & Exit functionality ---
function saveAndExit() {
  saveProgress();
  alert(`✅ Your progress has been saved, ${playerName}.\nYou can safely close this page and resume later.`);
  document.getElementById("container").innerHTML = `
    <h2 style="color:#0073aa;">Progress Saved!</h2>
    <p>Thank you, ${playerName}. You can come back anytime to continue your quiz.</p>
    <p style="font-size:0.9em; color:#444;">Close this tab or browser window now. Your progress is safely stored.</p>
  `;
}

// --- Handle Next button ---
nextBtn.addEventListener("click", () => {
  const current = levelData[currentQuestion];
  if (current.selected === current.correctIndex) score++;

  currentQuestion++;
  saveProgress();

  if (currentQuestion < levelData.length) {
    loadQuestion();
  } else {
    finishLevel();
  }
});

// --- Finish level ---
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
  saveExitBtn.classList.add("hidden");

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

  updateProgressTracker();

  if (percent >= PASSING_SCORE && currentLevel < TOTAL_LEVELS) {
    resultContainer.innerHTML += `
      <button id="nextLevelBtn">Next Level</button>
    `;
    document.getElementById("nextLevelBtn").addEventListener("click", () => {
      currentLevel++;
      currentQuestion = 0;
      score = 0;
      saveProgress();
      loadLevel(currentLevel);
    });
  }

  localStorage.removeItem("tsaaQuestion");
  localStorage.removeItem(`tsaaSelections_level${currentLevel}`);
}

// --- Restart level ---
restartBtn.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  saveProgress();
  loadLevel(currentLevel);
});

// --- Reset entire quiz ---
resetAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to restart the entire quiz from Level 1?")) {
    localStorage.clear();
    currentLevel = 1;
    currentQuestion = 0;
    score = 0;
    location.reload();
  }
});

// --- Progress tracker ---
function updateProgressTracker() {
  const completion = ((currentLevel - 1) / TOTAL_LEVELS) * 100;
  progressTracker.textContent = `🧭 Level ${currentLevel} of ${TOTAL_LEVELS} — ${Math.round(completion)}% Complete`;

  if (completion >= 100) {
    progressTracker.classList.add("complete");
  } else {
    progressTracker.classList.remove("complete");
  }

  progressTracker.classList.remove("hidden");
}
