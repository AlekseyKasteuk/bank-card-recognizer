var result;
var filteredResult;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var globalFile;

function renderImageFromResponse(response) {
	canvas.height = response.size.height;
	canvas.width = response.size.width;
	var byteArray = ctx.getImageData(0, 0, response.size.width, response.size.height);

	response.data.forEach((value, index) => {
		byteArray.data[index] = value;
	});
	console.log(byteArray);
	ctx.putImageData(byteArray, 0, 0);
}

function setImageToCanvas() {
	var fileGetter = document.getElementById('file-getter');

	if (fileGetter.files.length) {

		globalFile = fileGetter.files[0];
		originalImage();

	}

}

function drawLines(lines) {
	lines.forEach((line) => {
		ctx.beginPath();
		ctx.moveTo(line.min.x, line.min.y);
		ctx.lineTo(line.max.x, line.max.y);
		ctx.lineWidth = 3;
		ctx.strokeStyle = line.isXLine ? '#ff0000' : '#00ff00';
		ctx.stroke();
	});
}

function allFilters() {
	if (globalFile) {

		var formData = new FormData();
		formData.append('file', globalFile);

		$('.spinner-wrapper').show();

		$.ajax({
			url: '/filters/all',
			method: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (result) => {
				$('.spinner-wrapper').hide();
				renderImageFromResponse(result)
			},
			error: (...props) => {
				$('.spinner-wrapper').hide();
				console.log(props);
			}
		});

	}
}

function recognize() {
	if (globalFile) {

		var formData = new FormData();
		formData.append('file', globalFile);

		$('.spinner-wrapper').show();

		$.ajax({
			url: '/filters/recognize',
			method: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (result) => {
				$('.spinner-wrapper').hide();
				renderImageFromResponse(result);
				drawLines(result.lines ? result.lines : []);
				console.log(result.lines);
			},
			error: (...props) => {
				$('.spinner-wrapper').hide();
				console.log(props);
			}
		});

	}
}

function cropNumber() {
	if (globalFile) {

		var formData = new FormData();
		formData.append('file', globalFile);
		$('.spinner-wrapper').show();

		$.ajax({
			url: '/filters/crop-number',
			method: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (result) => {
				$('.spinner-wrapper').hide();
				renderImageFromResponse(result);
				drawLines(result.lines ? result.lines : []);
				if (result.recognizedNumbers) {
					alert(result.recognizedNumbers.map(num => num.max).join(' '));
				}
				console.log(result.lines);
			},
			error: (...props) => {
				$('.spinner-wrapper').hide();
				console.log(props);
			}
		});

	}
}

function blackAndWhite() {
	if (globalFile) {

		var formData = new FormData();
		formData.append('file', globalFile);

		$('.spinner-wrapper').show();

		$.ajax({
			url: '/filters/blackandwhite',
			method: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (result) => {
				$('.spinner-wrapper').hide();
				renderImageFromResponse(result)
			},
			error: (...props) => {
				$('.spinner-wrapper').hide();
				console.log(props);
			}
		});

	}
}

function sobel() {

	if (globalFile) {

		var formData = new FormData();
		formData.append('file', globalFile);

		$('.spinner-wrapper').show();

		$.ajax({
			url: '/filters/sobel',
			method: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (result) => {
				$('.spinner-wrapper').hide();
				renderImageFromResponse(result)
			},
			error: (...props) => {
				$('.spinner-wrapper').hide();
				console.log(props);
			}
		});

	}

}

function canny() {

	if (globalFile) {

		var formData = new FormData();
		formData.append('file', globalFile);

		$('.spinner-wrapper').show();

		$.ajax({
			url: '/filters/canny',
			method: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (result) => {
				$('.spinner-wrapper').hide();
				renderImageFromResponse(result)
			},
			error: (...props) => {
				$('.spinner-wrapper').hide();
				console.log(props);
			}
		});

	}

}

function medians(num) {

	if (globalFile) {

		var formData = new FormData();
		formData.append('file', globalFile);

		$('.spinner-wrapper').show();

		$.ajax({
			url: '/filters/medians',
			method: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (result) => {
				$('.spinner-wrapper').hide();
				renderImageFromResponse(result)
			},
			error: (...props) => {
				$('.spinner-wrapper').hide();
				console.log(props);
			}
		});

	}

}

function originalImage() {
	var reader = new FileReader();
	reader.onload = function() {

		filteredResult = new Uint8ClampedArray(reader.result);
		var image = new Image();
		image.onload = function() {
			canvas.height = image.height;
			canvas.width = image.width;
			ctx.drawImage(image, 0, 0);
		}
		image.onerror = function() {

		}

		var str = '';
		for (var i = 0; i < filteredResult.length; i++) {
			str += String.fromCharCode(filteredResult[i]);
		}
		str = btoa(str);
		image.src = 'data:image/png;base64,' + str;

	}
	reader.onerror = function() {
		console.log('Error', reader);
	}

	reader.readAsArrayBuffer(globalFile);
}

function rezkost(num) {

	if (globalFile) {

		var formData = new FormData();
		formData.append('file', globalFile);

		$('.spinner-wrapper').show();

		$.ajax({
			url: '/filters/rezkost',
			method: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: (result) => {
				$('.spinner-wrapper').hide();
				renderImageFromResponse(result)
			},
			error: (...props) => {
				$('.spinner-wrapper').hide();
				console.log(props);
			}
		});

	}

}
