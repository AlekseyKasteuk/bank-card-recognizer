module.exports = (req, res, next) => {

	console.log('MEDIANS PROCESSING');

	var num = !!req.body.num ? req.body.num : 3;

	if (num % 2 !== 1) {
		return res.status(400).send('Invalid number');
	}

	var center = Math.trunc(num / 2);

	var result = [];
	var resultFile = JSON.parse(JSON.stringify(req.file));

	for (var y = 0; y < req.file.length; y++) {
		for (var x = 0; x < req.file[y].length; x++) {

			if (y < center || y > req.file.length - center - 1 || x < center || x > req.file[y].length - center - 1) {
				result.push(req.file[y][x].r);
				result.push(req.file[y][x].g);
				result.push(req.file[y][x].b);
				result.push(255);
				resultFile[y][x] = {
					r: req.file[y][x].r,
					g: req.file[y][x].g,
					b: req.file[y][x].b,
					a: 255
				};
				continue;
			}

			var values = {
				r: [],
				g: [],
				b: []
			};
			for (var i = (-1) * center; i <= center; i++) {
				for (var j = (-1) * center; j <= center; j++) {
					values.r.push(req.file[y - i][x - j].r);
					values.g.push(req.file[y - i][x - j].g);
					values.b.push(req.file[y - i][x - j].b);
				}
			}

			values.r.sort(function(v1, v2) {
				return v1 - v2;
			});
			values.g.sort(function(v1, v2) {
				return v1 - v2;
			});
			values.b.sort(function(v1, v2) {
				return v1 - v2;
			});

			result.push(values.r[3]);
			result.push(values.g[3]);
			result.push(values.b[3]);
			result.push(255);
			resultFile[y][x] = {
				r: values.r[3],
				g: values.g[3],
				b: values.b[3],
				a: 255
			};
		}
	}

	req.file = resultFile;
	next();

}
