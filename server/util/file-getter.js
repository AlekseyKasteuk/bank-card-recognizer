var getter = require("pixel-getter");
var sizeOf = require('image-size');

module.exports = (req, res, next) => {

    console.log('GET FILE');

    var processingFunc = (data) => {
        if (data.size && data.pixels) {
            var result = [];
            for (var i = 0; i < data.size.height; i++) {
                var tmp = [];
                for (var j = i * data.size.width; j < i * data.size.width + data.size.width; j++) {
                    tmp.push(data.pixels[0][j]);
                }
                result.push(tmp);
            }
            req.file = result;
            req.sourceFile = JSON.parse(JSON.stringify(result));
            req.fileSize = data.size;
            next();
        }
    }

    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {

        var img;

        file.on('data', (data) => {
            img = !img ? data : Buffer.concat([img, data]);
        });

        file.on('end', () => {
            var data = {};
            data.size = sizeOf(img);
            getter.get(img, (err, pixels) => {
                data.pixels = pixels;
                data.pixels[0] = data.pixels[0].map((temp) => {
                    temp.a = 255;
                    return temp;
                });
                processingFunc(data);
            });
        });

        file.read();

    });
};
