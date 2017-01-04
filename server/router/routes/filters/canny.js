var fs = require('fs');
var calculateGray = require('../../../util/calculate-grey');
var svertka = require('../../../util/svertka');
var calcThreshold = require('../../../util/color-threshold');

var getEdgeNeighbors = (x, y, image, realEdges, minThresHold) => {
	var result = [];
	for (let i = y - 1; i < y + 1; i++) {
		if (i < 0 || i > image.length - 1) {
			continue;
		}
		for (let j = x - 1; j < x + 1; j++) {
			if (j < 0 || j > image[i].length - 1) {
				continue;
			}
			if (image[i][j] >= minThresHold && realEdges.indexOf(i * image[i].length + j) === -1) {
				result.push({
					x: j,
					y: i
				});
			}
		}
	}
	return result;
}

var _traverseEdge = (x, y, image, realEdges, minThresHold) => {
	realEdges.push(y * image[y].length + x);
	getEdgeNeighbors(x, y, image, realEdges, minThresHold).forEach((value) => {
		realEdges = _traverseEdge(value.x, value.y, image, realEdges, minThresHold);
	});
	return realEdges;
}

module.exports = (req, res, next) => {

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

	var anglesArray = [];
	var fullText = '';

	for (var y = 0; y < resultFile.length; y++) {
		var tmpAngles = [];
		for (var x = 0; x < resultFile[y].length; x++) {
			var Gy = svertka(resultFile, sobelY, x, y);
			var Gx = svertka(resultFile, sobelX, x, y);

			var edgeY = Gy.r + Gy.g + Gy.b;
			var edgeX = Gx.r + Gx.g + Gx.b;

			var deg = (Math.atan2(edgeY, edgeX) * (180 / Math.PI) + 180) % 180;
			var angleNum = Math.trunc(deg / 22.5);
			if (angleNum % 2) {
				angleNum++;
			}
			angleNum /= 2;
			var angle = angleNum * 45;

			var G = {
				r: Math.trunc(Math.min(Math.sqrt(Gx.r * Gx.r + Gy.r * Gy.r), 255)),
				g: Math.trunc(Math.min(Math.sqrt(Gx.g * Gx.g + Gy.g * Gy.g), 255)),
				b: Math.trunc(Math.min(Math.sqrt(Gx.b * Gx.b + Gy.b * Gy.b), 255))
			}
			tmpAngles.push({
				angle: angle,
				len: Math.round(Math.sqrt(edgeY * edgeY + edgeX * edgeX)),
				g: G
			});
		}
		anglesArray.push(tmpAngles);
	}

	req.anglesArray = anglesArray;

	for (var y = 0; y < anglesArray.length; y++) {
		for (var x = 0; x < anglesArray[y].length; x++) {
			var flag = true;
			if (anglesArray[y][x].angle === 180 || anglesArray[y][x].angle === 0 || anglesArray[y][x].angle === 360) {
				if (x > 0) {
					if (anglesArray[y][x - 1].angle === anglesArray[y][x].angle) {
						flag &= anglesArray[y][x].len >= anglesArray[y][x - 1].len;
					}
				}
				if (x < anglesArray[y].length - 1) {
					if (anglesArray[y][x + 1].angle === anglesArray[y][x].angle) {
						flag &= anglesArray[y][x].len > anglesArray[y][x + 1].len;
					}
				}

			} else if (anglesArray[y][x].angle === 45 || anglesArray[y][x].angle === 225) {

				if (x > 0 && y > 0) {
					if (anglesArray[y - 1][x - 1].angle === anglesArray[y][x].angle) {
						flag &= anglesArray[y][x].len >= anglesArray[y - 1][x - 1].len;
					}
				}
				if (x < anglesArray[y].length - 1 && y < anglesArray.length - 1) {
					if (anglesArray[y + 1][x + 1].angle === anglesArray[y][x].angle) {
						flag &= anglesArray[y][x].len > anglesArray[y + 1][x + 1].len;
					}
				}

			} else if (anglesArray[y][x].angle === 90 || anglesArray[y][x].angle === 270) {

				if (y > 0) {
					if (anglesArray[y - 1][x].angle === anglesArray[y][x].angle) {
						flag &= anglesArray[y][x].len >= anglesArray[y - 1][x].len;
					}
				}
				if (y < anglesArray.length - 1) {
					if (anglesArray[y + 1][x].angle === anglesArray[y][x].angle) {
						flag &= anglesArray[y][x].len > anglesArray[y + 1][x].len;
					}
				}

			} else if (anglesArray[y][x].angle === 135 || anglesArray[y][x].angle === 315) {

				if (x < anglesArray[y].length - 1 && y > 0) {
					if (anglesArray[y - 1][x + 1].angle === anglesArray[y][x].angle) {
						flag &= anglesArray[y][x].len >= anglesArray[y - 1][x + 1].len;
					}
				}
				if (x > 0 && y < anglesArray.length - 1) {
					if (anglesArray[y + 1][x - 1].angle === anglesArray[y][x].angle) {
						flag &= anglesArray[y][x].len > anglesArray[y + 1][x - 1].len;
					}
				}

			} else {
				console.log('FORGOT ANGLE:', anglesArray[y][x].angle);
			}

			resultFile[y][x] = flag * anglesArray[y][x].g.r;

			// resultFile[y][x] = {
			// 	r: flag * anglesArray[y][x].g.r,
			// 	g: flag * anglesArray[y][x].g.g,
			// 	b: flag * anglesArray[y][x].g.b,
			// 	a: 255
			// };
		}
	}

	var maxThresHold = calcThreshold(resultFile);
	var minThresHold = maxThresHold / 3;

	console.log(maxThresHold);
	console.log(minThresHold);

	var realEdges = [];

	resultFile.forEach((row, y) => {
		row.forEach((pixel, x) => {
			if (realEdges.indexOf(y * row.length + x) === -1 && pixel >= maxThresHold) {
				realEdges = _traverseEdge(x, y, resultFile, realEdges, minThresHold);
			}
		});
	});

	resultFile = resultFile.map((row, y) => {
		return row.map((pixel, x) => {
			var indexOfDot = realEdges.indexOf(y * row.length + x) > -1;
			return {
				r: 255 * indexOfDot,
				g: 255 * indexOfDot,
				b: 255 * indexOfDot,
				a: 255
			}
		});
	});

	req.file = resultFile;
	next();

}
