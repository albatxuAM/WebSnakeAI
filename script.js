// Initialize UI based on current settings
function initialize() {
    // Set the values of the selectors based on the current settings
    document.querySelector("#game-mode").value = gameMode;
    document.querySelector("#ai-mode").value = aiMode;
    document.querySelector("#wall-mode").value = wallMode;
    //document.querySelector("#random-mode").value = randomMode;
    document.querySelector("#selection-mode").value = selectionMode;

    // Show or hide AI options based on game mode
    document.querySelector("#ai-selector").style.display = gameMode === "aiControlled" ? "block" : "none";
    document.querySelector("#details").style.visibility = gameMode === "aiControlled" ? "visible" : "hidden";

    // Show or hide additional AI details based on the AI mode
    document.querySelector("#details").style.visibility = aiMode === "neuralNetwork" ? "visible" : "hidden";
    //document.querySelector("#random-selector").style.display = aiMode === "neuralNetwork" ? "block" : "none";
    document.querySelector("#selection-selector").style.display = aiMode === "neuralNetwork" ? "block" : "none";
    document.querySelector("#wall-selector").style.display = aiMode != "neuralNetwork" ? "block" : "none";

    document.querySelector("#canvasBasicSnake").style.display = aiMode === "neuralNetwork" ? "none" : "block";
    document.querySelector("#canvas").style.display = aiMode === "neuralNetwork" ? "block" : "none";
}

function reset() {
    resetBasicSnake();

    if (aiMode === "neuralNetwork")
        resetGame();
}

function resetIA() {
    resetGame();
}

// Set up event listeners for each setting change
document.querySelector("#game-mode").addEventListener("change", (e) => {
    gameMode = e.target.value;
    // Update UI for AI selector visibility
    document.querySelector("#ai-selector").style.display = gameMode === "aiControlled" ? "block" : "none";
    document.querySelector("#details").style.visibility = aiMode === "neuralNetwork" ? "visible" : "hidden";
    //document.querySelector("#random-selector").style.display = aiMode === "neuralNetwork" ? "block" : "none";
    document.querySelector("#selection-selector").style.display = aiMode === "neuralNetwork" ? "block" : "none";
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
    //document.querySelector("#random-selector").style.display = aiMode === "neuralNetwork" ? "block" : "none";
    document.querySelector("#selection-selector").style.display = aiMode === "neuralNetwork" ? "block" : "none";
    document.querySelector("#wall-selector").style.display = aiMode != "neuralNetwork" ? "block" : "none";

    document.querySelector("#canvasBasicSnake").style.display = aiMode === "neuralNetwork" ? "none" : "block";
    document.querySelector("#canvas").style.display = aiMode === "neuralNetwork" ? "block" : "none";

    // Eliminar el foco del select
    e.target.blur();

    if (aiMode === "neuralNetwork") {
        //resetGame(); 
    } else {
        reset();
    }
});

document.querySelector("#wall-mode").addEventListener("change", (e) => {
    wallMode = e.target.value;

    // Eliminar el foco del select
    e.target.blur();

    reset();
});

//document.querySelector("#random-mode").addEventListener("change", (e) => {
//    randomMode = e.target.value;

//    // Eliminar el foco del select
//    e.target.blur();

//    resetIA();
//});

document.querySelector("#selection-mode").addEventListener("change", (e) => {
    selectionMode = e.target.value;

    PercentToKeep = parseInt(selectionMode) / 100;

    // Eliminar el foco del select
    e.target.blur();

    resetIA();
});

// Añadimos un event listener al botón de "RESTART"
document.querySelector("#replay").addEventListener("click", () => {
    // Comprobamos si el selector de IA está visible y si el modo IA está en "neuralNetwork"
    const isAIVisible = document.querySelector("#selection-selector").style.display === "block";

    // Si estamos en modo de IA "neuralNetwork" y el selector de IA está visible, reiniciamos el juego de IA
    if (aiMode === "neuralNetwork" && isAIVisible) {
        resetGame();  // Reinicia el juego IA
    } else {
        // Si no estamos en IA o el selector no está visible, solo reiniciamos el juego normal
        reset();
    }
});

// Initialize the UI when the page loads
initialize();

initializeBasicSnake();
startIAGame();

function startIAGame() {
    isIAGameStarted = true;
    setup();
}

