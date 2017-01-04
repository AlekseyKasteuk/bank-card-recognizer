var fs = require('fs');
const testFolder = './train_images/';
const prtceptronResultPath = './train_images/percetron.json';
var getter = require("pixel-getter");
var NeuronNetwork = require('./neuron-network');
var async = require('async');

var neuronNetwork = new NeuronNetwork();

var getPixels = (data, callback) => {
	getter.get(data.fileBytes, (err, pixels) => {
		if (err) {
			console.log('Error', data.i, data.fileName);
			callback(null, 'Error');
		} else {
			pixels = pixels[0].map((pixel) => {
				return pixel.r > 0 ? 1 : 0;
			});
			var pixelsRes = [];
			// callback(null, {
			// 	i: data.i, pixels: pixelsRes
			// });
			for (let y = 0; y < 40; y++) {
				let tmp = [];
				for (let x = 0; x < 30; x++) {
					tmp.push(pixels[y * 30 + x])
				}
				pixelsRes.push(tmp);
			}
			callback(null, {
				i: data.i, pixels: pixelsRes
			});
		}
	});
}

module.exports.train = () => {

	var promiseArr = [];

	for (let i = 0; i < 10; i++) {
		let files = fs.readdirSync(testFolder + i + '/');
		files.forEach((file, index) => {
			if (file !== '.DS_Store') {
				let fileBytes = fs.readFileSync(testFolder + i + '/' + file);
				promiseArr.push({ i: i, fileBytes: fileBytes, fileName: file});
			}
		});
	}
	async.concat(promiseArr, getPixels, (err, results) => {
		var pixelsArr = [];
		results.forEach((data) => {
			if (!pixelsArr[data.i]) {
				pixelsArr[data.i] = [];
			}
			pixelsArr[data.i].push(data.pixels);
		});
		for (let t = 0; t < 100000; t++) {
			for (let i = 0; i < 10; i++) {
				pixelsArr[i].forEach((pixelsRes) => {
					neuronNetwork.study(pixelsRes, i);
				});
			}
		}
		console.log('STUDY FINISHED!!!');
	});
}

module.exports.getAnswer = neuronNetwork.getAnswer.bind(neuronNetwork);
