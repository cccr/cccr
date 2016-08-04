var fs = require("fs");

function FsRead() {}

FsRead.run = (filePath, callback, transformer, errorHandler) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, content) => {
            if (err) {
                if (errorHandler) {
                    resolve(errorHandler(err));
                    return;
                }
                reject(err);
                return;
            } else {
                var transformedContent = content;
                if (transformer) {
                    transformedContent = transformer(content);
                }
                resolve(callback(transformedContent));
            }
        });
    })
};

module.exports = FsRead;