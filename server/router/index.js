var router = require('express').Router();

var filters = require('./routes/filters');
var recognizer = require('./routes/recognizer');
var cropAndRotate = require('./routes/crop-and-rotate');
var recognizeNumber = require('./routes/recognize-number');

var fileGetter = require('../util/file-getter');
var fileSender = require('../util/file-result');
var blur = require('../util/blur');

router.post('/filters/sobel', fileGetter, filters.sobel, fileSender);
router.post('/filters/medians', fileGetter, filters.medians, fileSender);
router.post('/filters/rezkost', fileGetter, filters.rezkost, blur, fileSender);
router.post('/filters/canny', fileGetter, blur, filters.canny, fileSender);
router.post('/filters/blackandwhite', fileGetter, filters.blackAndWhite, fileSender);
router.post('/filters/all', fileGetter, filters.sobel, filters.blackAndWhite, filters.medians, fileSender);

// router.post('/filters/recognize', fileGetter, recognizer, fileSender); 
router.post('/filters/recognize', fileGetter, blur, filters.canny, recognizer, fileSender);
// router.post('/filters/recognize', fileGetter, filters.sobel, recognizer, fileSender);

router.post('/filters/crop-number', fileGetter, blur, filters.canny, recognizer, cropAndRotate, filters.medians, recognizeNumber, fileSender);

module.exports = router;
