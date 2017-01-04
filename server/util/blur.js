var svertka = require('./svertka');
var generateKernal = require('./generate-kernel');

module.exports = (req, res, next) => {

	var num = 5;
	var center = Math.trunc(num / 2) + 1;

	var result = [];
	var resultFile = JSON.parse(JSON.stringify(req.file));

	var kernalMatrix = req.kernalMatrix ? req.kernalMatrix : generateKernal(num, 1.4);

	for (var y = 0; y < req.file.length; y++) {
		for (var x = 0; x < req.file[y].length; x++) {

			if (y < center || y > req.file.length - center - 1 || x < center || x > req.file[y].length - center - 1) {
				result.push(req.file[y][x].r);
				result.push(req.file[y][x].g);
				result.push(req.file[y][x].b);
				result.push(255);
				continue;
			}

			var sum = svertka(req.file, kernalMatrix, x, y)

			sum.k = sum.k <= 0 ? 1 : sum.k;
			sum.r = Math.trunc(sum.r / sum.k);
			sum.g = Math.trunc(sum.g / sum.k);
			sum.b = Math.trunc(sum.b / sum.k);
			sum.a = Math.trunc(sum.a / sum.k);

			['r', 'g', 'b', 'a'].forEach(function(key) {
				sum[key] = sum[key] < 0 ? 0 : sum[key] > 255 ? 255 : sum[key];
			});

			result.push(sum.r);
			result.push(sum.g);
			result.push(sum.b);
			result.push(255);

			resultFile[y][x] = {
				r: sum.r,
				g: sum.g,
				b: sum.b,
				a: 255
			};

		}
	}

	req.file = resultFile;
	next();

}
