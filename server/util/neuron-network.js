class Neuron {

	constructor() {
		this.height = 40;
		this.width = 30;
		this.minimum = 10;
		this.weights = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => Math.round(Math.random() * 100) % 10));
	}

	changeWeights (input, diff) {
		for (let i = 0; i < this.height; i++) {
			for (let j = 0; j < this.width; j++) {
				this.weights[i][j] += diff * input[i][j];
			}
		}
	}

	transfer (inputs) {
		var power = 0;
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				power += this.weights[i][j] * inputs[i][j];
			}
		}
		return power;
	}

	transferHard (inputs) {
		var power = 0;
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				power += this.weights[i][j] * inputs[i][j];
			}
		}
		return power > this.minimum ? 1 : 0;
	}

}

class NeuronNetwork {

	constructor () {
		this.neurons = Array.from({ length: 10 }, () => new Neuron());
	}
	handleHard(input)
	{
		return Array.from({ length: this.neurons.length }, (v, index) => {
			return this.neurons[index].transferHard(input);
		} );
	}

	handle (input) {
		return Array.from({ length: this.neurons.length }, (v, index) => {
			return this.neurons[index].transfer(input);
		});
	}

	getAnswer (input) {
		var output = this.handle(input);
		var maxIndex = 0;
		for (let i = 1; i < output.length; i++) {
			if (output[i] > output[maxIndex]) {
				maxIndex = i;
			}
		}
		return {
			max: maxIndex,
			output: output
		};
	}

	compareArrays (matrix1, matrix2) {
		if (matrix1.length !== matrix2.length) {
			return false;
		}
		for (let i = 0; i < matrix1.length; i++) {
			if (matrix1[i] !== matrix2[i]) {
				return false;
			}
		}
		return true;
	}

	study (input, correctAnswer) {
		var correctOutput = Array.from({ length: this.neurons.length }, (v, index) => index === correctAnswer ? 1 : 0);
		var output = this.handleHard(input);
		while (!this.compareArrays(correctOutput, output)) {
			for (var i = 0; i < this.neurons.length; i++) {
				let diff = correctOutput[i] - output[i];
				this.neurons[i].changeWeights(input, diff);
			}
			output = this.handleHard(input);
		}
	}

}

module.exports = NeuronNetwork;
