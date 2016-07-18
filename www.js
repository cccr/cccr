#!/usr/bin/env node

/**
 * Module dependencies.
 */

var http = require("http"),
    url = require("url"),
    path = require("path"),
    debug = require('debug')('http');

var CP = require('./bin/ConnectionPool.js');
var RE = require('./bin/RenderEngine.js');


const port = normalizePort(process.env.PORT || process.argv[2] || '8686');
console.log('port: ' + port);

/**
 * Define app
 */

var app = function (request, response) {
    var uri = url.parse(request.url, true).pathname,
        filename = path.join(process.cwd(), 'content', uri) + '.json';

    // console.log(uri, filename);
    //var url_parts = url.parse(request.url, true);
    //var query = url_parts.query;
    if (uri.startsWith("/topics") || uri.startsWith("/images") || uri.startsWith("/favicon")) {
        response.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        response.end();
    } else {
        try {

            var content_ref = {
                type: 'fs',
                url: filename
            };

            var session = {};

            var re = new RE(request, response, session);

            var readContent = function() {
                re.readContent().catch((err) => {
                    console.error(err);
                    response.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
                    response.end();
                }).then((renderedResult) => {

                    if (renderedResult.session) {
                        // console.log(JSON.stringify(renderedResult.session));

                    }

                    response.writeHead(renderedResult.session.responseCode, renderedResult.session.headers);
                    response.write(renderedResult.renderedResult, "utf8");
                    response.end();
                });
            };



            re.init(content_ref, CP).then(readContent);

        } catch (err) {
            response.end();
        }
    }
};

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
