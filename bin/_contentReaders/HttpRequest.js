var http = require("http");

function HttpRequest() {}

HttpRequest.run = (url, callback, transformer, errorHandler) => {
    return new Promise((resolve, reject) => {
        var req = http.request(url, (response)  => {
            var content = '';
            response.on('data', (chunk) => {
                content += chunk;
            });

            response.on('end', () => {
                var transformedContent = content;
                if (transformer) {
                    transformedContent = transformer(content);
                }
                resolve(callback(transformedContent))
            });
        });

        req.on('error', (e) => {
            if (errorHandler) {
                resolve(errorHandler(err));
            }
        });

        req.end();
    })
};

module.exports = HttpRequest;