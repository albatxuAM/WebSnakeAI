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
  document.querySelector("#random-selector").style.display = aiMode === "neuralNetwork" ? "block" : "none";
  document.querySelector("#wall-selector").style.display = aiMode != "neuralNetwork" ? "block" : "none";

  document.querySelector("#canvasBasicSnake").style.display = aiMode === "neuralNetwork" ? "none" : "block";
  document.querySelector("#canvas").style.display = aiMode === "neuralNetwork" ? "block" : "none";
}

function reset() {
  // This is just a placeholder for now
  resetBasicSnake();
}

// Set up event listeners for each setting change
document.querySelector("#game-mode").addEventListener("change", (e) => {
  gameMode = e.target.value;
  // Update UI for AI selector visibility
  document.querySelector("#ai-selector").style.display = gameMode === "aiControlled" ? "block" : "none";
  document.querySelector("#details").style.visibility = gameMode === "aiControlled" ? "visible" : "hidden";
  document.querySelector("#random-selector").style.display = gameMode === "aiControlled" ? "block" : "none";
  document.querySelector("#wall-selector").style.display = gameMode != "aiControlled" ? "block" : "none";
  
  document.querySelector("#canvasBasicSnake").style.display = gameMode === "aiControlled" ? "none" : "block";
  document.querySelector("#canvas").style.display = gameMode === "aiControlled" ? "block" : "none";

  // Eliminar el foco del select
  e.target.blur();
  
  reset();
});

document.querySelector("#ai-mode").addEventListener("change", (e) => {
  aiMode = e.target.value;
  document.querySelector("#details").style.visibility = aiMode === "neuralNetwork" ? "visible" : "hidden";
  document.querySelector("#random-selector").style.display = aiMode === "neuralNetwork" ? "block" : "none";
  document.querySelector("#wall-selector").style.display = aiMode != "neuralNetwork" ? "block" : "none";

  document.querySelector("#canvasBasicSnake").style.display = aiMode === "neuralNetwork" ? "none" : "block";
  document.querySelector("#canvas").style.display = aiMode === "neuralNetwork" ? "block" : "none";

  // Eliminar el foco del select
  e.target.blur();

  reset();
});

document.querySelector("#wall-mode").addEventListener("change", (e) => {
  wallMode = e.target.value;

  // Eliminar el foco del select
  e.target.blur();
  
  reset();
});

// Initialize the UI when the page loads
initialize();

initializeBasicSnake();
startIAGame();

function startIAGame() {
  isIAGameStarted = true;
  setup();
}