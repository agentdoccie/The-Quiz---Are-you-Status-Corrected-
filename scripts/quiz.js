// ===============================
//  TSAA Interactive Quiz Script
// ===============================

// --- Game configuration ---
const PASSING_SCORE = 70; // percentage required to unlock next level
const TOTAL_LEVELS = 100; // scalability up to 100 levels
let currentLevel = parseInt(localStorage.getItem("tsaaLevel")) || 1;
let currentQuestion = 0;
let score = 0;
let levelData = [];

// --- Elements from HTML ---
const quizContainer = document.getElementById("quiz");
const nextBtn = document.getElementById("nextBtn");
const resultContainer = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");
const progressBar = document.getElementById("progressBar");
const levelTitle = document.getElementById("levelTitle");

// --- Load current level when the page loads ---
document.addEventListener("DOMContentLoaded", () => {
  loadLevel(currentLevel);
});

// --- Fetch and load a level JSON file ---
function loadLevel(level) {
  fetch(`questions/level${level}.json`)
    .then(res => {
      if (!res.ok) throw new Error("Level file not found");
      return res.json();
    })
    .then(data => {
      levelData = data.questions;
      currentQuestion = 0;
      score = 0;

      // Update the title bar
      levelTitle.innerHTML = `Level ${data.level}: ${data.title}`;

      // Reset UI elements
      quizContainer.classList.remove("hidden");
      resultContainer.classList.add("hidden");
      restartBtn.classList.add("hidden");
      nextBtn.classList.remove("hidden");
      nextBtn.disabled = true; // reset state
      progressBar.style.width = "0%";

      // --- Handle Summary Card ---
      if (data.summary) {
        quizContainer.innerHTML = `
          <div class="summary-card">
            <h3>Level Overview</h3>
            <p>${data.summary}</p>
            <button id="startLevelBtn">Start Level ${data.level}</button>
          </div>
        `;

        // Hide "Next" button until quiz starts
        nextBtn.classList.add("hidden");

        document
          .getElementById("startLevelBtn")
          .addEventListener("click", () => {
            nextBtn.classList.remove("hidden");
            loadQuestion();
          });

        return; // stop until "Start Level" clicked
      }

      // If no summary, load questions immediately
      loadQuestion();
    })
    .catch(err => {
      quizContainer.innerHTML = `<p>⚠️ Could not load level ${level}. 
        Please ensure the file <strong>questions/level${level}.json</strong> exists.</p>`;
      console.error(err);
    });
}

// --- Display one question at a time ---
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

// --- Handle answer selection ---
function selectAnswer(index, btn) {
  levelData[currentQuestion].selected = index;
  nextBtn.disabled = false;
  document.querySelectorAll(".option").forEach(opt => (opt.style.background = "#fff"));
  btn.style.background = "#c5f2cc"; // highlight selected
}

// --- Handle "Next" button ---
nextBtn.addEventListener("click", () => {
  const current = levelData[currentQuestion];
  if (current.selected === current.correctIndex) score++;
  currentQuestion++;
  if (currentQuestion < levelData.length) loadQuestion();
  else finishLevel();
});

// --- Calculate score and display results ---
function finishLevel() {
  progressBar.style.width = "100%";
  const totalQuestions = levelData.length;
  const percent = (score / totalQuestions) * 100;

  quizContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
  restartBtn.classList.remove("hidden");
  resultContainer.classList.remove("hidden");

  let color = percent >= PASSING_SCORE ? "#d8f7d3" : "#f9d3d3";
  resultContainer.style.background = color;

  let nextLevelBtn = "";
  if (percent >= PASSING_SCORE && currentLevel < TOTAL_LEVELS) {
    nextLevelBtn = `<button id="nextLevelBtn">Next Level</button>`;
  }

  resultContainer.innerHTML = `
    <h2>Level ${currentLevel} Complete</h2>
    <h3>Your Score: ${score} / ${totalQuestions} (${Math.round(percent)}%)</h3>
    <p>${percent >= PASSING_SCORE 
      ? "🎉 Congratulations! You passed and unlocked the next level." 
      : "❌ You did not reach the passing score. Try again!"}</p>
    ${nextLevelBtn}
  `;

  // --- Handle next level progression ---
  if (percent >= PASSING_SCORE && currentLevel < TOTAL_LEVELS) {
    const btn = document.getElementById("nextLevelBtn");
    btn.addEventListener("click", () => {
      currentLevel++;
      localStorage.setItem("tsaaLevel", currentLevel);
      loadLevel(currentLevel);
    });
  }
}

// --- Restart button ---
restartBtn.addEventListener("click", () => {
  loadLevel(currentLevel);
});
