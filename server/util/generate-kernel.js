var sumArr = (arr) => {
	var result = 0;
	arr.map((el, idx) => {
		result += (/^\s*function Array/.test(String(el.constructor))) ? sumArr(el) : el;
	});
	return result;
};


module.exports = (sigma, size) => {
	var kernel = [];
	var E = 2.718;
	for (var y = -(size - 1) / 2, i = 0; i < size; y++, i++) {
		kernel[i] = [];
		for (var x = -(size - 1) / 2, j = 0; j < size; x++, j++) {
			kernel[i][j] = 1 / (2 * Math.PI * Math.pow(sigma, 2)) * Math.pow(E, -(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2)) / (2 * Math.pow(sigma, 2)));
		}
	}

	var normalize = 1 / sumArr(kernel);
	for (var k = 0; k < kernel.length; k++) {
		for (var l = 0; l < kernel[k].length; l++) {
			kernel[k][l] = Math.round(normalize * kernel[k][l] * 1000) / 1000;
		}
	}
	return kernel;
};
