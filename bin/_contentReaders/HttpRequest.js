var http = require('http');

function HttpRequest() {}

HttpRequest.run = (url, callback, transformer, errorHandler) => {
    return new Promise((resolve, reject) => {
        var req = http.request(url, (response)  => {
            var content = '';

            response.on('data', (chunk) => {
                content += chunk;
            });

            response.on('end', () => {
                if (response.statusCode < 200 || response.statusCode > 299) {
                    if (errorHandler) {
                        resolve(errorHandler(response));
                        return;
                    }
                    reject(response.statusCode);
                    return;
                }

                var transformedContent = content;
                if (transformer) {
                    transformedContent = transformer(content);
                }
                resolve(callback(transformedContent))
            });
        });

        req.on('error', (err) => {
            if (errorHandler) {
                resolve(errorHandler(err));
            }
        });

        req.end();
    })
};

module.exports = HttpRequest;