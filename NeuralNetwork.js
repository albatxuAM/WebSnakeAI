// Red Neuronal Simple

class NeuralNetwork {
  constructor(inputNodes, outputNodes) {
    this.inputNodes = inputNodes;
    this.outputNodes = outputNodes;
    
    // Inicializar los pesos aleatorios para cada nodo
    this.weights = [];
    for (let i = 0; i < inputNodes; i++) {
      this.weights.push(Math.random() * 2 - 1); // Pesos entre -1 y 1
    }

    // Inicializar el sesgo
    this.bias = Math.random() * 2 - 1;
  }

  // Función de activación (sigmoide)
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  // Derivada de la función sigmoide
  sigmoidDerivative(x) {
    return x * (1 - x);
  }

  // Propagación hacia adelante (Forward pass)
  forward(inputData) {
    let weightedSum = 0;
    for (let i = 0; i < this.inputNodes; i++) {
      weightedSum += inputData[i] * this.weights[i];
    }
    weightedSum += this.bias; // Añadir el sesgo
    return this.sigmoid(weightedSum); // Aplicar la función de activación
  }

  // Entrenamiento de la red neuronal con el algoritmo de retropropagación
  train(trainingData, epochs, learningRate) {
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < trainingData.length; i++) {
        let input = trainingData[i].input;
        let target = trainingData[i].output;

        // Propagación hacia adelante
        let output = this.forward(input);

        // Error de salida
        let error = target - output;

        // Calculando el gradiente de error
        let gradient = this.sigmoidDerivative(output) * error;

        // Actualizar pesos y sesgo
        for (let j = 0; j < this.inputNodes; j++) {
          this.weights[j] += learningRate * gradient * input[j];
        }
        this.bias += learningRate * gradient;
      }
    }
  }
}

// Ejemplo de uso
let net = new NeuralNetwork(3, 1); // 3 entradas y 1 salida

// Datos de entrenamiento
let trainingData = [
  { input: [0, 1, 0], output: [1] }, // Mover hacia arriba
  { input: [1, 0, 0], output: [0] }, // Mover hacia abajo
  { input: [0, 0, 1], output: [2] }  // Mover hacia la derecha
];

// Entrenar la red neuronal
net.train(trainingData, 10000, 0.1); // 10000 iteraciones, tasa de aprendizaje 0.1

// Probar la red neuronal
let output = net.forward([0, 1, 0]); // Entrada de prueba
console.log(output); // Imprime la predicción de la red
