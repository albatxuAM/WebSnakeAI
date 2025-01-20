class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;

        // Pesos aleatorios
        this.weights1 = this.initWeights(inputSize, hiddenSize);
        this.weights2 = this.initWeights(hiddenSize, outputSize);
    }

    initWeights(rows, cols) {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => Math.random() * 2 - 1)
        );
    }

    // Activación Sigmoide
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    // Derivada Sigmoide
    sigmoidDerivative(x) {
        return x * (1 - x);
    }

    // Feedforward
    forward(input) {
        this.input = input;
        this.hidden = this.sigmoid(this.dot(input, this.weights1));
        this.output = this.sigmoid(this.dot(this.hidden, this.weights2));
        return this.output;
    }

    // Backpropagation
    train(input, target, learningRate = 0.1) {
        const output = this.forward(input);

        // Calcula errores
        const outputError = target.map((t, i) => t - output[i]);
        const outputDelta = outputError.map((e, i) => e * this.sigmoidDerivative(output[i]));

        const hiddenError = this.dot(outputDelta, this.transpose(this.weights2));
        const hiddenDelta = hiddenError.map((e, i) => e * this.sigmoidDerivative(this.hidden[i]));

        // Ajusta pesos
        this.weights2 = this.add(this.weights2, this.dot(this.transpose(this.hidden), outputDelta, learningRate));
        this.weights1 = this.add(this.weights1, this.dot(this.transpose(this.input), hiddenDelta, learningRate));
    }

    // Utilidades matemáticas
    dot(a, b) {
        return a.map((row, i) => b[0].map((_, j) => row.reduce((sum, elm, k) => sum + elm * b[k][j], 0)));
    }

    add(a, b, scale = 1) {
        return a.map((row, i) => row.map((val, j) => val + b[i][j] * scale));
    }

    transpose(a) {
        return a[0].map((_, colIndex) => a.map(row => row[colIndex]));
    }
}