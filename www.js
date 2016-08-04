#!/usr/bin/env node

/**
 * Module dependencies.
 */

require('app-module-path').addPath('./lib');
require('app-module-path').addPath('./bin');

const http = require('http'),
    url = require('url'),
    path = require('path'),
    debug = require('debug')('http');

const logger = require('Logger').www;

const CP = require('ConnectionPool'),
    RE = require('RenderEngine'),
    Session = require('Session'),
    Routing = require('Routing'),
    ObjectUtils = require('ObjectUtils');

const port = normalizePort(process.env.PORT || process.argv[2] || '8686');
logger.info('port: ' + port);

/**
 * Define app
 */

var app = function (request, response) {

    var readBody = function () {
        return new Promise((resolve, reject) => {
            var body = [];
            if (request.method === 'POST') {
                request.on('data', function (chunk) {
                    //TODO check all this shit
                    body.push(chunk);
                    if (body.length > 4) {
                        // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                        request.connection.destroy();
                        reject();
                    }
                }).on('end', function () {
                    resolve(JSON.parse(Buffer.concat(body).toString()));
                });
            } else {
                resolve({});
            }
        })
    };

    readBody()
        .catch(() => logger.error(new Error('flood')))
        .then((body) => {
            const uri = url.parse(request.url, true).pathname;

            logger.debug('app() uri', uri);

            if (Routing.isInBlackList(uri)) {
                logger.warn('app() blacklist uri requested', uri, request);
                response.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                response.end();
            } else {
                var content_ref = Routing.getRef(uri);
                try {
                    var cookies = parseCookies(request);
                    var sessionKey = cookies.session;
                    var session = {
                        data: body,
                        key: sessionKey,
                        query: url.parse(request.url, true).query,
                        cookies: cookies,
                        responseCode: 200,
                        setCookie: [],
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8'
                        }
                    };

                    var onFulfilled = () => {
                        var re = new RE(request, response, session);
                        re.init(content_ref, CP)
                            .catch(logger.error)
                            .then(readContent);
                    };

                    var checkSession = () => {
                        if (!sessionKey) {
                            var key = Session.generate_key();
                            Session.new(key, '{}')
                                .catch(logger.error)
                                .then(logger.debug);
                            session.key = key;
                            session.setCookie.push('session=' + key + '; HttpOnly');
                            session.storage = {};
                            onFulfilled();
                        } else {
                            Session.get(session.key)
                                .catch(logger.error)
                                .then((storage) => {
                                    session.storage = JSON.parse(storage);
                                    onFulfilled()
                                });
                        }
                    };

                    checkSession();


                    var readContent = (re) => {
                        re.readContent().catch((err) => {
                            logger.error(err);
                            response.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
                            response.end();
                        }).then((renderedResult) => {
                            if (renderedResult.session) {
                                Session.new(renderedResult.session.key, JSON.stringify(renderedResult.session.storage || {}))
                                    .catch(logger.error)
                                    .then(logger.debug);
                            }
                            response.setHeader('Set-Cookie', renderedResult.session.setCookie);
                            response.writeHead(renderedResult.session.responseCode, renderedResult.session.headers);
                            response.write(renderedResult.renderedResult, 'utf8');
                            response.end();
                        });
                    };

                } catch (err) {
                    response.end();
                }
            }
        });
};

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

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
 * Event listener for HTTP server 'error' event.
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
            logger.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server 'listening' event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

function parseCookies(request) {
    if (!request.headers) {
        return {};
    }
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}
