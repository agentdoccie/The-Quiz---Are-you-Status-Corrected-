// --- Calculate score and display results ---
function finishLevel() {
  progressBar.style.width = "100%";
  const totalQuestions = levelData.length;
  const percent = (score / totalQuestions) * 100;

  // Save score for summary
  let tsaaScores = JSON.parse(localStorage.getItem("tsaaScores")) || {};
  tsaaScores[`level${currentLevel}`] = percent;
  localStorage.setItem("tsaaScores", JSON.stringify(tsaaScores));

  quizContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
  restartBtn.classList.remove("hidden");
  resultContainer.classList.remove("hidden");

  let color = percent >= PASSING_SCORE ? "#d8f7d3" : "#f9d3d3";
  resultContainer.style.background = color;

  // Determine level summary message
  let feedback =
    percent >= 90
      ? "🌟 Outstanding! You’ve mastered this level with excellent accuracy."
      : percent >= 70
      ? "✅ Great job! You passed and are building strong understanding."
      : "⚠️ Keep practicing! Review your notes and try again.";

  // --- Calculate running average across all completed levels ---
  const levelsCompleted = Object.keys(tsaaScores).length;
  const total = Object.values(tsaaScores).reduce((a, b) => a + b, 0);
  const avg = total / levelsCompleted;
  const performance =
    avg >= 90
      ? "🌟 Excellent overall performance"
      : avg >= 70
      ? "✅ Solid progress — you’re understanding the principles well"
      : "⚠️ Keep learning — steady progress will pay off";

  // Show level summary and current overall performance
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

  // If this is the final level (Level 5), show final message
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
    // Continue to next level if passed
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
