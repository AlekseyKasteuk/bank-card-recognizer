var fs = require('fs');
var neuronNetworkAnswer = require('../../util/train-perceptron').getAnswer;

var ANGLE_COUNT = 180;

var lineObject = (type, data, size, angleTables) => {
	if (type === 'h') {
		return {
			min: {
				x: 0,
				y: Math.round(data.r / angleTables.sin[data.teta])
			},
			max: {
				x: size.width,
				y: Math.round((data.r - size.width * angleTables.cos[data.teta]) / angleTables.sin[data.teta])
			},
			isXLine: true
		};
	}
	if (type === 'v') {
		return {
			min: {
				x: Math.round(data.r / angleTables.cos[data.teta]),
				y: 0,
			},
			max: {
				x: Math.round((data.r - size.height * angleTables.sin[data.teta]) / angleTables.cos[data.teta]),
				y: size.height,
			},
			isXLine: false
		};
	}
}

module.exports = (req, res, next) => {

	var arrayOfDots = [];

	req.file.forEach((row, y) => {
		let tmp = [];
		row.forEach((pixel, x) => {
			tmp.push((!pixel.r && !pixel.g && !pixel.b) ? 0 : 1);
		});
		arrayOfDots.push(tmp);
	});

	var angleTables = {
		sin: [],
		cos: []
	};

	for (let i = 0; i < ANGLE_COUNT; i++) {
		angleTables.sin.push(Math.sin(Math.PI * (i / 180)));
		angleTables.cos.push(Math.cos(Math.PI * (i / 180)));
	}

	var rMax = Math.sqrt(req.fileSize.height * req.fileSize.height + req.fileSize.width * req.fileSize.width);

	var accumulator = Array.from({
		length: ANGLE_COUNT
	}, () => {
		var res = {};
		res.max = 0;
		res.min = 0;
		return res;
	});

	arrayOfDots.forEach((row, y) => {
		row.forEach((pixel, x) => {
			if (pixel) {
				for (let i = 0; i < ANGLE_COUNT; i++) {
					let r = Math.trunc(x * angleTables.cos[i] + y * angleTables.sin[i]);
					if (accumulator[i][r] == undefined) {
						accumulator[i][r] = {
							teta: i,
							r: r,
							data: 1,
							dots: [{
								x: x,
								y: y
							}]
						};
					} else {
						accumulator[i][r].data++;
						accumulator[i][r].dots.push({
							x: x,
							y: y
						});
					}
				}
			}
		});
	});

	var lines = [];

	var mainData = {
		horizontal: [],
		vertical: []
	}

	accumulator.forEach((accum, index) => {
		for (let r in accum) {
			if (!accum[r].dots) { continue; }
			if ((index > 45 && index < 135) || (index > 225 && index < 315)) {
				accum[r].dots.sort((v1, v2) => v1.x - v2.x);
				mainData.horizontal.push(accum[r]);
			} else {
				accum[r].dots.sort((v1, v2) => v1.y - v2.y);
				mainData.vertical.push(accum[r]);
			}
		}
	});

	mainData.horizontal.sort((v1, v2) => v2.data - v1.data).map((data, index) => { data.index = index; return data; });
	mainData.vertical.sort((v1, v2) => v2.data - v1.data).map((data, index) => { data.index = index; return data; });;

	var result = {
		h: [],
		v: []
	};

	while (true) {

		let nextVal, nextV;
		let parallelLines = [];
		let ort = [];
		let ret = false;

		if (!mainData.horizontal.length && !mainData.vertical.length) {
			break;
		}

		parallelLines = [];
		ort = [];

		if (mainData.horizontal.length) {

			nextVal = mainData.horizontal.shift();

			result.h.forEach((line) => {
				if (Math.abs(line.teta - nextVal.teta) < 1 && Math.abs(nextVal.r - line.r) > 10) {
					parallelLines.push(line);
				}
			});

			if (parallelLines.length) {

				let ortAngle = (nextVal.teta + 90) % 180;

				result.v.forEach((line) => {
					if (line.teta > 90 && ortAngle > 90 || line.teta < 90 && ortAngle < 90) {
						if (Math.abs(line.teta - ortAngle) > 1) {
							return;
						}
					} else if (line.teta < 90 && ortAngle > 90) {
						if (180 - ortAngle + line.teta > 1) {
							return;
						}
					} else {
						if (180 - line.teta + ortAngle > 1) {
							return ;
						}
					}
					ort.push(line);
				});

				if (ort.length > 1) {
					parallelLines.every((hLine) => {
						let hLen = Math.abs(nextVal.r - hLine.r);
						ort.every((vLine1, index1) => {
							ort.every((vLine2, index2) => {
								if (index1 === index2) { return; }
								let sideRatio = Math.abs(vLine1.r - vLine2.r) / hLen;
								if (sideRatio > 1) { sideRatio = 1 / sideRatio }
								if (sideRatio > 0.55 && sideRatio < 0.7) {
									if (nextVal.teta === hLine.teta) {
										vLine1.teta = vLine2.teta = (nextVal.teta + 90) % 180;
									} else if (vLine1.teta == vLine2.teta) {
										nextVal.teta = hLine.teta = (vLine1.teta + 90) % 180;
									} else {
										hLine.teta = nextVal.teta;
										vLine1.teta = vLine2.teta = (nextVal.teta + 90) % 180;
									}
									console.log('H', nextVal.teta, '(' + nextVal.r + ')', hLine.teta, '(' + hLine.r + ')', vLine1.teta, '(' + vLine1.r + ')', vLine2.teta, '(' + vLine2.r + ')');
									req.rotationAngle = Math.abs(nextVal.r - hLine.r) > Math.abs(vLine1.r - vLine2.r) ? (180 * !!nextVal.teta) - nextVal.teta : (180 * !!vLine1.teta) - vLine1.teta;
									ret = true;
									lines = [];
									let intersects = [[nextVal, vLine1], [nextVal, vLine2], [hLine, vLine1], [hLine, vLine2]].map((pair) => {
										let x = (pair[1].r * angleTables.sin[pair[0].teta] - pair[0].r * angleTables.sin[pair[1].teta]) /
												(angleTables.cos[pair[1].teta] * angleTables.sin[pair[0].teta] - angleTables.cos[pair[0].teta] * angleTables.sin[pair[1].teta]);
										let y = pair[0].teta ? (pair[0].r - x * angleTables.cos[pair[0].teta]) / angleTables.sin[pair[0].teta] : pair[1].r;
										arrayOfDots[Math.round(y)][Math.round(x)] = 2;
										return {
											x: Math.round(x),
											y: Math.round(y)
										};
									});
									req.intersections = intersects;
									[[0,1], [0,2], [2, 3], [3,1]].forEach((pair) => {
										lines.push({
											min: {
												x: intersects[pair[0]].x,
												y: intersects[pair[0]].y
											},
											max: {
												x: intersects[pair[1]].x,
												y: intersects[pair[1]].y
											},
											isXLine: true
										});
									});
								}
								if (ret) {
									return false;
								}
								return true;
							});
							if (ret) {
								return false;
							}
							return true;
						});
						if (ret) {
							return false;
						}
						return true;
					});
					if (ret) {
						break;
					}
				}
			}

			result.h.push(nextVal);
		}

		parallelLines = [];
		ort = [];

		if (mainData.vertical.length) {

			nextVal = mainData.vertical.shift();

			result.v.forEach((line) => {
				if (line.teta > 90 && nextVal.teta > 90 || line.teta < 90 && nextVal.teta < 90) {
					if (Math.abs(line.teta - nextVal.teta) > 1) {
						return;
					}
				} else if (line.teta < 90 && nextVal.teta > 90) {
					if (180 - nextVal.teta + line.teta > 1) {
						return;
					}
				} else {
					if (180 - line.teta + nextVal.teta > 1) {
						return;
					}
				}
				if (Math.abs(nextVal.r - line.r) > 10) { parallelLines.push(line); }
			});

			if (parallelLines.length) {
				let ortAngle = (nextVal.teta + 90) % 180;

				result.h.forEach((line) => {
					if (Math.abs(line.teta - ortAngle) < 3) {
						ort.push(line);
					}
				});

				if (ort.length > 1) {
					parallelLines.every((hLine) => {
						let hLen = Math.abs(nextVal.r - hLine.r);
						ort.every((vLine1, index1) => {
							ort.every((vLine2, index2) => {
								if (index1 === index2) { return; }
								let sideRatio = Math.abs(vLine1.r - vLine2.r) / hLen;
								if (sideRatio > 1) { sideRatio = 1 / sideRatio }
								if (sideRatio > 0.55 && sideRatio < 0.7) {
									console.log('V', nextVal.teta, '(' + nextVal.r + ')', hLine.teta, '(' + hLine.r + ')', vLine1.teta, '(' + vLine1.r + ')', vLine2.teta, '(' + vLine2.r + ')');
									if (nextVal.teta === hLine.teta) {
										vLine1.teta = vLine2.teta = (nextVal.teta + 90) % 180;
									} else if (vLine1.teta == vLine2.teta) {
										nextVal.teta = hLine.teta = (vLine1.teta + 90) % 180;
									} else {
										hLine.teta = nextVal.teta;
										vLine1.teta = vLine2.teta = (nextVal.teta + 90) % 180;
									}
									req.rotationAngle = Math.abs(nextVal.r - hLine.r) > Math.abs(vLine1.r - vLine2.r) ? (180 * !!nextVal.teta) - nextVal.teta : (180 * !!vLine1.teta) - vLine1.teta;
									ret = true;
									lines = [];
									let intersects = [[nextVal, vLine1], [nextVal, vLine2], [hLine, vLine1], [hLine, vLine2]].map((pair) => {
										let x = (pair[1].r * angleTables.sin[pair[0].teta] - pair[0].r * angleTables.sin[pair[1].teta]) /
												(angleTables.cos[pair[1].teta] * angleTables.sin[pair[0].teta] - angleTables.cos[pair[0].teta] * angleTables.sin[pair[1].teta]);
										let y = pair[0].teta ? (pair[0].r - x * angleTables.cos[pair[0].teta]) / angleTables.sin[pair[0].teta] : pair[1].r;
										arrayOfDots[Math.round(y)][Math.round(x)] = 2;
										return {
											x: Math.round(x),
											y: Math.round(y)
										};
									});
									req.intersections = intersects;
									[[0,1], [0,2], [2, 3], [3,1]].forEach((pair) => {
										lines.push({
											min: {
												x: intersects[pair[0]].x,
												y: intersects[pair[0]].y
											},
											max: {
												x: intersects[pair[1]].x,
												y: intersects[pair[1]].y
											},
											isXLine: true
										});
									});
								}
								if (ret) {
									return false;
								}
								return true;
							});
							if (ret) {
								return false;
							}
							return true;
						});
						if (ret) {
							return false;
						}
						return true;
					});
					if (ret) {
						break;
					}
				}
			}

			result.v.push(nextVal);
		}

	}

	console.log(req.rotationAngle);

	req.arrayOfDots = arrayOfDots;

	req.lines = lines;

	next();
}
