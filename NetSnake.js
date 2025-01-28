var canvas_width;
var canvas_height;
var details;
var geneticAlgorithm;
const BLOCK_SIZE = 20;

let isIAGameStarted = false;

let randomMode = "p5";         // "math"
let selectionMode = "10"; 

function setup() {
    canvas_width = 400;
    canvas_height = 400;
    adjustCanvasSize();
    tf.setBackend("cpu");

    geneticAlgorithm = new GeneticAlgorithm();

    // Query and store references to the DOM elements
    scoreElement = document.querySelector("#score");
    maxScoreElement = document.querySelector("#max-score");
    generationCountElement = document.querySelector("#generation-count");
    maxAllTimeElement = document.querySelector("#max-all-time");
    populationCountElement = document.querySelector("#population-count");
    populationMaxElement = document.querySelector("#population-max"); 
    percentToKeepElement = document.querySelector("#percentage-max"); 

    let newCanvas = createCanvas(canvas_width, canvas_height);
    newCanvas.parent(document.querySelector("#canvas")); 
    frameRate(300);
}

function adjustCanvasSize() {
  if (canvas_width % BLOCK_SIZE != 0) {
    canvas_width =
      Math.floor(canvas_width / BLOCK_SIZE) * BLOCK_SIZE + BLOCK_SIZE;
  }

  if (canvas_height % BLOCK_SIZE != 0) {
    canvas_height =
      Math.floor(canvas_height / BLOCK_SIZE) * BLOCK_SIZE + BLOCK_SIZE;
  }
}

function draw() {
    //helpers.drawGrid();
    background(color(0, 0, 0));
    geneticAlgorithm.draw();
    // Update the values directly by using the stored DOM elements
    if (aiMode == "neuralNetwork") 
      scoreElement.textContent = geneticAlgorithm.maxGame();
    maxScoreElement.textContent = geneticAlgorithm.maxGame();
    generationCountElement.textContent = geneticAlgorithm.generation_count;
    maxAllTimeElement.textContent = geneticAlgorithm.bestAllTime;
    populationCountElement.textContent = geneticAlgorithm.population.length;
    populationMaxElement.textContent = POPULATION_MAX;
    percentToKeepElement.textContent = parseInt(selectionMode);
}

function handle_keyboard() {
  if (keyIsDown(LEFT_ARROW) && snake.direction != RIGHT) {
    snake.moveLeft();
  } else if (keyIsDown(RIGHT_ARROW) && snake.direction != LEFT) {
    snake.moveRight();
  } else if (keyIsDown(UP_ARROW) && snake.direction != DOWN) {
    snake.moveUp();
  } else if (keyIsDown(DOWN_ARROW) && snake.direction != UP) {
    snake.moveDown();
  } else {
    snake.moveDefualt();
  }
}