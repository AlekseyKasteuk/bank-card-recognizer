module.exports = (req, res, next) => {

	var resultFile = JSON.parse(JSON.stringify(req.file));

	var mult = 1.7;

	req.file.forEach((row, y) => {
		row.forEach((pixel, x) => {
			if (1 - mult * (0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b) / 255 < 0.5) {
				resultFile[y][x] = {
					r: 255,
					g: 255,
					b: 255,
					a: 255,
				}
			} else {
				resultFile[y][x] = {
					r: 0,
					g: 0,
					b: 0,
					a: 255,
				}
			}
		});
	});

	req.file = resultFile;
	next();
}
