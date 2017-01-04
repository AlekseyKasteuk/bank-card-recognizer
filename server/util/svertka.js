module.exports = (startMatrix, kernalMatrix, x, y) => {
	var sum = {
		k: 0,
		r: 0,
		g: 0,
		b: 0
	};
	for (var j = 0; j < kernalMatrix.length; j++) {
		for (var i = 0; i < kernalMatrix[j].length; i++) {

			var pos = {
				x: x + (i + (Math.trunc(kernalMatrix[j].length / 2))),
				y: y + (j + (Math.trunc(kernalMatrix.length / 2)))
			}

			if (pos.x < 0) {
				pos.x = 0;
			}
			if (pos.x >= startMatrix[y].length) {
				pos.x = startMatrix[y].length - 1;
			}
			if (pos.y < 0) {
				pos.y = 0;
			}
			if (pos.y >= startMatrix.length) {
				pos.y = startMatrix.length - 1;
			}

			sum.r += startMatrix[pos.y][pos.x].r * kernalMatrix[j][i];
			sum.g += startMatrix[pos.y][pos.x].g * kernalMatrix[j][i];
			sum.b += startMatrix[pos.y][pos.x].b * kernalMatrix[j][i];

			sum.k += kernalMatrix[j][i];

		}
	}

	return sum;
}
