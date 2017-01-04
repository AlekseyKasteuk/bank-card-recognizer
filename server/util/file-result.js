module.exports = (req, res) => {

    console.log('SEND FILE');

    var result = [];
    req.file.forEach((row) => {
        row.forEach((pixel) => {
            result.push(pixel.r);
            result.push(pixel.g);
            result.push(pixel.b);
            result.push(pixel.a);
        });
    });

    res.send({
        data: result,
        size: req.fileSize,
        lines: req.lines,
		recognizedNumbers: req.recognizedNumbers
    }).end();
}
