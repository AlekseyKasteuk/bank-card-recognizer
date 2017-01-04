var svertka = require('../../../util/svertka');

module.exports = (req, res, next) => {

	console.log('REZKOST PROCESSING');

	var num = 3;
	var center = Math.trunc(num / 2) + 1;

	var kernalMatrix = [];

	for (var i = 0; i < num; i++) {
		var line = [];
		for (var j = 0; j < num; j++) {
			if (i === center - 1 && j === center - 1) {
				line.push(num * num);
			} else {
				line.push(-1);
			}
		}
		kernalMatrix.push(line);
	}

	req.kernalMatrix = kernalMatrix;
	next();

}
