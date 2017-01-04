var calculateGray = require('../../../util/calculate-grey');
var svertka = require('../../../util/svertka');

module.exports = (req, res, next) => {

	console.log('SOBEL PROCESSING');

	var file = req.file;
	var result = [];
	var resultFile = JSON.parse(JSON.stringify(req.file));
	resultFile = resultFile.map((row) => {
		return row.map((pixel) => {
			var gray = calculateGray(pixel);
			return {
				r: gray,
				g: gray,
				b: gray,
				a: 255
			}
		});
	});

	var sobelY = [
		[-1, -2, -1],
		[0, 0, 0],
		[1, 2, 1]
	];
	var sobelX = [
		[-1, 0, 1],
		[-2, 0, 2],
		[-1, 0, 1]
	];

	for (var y = 0; y < resultFile.length; y++) {
		for (var x = 0; x < resultFile[y].length; x++) {
			var Gy = svertka(resultFile, sobelY, x, y);
			var Gx = svertka(resultFile, sobelX, x, y);

			var G = {
				r: Math.trunc(Math.min(Math.sqrt(Gx.r * Gx.r + Gy.r * Gy.r), 255)),
				g: Math.trunc(Math.min(Math.sqrt(Gx.g * Gx.g + Gy.g * Gy.g), 255)),
				b: Math.trunc(Math.min(Math.sqrt(Gx.b * Gx.b + Gy.b * Gy.b), 255)),
				a: 255
			}

			result.push(G.r);
			result.push(G.g);
			result.push(G.b);
			result.push(255);
			resultFile[y][x] = G;
		}
	}

	req.file = resultFile;
	next();

}
