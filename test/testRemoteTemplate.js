require('app-module-path').addPath('../lib');
require('app-module-path').addPath('../bin');

var CP = require('ConnectionPool');
var RE = require('RenderEngine');

var port = 8855;
var http = require("http");
var headers = {"Content-Type": "application/json"};

var app = function (request, response) {
    var data;
    switch (request.url) {
        case "/content.json":
            data = JSON.stringify({
                                      "simpleAs": {
                                          "source": {
                                              "type": "rest",
                                              "url": "http://localhost:8855/properties.json"
                                          },
                                          "parsys": {},
                                          "data": {
                                              "text": {
                                                  "simpleAs2": {
                                                      "data": {
                                                          "text": "inner 0",
                                                          "text2": "inner 2"
                                                      }
                                                  }
                                              }
                                          },
                                          "args": {}
                                      }
                                  });
            break;
        case "/properties.json":
            data = JSON.stringify({
                                      "keepUnwrapped": [],
                                      "isTemplateString": false
                                  });
            break;
        case "/template.html":
            data = "4785 ${data.text} 7998";
            break;
        default: {
            data = "{}";
        }
    }

    response.writeHead(200, headers);
    response.write(data, "binary");
    response.end();
};

var server = http.createServer(app);

server.listen(port);

var testName = 'testRestTmpltAndData';
console.time(testName);
var content_ref = {
    "type": "rest",
    "option": {
        "host": "localhost",
        "path": "/content.json",
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