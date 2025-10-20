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
  playerName = name;
  localStorage.setItem("playerName", playerName);
  welcomeScreen.classList.add("hidden");
  startQuiz();
});

// --- Returning player continues from saved progress ---
continueBtn.addEventListener("click", () => {
  welcomeBackScreen.classList.add("hidden");
  startQuiz();
});

// --- Returning player restarts from Level 1 ---
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
  loadLevel(currentLevel);
}
