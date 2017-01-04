module.exports = (req, res, next) => {
	var tmpFile;
	if (!req.rotationAngle && req.rotationAngle !== 0) { return next(); }
	var angleVals = {
		sin: Math.sin(req.rotationAngle * Math.PI / 180),
		cos: Math.cos(req.rotationAngle * Math.PI / 180)
	}
	var newEdges = {
		x: {
			max: -Infinity,
			min: Infinity
		},
		y: {
			max: -Infinity,
			min: Infinity
		}
	};

	[0, req.fileSize.width - 1].forEach((x) => {
		[0, req.fileSize.height - 1].forEach((y) => {
			let nx = Math.round(x * angleVals.cos - y * angleVals.sin);
			let ny = Math.round(x * angleVals.sin + y * angleVals.cos);
			console.log(nx, ny);
			if (nx > newEdges.x.max) {
				newEdges.x.max = nx;
			}
			if (nx < newEdges.x.min) {
				newEdges.x.min = nx;
			}
			if (ny > newEdges.y.max) {
				newEdges.y.max = ny;
			}
			if (ny < newEdges.y.min) {
				newEdges.y.min = ny;
			}
		});
	});

	let NE = {
		x: {
			max: -Infinity,
			min: Infinity
		},
		y: {
			max: -Infinity,
			min: Infinity
		}
	};

	tmpFile = Array.from({ length: newEdges.y.max - newEdges.y.min + 1 }, () => Array.from({ length: newEdges.x.max - newEdges.x.min + 1 }, () => { return { r: 0, g: 0, b: 0, a: 255 }; }));

	req.arrayOfDots.forEach((row, y) => {
		row.forEach((pixel, x) => {
			let nx = Math.round(x * angleVals.cos - y * angleVals.sin) - newEdges.x.min;
			let ny = Math.round(x * angleVals.sin + y * angleVals.cos) - newEdges.y.min;
			try {

				if (pixel) {

					if (pixel === 2) {
						NE.x.max = Math.max(NE.x.max, nx);
						NE.x.min = Math.min(NE.x.min, nx);
						NE.y.max = Math.max(NE.y.max, ny);
						NE.y.min = Math.min(NE.y.min, ny);
					}

					// tmpFile[ny][nx] = {
					// 	r: 255,
					// 	g: pixel === 2 ? 0 : 255,
					// 	b: pixel === 2 ? 0 : 255,
					// 	a: 255
					// };
				}
				tmpFile[ny][nx] = req.sourceFile[y][x];

			} catch (e) {
				console.log('ERROR FOR:' , nx, ny);
			}
		});
	});

	console.log(NE);

	let cropedImage = [];

	for (let y = NE.y.min; y <= NE.y.max; y++) {
		let tmp = [];
		for (let x = NE.x.min; x <= NE.x.max; x++) {
			tmp.push(tmpFile[y][x]);
		}
		cropedImage.push(tmp);
	}

	var x1 = Math.round(cropedImage[0].length * 2 / 23),
		x2 = Math.round(cropedImage[0].length - cropedImage[0].length / 23),
		y1 = Math.round(cropedImage.length * 9 / 16),
		y2 = Math.round(cropedImage.length - cropedImage.length / 2.9),
		numberImage = [];

	for (let i = y1; i <= y2; i++) {
		let tmp = [];
		for (let j = x1; j <= x2; j++) {
			tmp.push(cropedImage[i][j]);
		}
		numberImage.push(tmp);
	}

	req.file = numberImage;
	req.fileSize = {
		width: x2 - x1 + 1,
		height: y2 - y1 + 1
	};



	var lines = [];

	req.lines = lines;

	next();
}
