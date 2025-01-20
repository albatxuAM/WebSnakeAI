
// Initialize UI based on current settings
function initialize() {
  // Set the values of the selectors based on the current settings
  document.querySelector("#game-mode").value = gameMode;
  document.querySelector("#ai-mode").value = aiMode;
  document.querySelector("#wall-mode").value = wallMode;

  // Show or hide AI options based on game mode
  document.querySelector("#ai-selector").style.display = gameMode === "aiControlled" ? "block" : "none";
  document.querySelector("#details").style.visibility = gameMode === "aiControlled" ? "visible" : "hidden";

  // Show or hide additional AI details based on the AI mode
  document.querySelector("#details").style.visibility = aiMode === "neuralNetwork" ? "visible" : "hidden";
}

function reset() {
  // This is just a placeholder for now
}

// Set up event listeners for each setting change
document.querySelector("#game-mode").addEventListener("change", (e) => {
  gameMode = e.target.value;
  // Update UI for AI selector visibility
  document.querySelector("#ai-selector").style.display = gameMode === "aiControlled" ? "block" : "none";
  document.querySelector("#details").style.visibility = gameMode === "aiControlled" ? "visible" : "hidden";
  reset();
});

document.querySelector("#ai-mode").addEventListener("change", (e) => {
  aiMode = e.target.value;
  document.querySelector("#details").style.visibility = aiMode === "neuralNetwork" ? "visible" : "hidden";
  reset();
});

document.querySelector("#wall-mode").addEventListener("change", (e) => {
  wallMode = e.target.value;
  reset();
});

// Initialize the UI when the page loads
initialize();

//initializeBasicSnake();
startIAGame();

function startIAGame() {
  isIAGameStarted = true;
  setup();
}