var createHistogram = function(img) {
	var histogram = {
			g: []
		},
		size = 256;
	while (size--) {
		histogram.g[size] = 0;
	}
	img.forEach((row, y) => {
		row.forEach((pixel, x) => {
			histogram.g[pixel]++;
		});
	});
	histogram.length = img.length * img[0].length;
	return histogram;
};

var calcWeight = (histogram, s, e) => {
	var total = histogram.reduce((i, j) => i + j, 0);
	var partHist = (s === e) ? [histogram[s]] : histogram.slice(s, e);
	var part = partHist.reduce((i, j) => i + j, 0);
	return parseFloat(part, 10) / total;
};

var calcMean = (histogram, s, e) => {
	var partHist = (s === e) ? [histogram[s]] : histogram.slice(s, e);
	var val = total = 0;
	partHist.forEach((el, i) => {
		val += ((s + i) * el);
		total += el;
	});
	return parseFloat(val, 10) / total;
};

var calcBetweenClassVariance = (weight1, mean1, weight2, mean2) => {
	return weight1 * weight2 * (mean1 - mean2) * (mean1 - mean2);
};

module.exports = (image) => {
	var histogram = createHistogram(image);
	var start = 0;
	var end = histogram.g.length - 1;
	var leftWeight, rightWeight,
		leftMean, rightMean;
	var betweenClassVariances = [];
	var max = -Infinity,
		threshold;

	histogram.g.forEach(function(el, i) {
		leftWeight = calcWeight(histogram.g, start, i);
		rightWeight = calcWeight(histogram.g, i, end + 1);
		leftMean = calcMean(histogram.g, start, i);
		rightMean = calcMean(histogram.g, i, end + 1);
		betweenClassVariances[i] = calcBetweenClassVariance(leftWeight, leftMean, rightWeight, rightMean);
		if (betweenClassVariances[i] > max) {
			max = betweenClassVariances[i];
			threshold = i;
		}
	});

	return threshold;
}
