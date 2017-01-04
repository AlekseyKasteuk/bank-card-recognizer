const recognizer = require('../../util/train-perceptron').getAnswer;
var calculateGray = require('../../util/calculate-grey');
var calcThreshold = require('../../util/color-threshold');

module.exports = (req, res, next) => {

	var grayImg = req.file.map((row) => {
		return row.map((pixel) => {
			let gray = calculateGray(pixel);
			return gray;
			// return {
			// 	r: gray,
			// 	g: gray,
			// 	b: gray,
			// 	a: 255
			// };
		});
	});

	var threshold = calcThreshold(grayImg);

	grayImg = grayImg.map((row) => {
		return row.map((pixel) => {
			return pixel >= threshold ? 1 : 0;
		});
	});

	let numeralsX = [];
	let isBeginPath = false;

	for (let x = 0; x < req.fileSize.width; x++) {
		let count = 0;
		for (let y = 0; y < req.fileSize.height; y++) {
			count += grayImg[y][x];
		}
		if (count > 0 && !isBeginPath) {
			numeralsX.push(x - 1);
			isBeginPath = true;
		} else if (count === 0 && isBeginPath) {
			numeralsX.push(x);
			isBeginPath = false;
		}
	}

	if (isBeginPath) {
		numeralsX.pop();
	}

	let recognizedNumbers = [];

	for (let i = 0; i < numeralsX.length; i += 2) {
		let width = numeralsX[i + 1] - numeralsX[i];
		let height = req.fileSize.height;
		let numericImage = [];
		for (let y = 0; y < height; y++) {
			let tmp = [];
			for (let x = 0; x < width; x++) {
				tmp.push(grayImg[y][numeralsX[i] + x]);
			}
			numericImage.push(tmp);
		}
		let scaleX = 30 / width;
		let scaleY = 40 / height;
		let scaledImg = [];
		for (let y = 0; y < 40; y++) {
			let tmp = [];
			for (let x = 0; x < 30; x++) {
				tmp.push(numericImage[Math.trunc(y / scaleY)][Math.trunc(x / scaleX)]);
			}
			scaledImg.push(tmp);
		}
		// if (i / 2 == 15) {
		// 	req.file = scaledImg.map((row) => row.map(pixel => {
		// 		return {
		// 			r: pixel * 255,
		// 			g: pixel * 255,
		// 			b: pixel * 255,
		// 			a: 255
		// 		}
		// 	}));
		// 	req.fileSize = {
		// 		width: 30,
		// 		height: 40
		// 	}
		// 	break;
		// }
		recognizedNumbers.push(recognizer(scaledImg));
	}

	let lines = [];

	req.recognizedNumbers = recognizedNumbers;
	req.lines = lines;

	next();
}
