var port = 8854;
var http = require("http");

require('app-module-path').addPath('../lib');
require('app-module-path').addPath('../bin');

var CP = require('ConnectionPool');
var RE = require('RenderEngine');

var headers = {"Content-Type": "application/json"};

var app = function (request, response) {

    var data = {
        "text": {
            "data": {
                "text": "Good to see you!"
            },
            "args": {}
        }
    };

    response.writeHead(200, headers);
    response.write(JSON.stringify(data), "binary");
    response.end();
};

var server = http.createServer(app);

server.listen(port);

var testName = 'testRest';
console.time(testName);
var content_ref = {
    "type": "rest",
    "option": {
        "host": "localhost",
        "path": "/dummy.json",
        "port": port,
        "method": "GET"
    }
};

var re = new RE({url: 'qwe://qwe.qwe/qwe?qwe=qwe'}, {}, {});
re.init(content_ref, CP);
re.readContent().catch((err) => {
    console.error(err);
    console.timeEnd(testName)
    process.exit();
}).then((o) => {
    console.log(o);
    console.timeEnd(testName)
    process.exit();
});
