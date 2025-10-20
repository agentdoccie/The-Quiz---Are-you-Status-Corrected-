// ===============================
//  Southern African Assembly Knowledge Quiz
// ===============================

// --- Game configuration ---
const PASSING_SCORE = 70; // % required to pass each level
const TOTAL_LEVELS = 100; // scalability for future
let currentLevel = parseInt(localStorage.getItem("tsaaLevel")) || 1;
let currentQuestion = 0;
let score = 0;
let levelData = [];

// --- HTML elements ---
const quizContainer = document.getElementById("quiz");
const nextBtn = document.getElementById("nextBtn");
const resultContainer = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");
const progressBar = document.getElementById("progressBar");
const levelTitle = document.getElementById("levelTitle");

// --- Initialize on load ---
document.addEventListener("DOMContentLoaded", () => {
  loadLevel(currentLevel);
});

// --- Load a specific level ---
function loadLevel(level) {
  quizContainer.innerHTML = "";
  resultContainer.classList.add("hidden");
  restartBtn.classList.add("hidden");
  nextBtn.classList.add("hidden");
  progressBar.style.width = "0%";

  // ✅ Fetch the correct JSON file for the level
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

      // 🧾 Show Level Summary if available
      if (data.summary) {
        quizContainer.innerHTML = `
          <div class="summary-card">
            <h3>Level Overview</h3>
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

      // Otherwise load questions immediately
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

// --- Handle selecting an answer ---
function selectAnswer(index, btn) {
  levelData[currentQuestion].selected = index;
  nextBtn.disabled = false;
  document.querySelectorAll(".option").forEach(opt => (opt.style.background = "#fff"));
  btn.style.background = "#c5f2cc"; // green highlight
}

// --- Handle "Next" button ---
nextBtn.addEventListener("click", () => {
  const current = levelData[currentQuestion];
  if (current.selected === current.correctIndex) score++;
  currentQuestion++;

  if (currentQuestion < levelData.length) loadQuestion();
  else finishLevel();
});

// --- Calculate and display results ---
function finishLevel() {
  progressBar.style.width = "100%";
  const totalQuestions = levelData.length;
  const percent = (score / totalQuestions) * 100;

  // Save score for progress tracking
  let tsaaScores = JSON.parse(localStorage.getItem("tsaaScores")) || {};
  tsaaScores[`level${currentLevel}`] = percent;
  localStorage.setItem("tsaaScores", JSON.stringify(tsaaScores));

  quizContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
  restartBtn.classList.remove("hidden");
  resultContainer.classList.remove("hidden");

  let color = percent >= PASSING_SCORE ? "#d8f7d3" : "#f9d3d3";
  resultContainer.style.background = color;

  // Individual level feedback
  let feedback =
    percent >= 90
      ? "🌟 Outstanding! You’ve mastered this level with excellent accuracy."
      : percent >= 70
      ? "✅ Great job! You passed and are building strong understanding."
      : "⚠️ Keep practicing! Review your notes and try again.";

  // Calculate running average
  const levelsCompleted = Object.keys(tsaaScores).length;
  const total = Object.values(tsaaScores).reduce((a, b) => a + b, 0);
  const avg = total / levelsCompleted;
  const performance =
    avg >= 90
      ? "🌟 Excellent overall performance"
      : avg >= 70
      ? "✅ Solid progress — you’re understanding the principles well"
      : "⚠️ Keep learning — steady progress will pay off";

  // Display level results + progress
  resultContainer.innerHTML = `
    <h2>Level ${currentLevel} Complete</h2>
    <h3>Your Score: ${score} / ${totalQuestions} (${Math.round(percent)}%)</h3>
    <p>${feedback}</p>
    <hr>
    <h3>Current Progress Summary</h3>
    <p><strong>Levels Completed:</strong> ${levelsCompleted}</p>
    <p><strong>Average Score So Far:</strong> ${Math.round(avg)}%</p>
    <p>${performance}</p>
  `;

  // If this is Level 5 → show final summary
  if (currentLevel === 5) {
    const overall =
      avg >= 90
        ? "🌟 Exceptional! You have a deep understanding of lawful self-governance."
        : avg >= 70
        ? "✅ Strong performance — you’ve built a solid foundation."
        : "⚠️ Keep learning — review key topics and try again.";

    resultContainer.innerHTML += `
      <hr>
      <h2>Final Performance Summary</h2>
      <p><strong>Levels Completed:</strong> ${levelsCompleted} / 5</p>
      <p><strong>Average Score:</strong> ${Math.round(avg)}%</p>
      <p>${overall}</p>
      <p style="margin-top:15px;">Thank you for completing the Southern African Assembly Knowledge Quiz! 🇿🇦</p>
      <button id="resetBtn">Start Over</button>
    `;

    document.getElementById("resetBtn").addEventListener("click", () => {
      localStorage.removeItem("tsaaScores");
      localStorage.removeItem("tsaaLevel");
      currentLevel = 1;
      loadLevel(currentLevel);
    });
  } else if (percent >= PASSING_SCORE && currentLevel < TOTAL_LEVELS) {
    // Passed → move to next level
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

// --- Restart button ---
restartBtn.addEventListener("click", () => {
  loadLevel(currentLevel);
});
