let dom_replay = document.querySelector("#replay");
let dom_score = document.querySelector("#score");
let dom_canvas = document.createElement("canvas");
document.querySelector("#canvasBasicSnake").appendChild(dom_canvas);
let CTX = dom_canvas.getContext("2d");

const W = (dom_canvas.width = 400);
const H = (dom_canvas.height = 400);

let gameMode = "aiControlled";  // "userControlled"
let aiMode = "neuralNetwork";   // "random"
let wallMode = "block";         // "wrap"

const directions = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

let snakeBasic,
  food,
  currentHue,
  cells = 20,
  cellSize,
  isGameOver = false,
  tails = [],
  score = 00,
  maxScore = window.localStorage.getItem("maxScore") || undefined,
  particles = [],
  splashingParticleCount = 20,
  cellsCount,
  requestID;

let helpers = {
  Vec: class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
    mult(v) {
      if (v instanceof helpers.Vec) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
      } else {
        this.x *= v;
        this.y *= v;
        return this;
      }
    }
  },
  isCollision(v1, v2) {
    return v1.x == v2.x && v1.y == v2.y;
  },
  garbageCollector() {
    for (let i = 0; i < particles.length; i++) {
      if (particles[i].size <= 0) {
        particles.splice(i, 1);
      }
    }
  },
  drawGrid() {
    CTX.lineWidth = 1.1;
    CTX.strokeStyle = "#232332";
    CTX.shadowBlur = 0;
    for (let i = 1; i < cells; i++) {
      let f = (W / cells) * i;
      CTX.beginPath();
      CTX.moveTo(f, 0);
      CTX.lineTo(f, H);
      CTX.stroke();
      CTX.beginPath();
      CTX.moveTo(0, f);
      CTX.lineTo(W, f);
      CTX.stroke();
      CTX.closePath();
    }
  },
  randHue() {
    return ~~(Math.random() * 360);
  },
  hsl2rgb(hue, saturation, lightness) {
    if (hue == undefined) {
      return [0, 0, 0];
    }
    var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    var huePrime = hue / 60;
    var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = ~~huePrime;
    var red;
    var green;
    var blue;

    if (huePrime === 0) {
      red = chroma;
      green = secondComponent;
      blue = 0;
    } else if (huePrime === 1) {
      red = secondComponent;
      green = chroma;
      blue = 0;
    } else if (huePrime === 2) {
      red = 0;
      green = chroma;
      blue = secondComponent;
    } else if (huePrime === 3) {
      red = 0;
      green = secondComponent;
      blue = chroma;
    } else if (huePrime === 4) {
      red = secondComponent;
      green = 0;
      blue = chroma;
    } else if (huePrime === 5) {
      red = chroma;
      green = 0;
      blue = secondComponent;
    }

    var lightnessAdjustment = lightness - chroma / 2;
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    return [
      Math.round(red * 255),
      Math.round(green * 255),
      Math.round(blue * 255)
    ];
  },
  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }
};

let KEY = {
  ArrowUp: false,
  ArrowRight: false,
  ArrowDown: false,
  ArrowLeft: false,
  resetState() {
    this.ArrowUp = false;
    this.ArrowRight = false;
    this.ArrowDown = false;
    this.ArrowLeft = false;
  },
  listen() {
    addEventListener(
      "keydown",
      (e) => {
        if (e.key === "ArrowUp" && this.ArrowDown) return;
        if (e.key === "ArrowDown" && this.ArrowUp) return;
        if (e.key === "ArrowLeft" && this.ArrowRight) return;
        if (e.key === "ArrowRight" && this.ArrowLeft) return;
        this[e.key] = true;
        Object.keys(this)
          .filter((f) => f !== e.key && f !== "listen" && f !== "resetState")
          .forEach((k) => {
            this[k] = false;
          });
      },
      false
    );
  }
};

class SnakeBasic {
  constructor(i, type) {
    this.pos = new helpers.Vec(W / 2, H / 2);
    this.dir = new helpers.Vec(0, 0);
    this.type = type;
    this.index = i;
    this.delay = 5;
    this.size = W / cells;
    this.color = "white";
    this.history = [];
    this.total = 1;
    // Estado inicial
    this.state = "SEARCH_FOOD";
  }
  draw() {
    let { x, y } = this.pos;
    CTX.fillStyle = this.color;
    CTX.shadowBlur = 20;
    CTX.shadowColor = "rgba(255,255,255,.3 )";
    CTX.fillRect(x, y, this.size, this.size);
    CTX.shadowBlur = 0;
    if (this.total >= 2) {
      for (let i = 0; i < this.history.length - 1; i++) {
        let { x, y } = this.history[i];
        CTX.lineWidth = 1;
        CTX.fillStyle = "rgba(225,225,225,1)";
        CTX.fillRect(x, y, this.size, this.size);
      }
    }
  }
  walls() {
    let { x, y } = this.pos;
    if (wallMode === "wrap") {
      if (x + cellSize > W) {
        this.pos.x = 0;
      }
      if (y + cellSize > W) {
        this.pos.y = 0;
      }
      if (y < 0) {
        this.pos.y = H - cellSize;
      }
      if (x < 0) {
        this.pos.x = W - cellSize;
      }
    }
    else if (wallMode === "block") {
      if (x < 0 || x >= W || y < 0 || y >= H) {
        isGameOver = true;
      }
    }
  }
  controlls() {
    let dir = this.size;
    if (gameMode === "userControlled") {
      if (KEY.ArrowUp) {
        this.dir = new helpers.Vec(0, -dir);
      }
      if (KEY.ArrowDown) {
        this.dir = new helpers.Vec(0, dir);
      }
      if (KEY.ArrowLeft) {
        this.dir = new helpers.Vec(-dir, 0);
      }
      if (KEY.ArrowRight) {
        this.dir = new helpers.Vec(dir, 0);
      }
    } else if (gameMode === "aiControlled") {
      if (aiMode === "random") {
        // Movimiento aletorio IA: evita moverse en la dirección opuesta
        let possibleMoves = [];
        let dir = this.size;

        // Verifica las direcciones válidas según la dirección actual
        if (!(this.dir.x === 0 && this.dir.y === dir)) { // No está bajando
          possibleMoves.push(new helpers.Vec(0, -dir)); // Arriba
        }
        if (!(this.dir.x === 0 && this.dir.y === -dir)) { // No está subiendo
          possibleMoves.push(new helpers.Vec(0, dir)); // Abajo
        }
        if (!(this.dir.x === dir && this.dir.y === 0)) { // No está yendo a la derecha
          possibleMoves.push(new helpers.Vec(-dir, 0)); // Izquierda
        }
        if (!(this.dir.x === -dir && this.dir.y === 0)) { // No está yendo a la izquierda
          possibleMoves.push(new helpers.Vec(dir, 0)); // Derecha
        }

        // Elige una dirección aleatoria válida
        this.dir = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

      } else if (aiMode === "stateMachine") {
         this.stateMachineMovement();
      }
      /*
      else if (aiMode === "neuralNetwork") {
        this.neuralNetworkMovement();
      }
        */
    }
  }
  selfCollision() {
    for (let i = 0; i < this.history.length; i++) {
      let p = this.history[i];
      if (helpers.isCollision(this.pos, p)) {
        isGameOver = true;
      }
    }
  }
  update() {
    this.walls();
    this.draw();
    this.controlls();
    if (!this.delay--) {
      if (helpers.isCollision(this.pos, food.pos)) {
        incrementScore();
        particleSplash();
        food.spawn();
        this.total++;
      }
      this.history[this.total - 1] = new helpers.Vec(this.pos.x, this.pos.y);
      for (let i = 0; i < this.total - 1; i++) {
        this.history[i] = this.history[i + 1];
      }
      this.pos.add(this.dir);
      this.delay = 5;
      this.total > 3 ? this.selfCollision() : null;
    }
  }

   stateMachineMovement() {
    console.log(`Estado actual: ${this.state}`);  // Log del estado actual

    switch (this.state) {
      case "SEARCH_FOOD":
        console.log("Transición al estado: SEARCH_FOOD");
        this.searchFood();
        break;

      case "AVOID_COLLISIONS":
        console.log("Transición al estado: AVOID_COLLISIONS");
        this.avoidCollisions();
        break;

      case "BLOCKED":
        console.log("Transición al estado: BLOCKED");
        this.blockedState();
        break;
      default:
        console.log("Estado desconocido");
    }
  }

  // Buscar comida: intenta moverse hacia la comida
  searchFood() {
      const dir = this.size;
      console.log("Buscando comida...");

      if (this.pos.x < food.pos.x) {
          this.dir = new helpers.Vec(dir, 0); // Mover hacia la derecha
          console.log("Moviendo hacia la derecha");
      } else if (this.pos.x > food.pos.x) {
          this.dir = new helpers.Vec(-dir, 0); // Mover hacia la izquierda
          console.log("Moviendo hacia la izquierda");
      } else if (this.pos.y < food.pos.y) {
          this.dir = new helpers.Vec(0, dir); // Mover hacia abajo
          console.log("Moviendo hacia abajo");
      } else {
          this.dir = new helpers.Vec(0, -dir); // Mover hacia arriba
          console.log("Moviendo hacia arriba");
      }

      // Comprobamos si hay una posible colisión y cambiamos de estado
      if (this.isBlocked()) {
          console.log("Estado bloqueado, cambiando a AVOID_COLLISIONS");
          this.state = "AVOID_COLLISIONS";
      }
  }

  // Evitar colisiones: Cambia de dirección si la IA va a chocar
  avoidCollisions() {
      const dir = this.size;
      console.log("Evitando colisiones...");

      if (this.isCollisionAhead()) {
          console.log("Colisión inminente detectada, evitando...");
          // Si hay una colisión inminente, cambiamos de dirección
          this.dir = this.getAvoidDirection();
      } else {
          // Si no hay colisiones, volvemos al estado de búsqueda de comida
          console.log("No hay colisiones, cambiando al estado SEARCH_FOOD");
          this.state = "SEARCH_FOOD";
      }
  }

  // Si la IA está bloqueada (no puede moverse), toma una acción aleatoria
 blockedState() {
    const dir = this.size;
    console.log("IA bloqueada, tomando acción aleatoria");

    // Direcciones posibles para la IA
    const possibleDirections = [
        new helpers.Vec(dir, 0),   // Derecha
        new helpers.Vec(-dir, 0),  // Izquierda
        new helpers.Vec(0, dir),   // Abajo
        new helpers.Vec(0, -dir)   // Arriba
    ];

    // Filtramos la dirección opuesta a la dirección actual
    const filteredDirections = possibleDirections.filter(direction => {
        return !(this.dir.x === -direction.x && this.dir.y === -direction.y);
    });

    // Elegimos una dirección aleatoria entre las direcciones filtradas
    this.dir = filteredDirections[Math.floor(Math.random() * filteredDirections.length)];

    // Cambiamos al estado de búsqueda de comida después de moverse
    console.log("Moviendo aleatoriamente y regresando al estado SEARCH_FOOD");
    this.state = "SEARCH_FOOD";
  }

  // New method to check if the snake is blocked (facing an obstacle)
  isBlocked() {
    const futurePos = new helpers.Vec(this.pos.x + this.dir.x, this.pos.y + this.dir.y);
    return this.isOutOfBounds(futurePos) || this.isSelfCollision(futurePos);
  }

  // Función que determina si hay una colisión inminente (con el borde o el cuerpo de la serpiente)
  isCollisionAhead() {
    const futurePos = new helpers.Vec(this.pos.x + this.dir.x, this.pos.y + this.dir.y);
    // Verifica si la nueva posición está fuera de los límites o si colisiona con el cuerpo
    if (this.isOutOfBounds(futurePos) || this.isSelfCollision(futurePos)) {
      return true;
    }
    return false;
  }

  // Comprobar si la nueva posición está fuera de los límites de la pantalla
  isOutOfBounds(pos) {
    if (wallMode === "block") {
      return pos.x < 0 || pos.x >= W || pos.y < 0 || pos.y >= H;
    }
    return false;
  }

  // Comprobar si la nueva posición colisiona con el cuerpo de la serpiente
  isSelfCollision(pos) {
    for (let i = 0; i < this.history.length; i++) {
      if (helpers.isCollision(pos, this.history[i])) {
        return true;
      }
    }
    return false;
  }

  // Obtener una dirección para evitar la colisión (en caso de que haya una)
  getAvoidDirection() {
    const dir = this.size;
    // Direcciones posibles para evitar colisiones
    const possibleDirections = [
      new helpers.Vec(dir, 0),  // Mover hacia la derecha
      new helpers.Vec(-dir, 0), // Mover hacia la izquierda
      new helpers.Vec(0, dir),  // Mover hacia abajo
      new helpers.Vec(0, -dir)  // Mover hacia arriba
    ];

    // Filtramos las direcciones que no causarían colisiones
    return possibleDirections.find(direction => !this.isCollisionAheadWithDirection(direction));
  }

  // Verificar si una dirección dada causaría una colisión
  isCollisionAheadWithDirection(direction) {
    const futurePos = new helpers.Vec(this.pos.x + direction.x, this.pos.y + direction.y);
    return this.isOutOfBounds(futurePos) || this.isSelfCollision(futurePos);
  }
}

class Food {
  constructor() {
    this.pos = new helpers.Vec(
      ~~(Math.random() * cells) * cellSize,
      ~~(Math.random() * cells) * cellSize
    );
    this.color = currentHue = `hsl(${~~(Math.random() * 360)},100%,50%)`;
    this.size = cellSize;
  }
  draw() {
    let { x, y } = this.pos;
    CTX.globalCompositeOperation = "lighter";
    CTX.shadowBlur = 20;
    CTX.shadowColor = this.color;
    CTX.fillStyle = this.color;
    CTX.fillRect(x, y, this.size, this.size);
    CTX.globalCompositeOperation = "source-over";
    CTX.shadowBlur = 0;
  }
  spawn() {
    let randX, randY;
    let validPosition;

    // Creamos un ciclo do...while que generará una posición válida
    do {
      randX = ~~(Math.random() * cells) * this.size;
      randY = ~~(Math.random() * cells) * this.size;
      
      validPosition = true;  // Inicializamos como válido
      
      // Comprobamos si la posición generada colisiona con el cuerpo de la serpiente
      for (let path of snakeBasic.history) {
        if (helpers.isCollision(new helpers.Vec(randX, randY), path)) {
          validPosition = false;  // Si hay colisión, lo marcamos como no válido
          break;  // Salimos del ciclo para intentar una nueva posición
        }
      }
    } while (!validPosition);  // Continuamos si la posición no es válida

    // Asignamos la nueva posición si no hubo colisión
    this.color = currentHue = `hsl(${helpers.randHue()}, 100%, 50%)`;
    this.pos = new helpers.Vec(randX, randY);
  }

}

class Particle {
  constructor(pos, color, size, vel) {
    this.pos = pos;
    this.color = color;
    this.size = Math.abs(size / 2);
    this.ttl = 0;
    this.gravity = -0.2;
    this.vel = vel;
  }
  draw() {
    let { x, y } = this.pos;
    let hsl = this.color
      .split("")
      .filter((l) => l.match(/[^hsl()$% ]/g))
      .join("")
      .split(",")
      .map((n) => +n);
    let [r, g, b] = helpers.hsl2rgb(hsl[0], hsl[1] / 100, hsl[2] / 100);
    CTX.shadowColor = `rgb(${r},${g},${b},${1})`;
    CTX.shadowBlur = 0;
    CTX.globalCompositeOperation = "lighter";
    CTX.fillStyle = `rgb(${r},${g},${b},${1})`;
    CTX.fillRect(x, y, this.size, this.size);
    CTX.globalCompositeOperation = "source-over";
  }
  update() {
    this.draw();
    this.size -= 0.3;
    this.ttl += 1;
    this.pos.add(this.vel);
    this.vel.y -= this.gravity;
  }
}

function incrementScore() {
  score++;
  dom_score.innerText = score.toString().padStart(2, "0");
}

function particleSplash() {
  for (let i = 0; i < splashingParticleCount; i++) {
    let vel = new helpers.Vec(Math.random() * 6 - 3, Math.random() * 6 - 3);
    let position = new helpers.Vec(food.pos.x, food.pos.y);
    particles.push(new Particle(position, currentHue, food.size, vel));
  }
}

function clearBasicSnake() {
  CTX.clearRect(0, 0, W, H);
}

function initializeBasicSnake() {
  CTX.imageSmoothingEnabled = false;
  KEY.listen();
  cellsCount = cells * cells;
  cellSize = W / cells;
  snakeBasic = new SnakeBasic();
  food = new Food();
  //  dom_replay.addEventListener("click", resetBasicSnake, false);
  loopBasicSnake();

}

function loopBasicSnake() {
    clearBasicSnake();
    if (!isGameOver) {
      requestID = setTimeout(loopBasicSnake, 1000 / 60);
      helpers.drawGrid();
      snakeBasic.update();
      food.draw();
      for (let p of particles) {
        p.update();
      }
      helpers.garbageCollector();
    } else {
      clearBasicSnake();
      gameOverBasicSnake();
    }
}

function gameOverBasicSnake() {
  maxScore ? null : (maxScore = score);
  score > maxScore ? (maxScore = score) : null;
  window.localStorage.setItem("maxScore", maxScore);
  CTX.fillStyle = "#4cffd7";
  CTX.textAlign = "center";
  CTX.font = "bold 30px Poppins, sans-serif";
  CTX.fillText("GAME OVER", W / 2, H / 2);
  CTX.font = "15px Poppins, sans-serif";
  CTX.fillText(`SCORE   ${score}`, W / 2, H / 2 + 60);
  CTX.fillText(`MAXSCORE   ${maxScore}`, W / 2, H / 2 + 80);
}

function resetBasicSnake() {
  dom_score.innerText = "00";
  score = "00";
  snakeBasic = new SnakeBasic();
  food.spawn();
  KEY.resetState();
  isGameOver = false;
  clearTimeout(requestID);
  loopBasicSnake();
}

//initializeBasicSnake();
