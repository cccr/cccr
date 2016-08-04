var url = require('url');

var logger = require('./Logger').Content;

function Content(RenderEngine) {
    this.RenderEngine = RenderEngine;
}

/**
 * get reference to content from RenderEngine.contentReference
 * Read and then parse ( @see Content.prototype.parseContent) content
 * @returns {Promise}
 */
Content.prototype.read = function () {
    return new Promise((resolve, reject) => {
        if (this.RenderEngine.contentReference.uri) {
            var uri = url.parse(this.RenderEngine.contentReference.uri, true);
            switch (uri.protocol) {
                case 'fs:':
                case 'file:': {
                    this.RenderEngine.contentReference.url = uri.hostname + uri.path;
                    this.RenderEngine.contentReference.type = 'fs';
                    break;
                }
                case 'redis:': {
                    this.RenderEngine.contentReference.key = uri.path;
                    this.RenderEngine.contentReference.type = 'redis';
                    break;
                }
                case 'https:':
                case 'http:': {
                    this.RenderEngine.contentReference.type = 'rest';
                    this.RenderEngine.contentReference.option = {
                        host: uri.hostname,
                        port: uri.port,
                        path: uri.path,
                        method: 'GET'
                    };
                    break;
                }
            }
        }

        switch (this.RenderEngine.contentReference.type) {
            case 'fs':
                var FsRead = require('_contentReaders/FsRead');
                FsRead.run(this.RenderEngine.contentReference.url,
                    (c) => this.parseContent(c),
                    JSON.parse)
                    .catch(reject)
                    .then((o) => resolve(o));
                break;
            case 'mongodb':
                var MongoDBRequest = require('_contentReaders/MongoDBRequest');
                MongoDBRequest.run(this.RenderEngine.contentReference,
                    (c) => this.parseContent(c),
                    this.RenderEngine)
                    .catch(reject)
                    .then((o) => resolve(o));
                break;
            case 'rest':
                var HttpRequest = require('_contentReaders/HttpRequest.js');
                HttpRequest.run(this.RenderEngine.contentReference.option,
                    (c) => this.parseContent(c),
                    JSON.parse,
                    (response) => {
                        logger.error('Content.read rest', response);
                        return {
                            renderedResult: ' '
                        }
                    })
                    .catch(reject)
                    .then((o) => resolve(o));
                break;
            case 'redis':
                var Redis = require('_contentReaders/Redis.js');
                Redis.run(this.RenderEngine.contentReference.key,
                    (c) => this.parseContent(c),
                    JSON.parse)
                    .catch(reject)
                    .then((o) => resolve(o));
        }
    });
};

/**
 * Get componentName, componentSource from readedContent
 * for each of data or parsys render String and pass content and component to RenderEngine.render
 *
 * @param readedContent String
 * @returns {Promise}
 */
Content.prototype.parseContent = function (readedContent) {
    return new Promise((resolve, reject) => {
        var ObjectUtils = require('ObjectUtils');
        this.componentName = ObjectUtils.getUniqueKey(readedContent);
        this.source = readedContent[this.componentName].source;
        logger.debug('parseContent()', this.componentName);

        var Component = require('Component');
        Component.readComponent(this.componentName, this.source).then((component) => {
            var promises = [];

            this.data = {};
            var data = Object.assign({}, component.defaults, readedContent[this.componentName].data);
            promises.push(Content.parseData(data, this.RenderEngine));

            this.args = readedContent[this.componentName].args;

            this.parsys = Object.assign({}, component.getDumbParsys());
            var readedParsys = readedContent[this.componentName].parsys;
            if (readedParsys && Object.keys(readedParsys).length > 0) {
                var parsys = Object.assign(this.parsys, readedParsys);
                promises.push(Content.parseParsys(parsys, this.RenderEngine));
            }

            Promise.all(promises)
                .then((parsedContentData) => {
                    logger.debug('parseContent() successful for', this.componentName, 'with', parsedContentData.length, 'parsedContentData');

                    parsedContentData.forEach((v) => {
                        logger.debug('parseContent() process parsedContentData', JSON.stringify(v));
                        if (v.data) {
                            Object.keys(v.data).forEach((k) => {
                                this.data[k] = v.data[k];
                            });
                        }
                        if (v.parsys) {
                            Object.keys(v.parsys).forEach((k) => {
                                this.parsys[k] = this.processParsys(k, v.parsys, component);
                            });
                        }
                        if (v.args) {
                            Object.keys(v.args).forEach((k) => {
                                this.args[k] = v.args[k];
                            });
                        }
                    });

                    logger.debug('parseContent() content and component now passing to RenderEngine.render()');

                    this.RenderEngine.render(this, component)
                        .catch(reject)
                        .then((o) => resolve(o));

                }, (error) => {
                    logger.error('parseContent()', error);
                    reject(error)
                });
        });
    })
};

/**
 * Concatinate generated Strings inside parsys
 * @param key String
 * @param renderedParsyses Array
 * @param component
 * @returns {string}
 */
Content.prototype.processParsys = function (key, renderedParsyses, component) {
    logger.debug('processParsys() for key', key);
    try {
        return renderedParsyses[key].map((currentValue, index) => {
            var keepUnwrapped = component.properties.keepUnwrapped.indexOf('${parsys.' + key + '}') > -1;
            console.log(keepUnwrapped);
            return keepUnwrapped
                ? currentValue.renderedResult || currentValue.computed
                : this.wrapParsys(key, index, currentValue.renderedResult || currentValue.computed);
        }).join('');
    } catch (err) {
        logger.error('processParsys() for key', err);
    }
};

Content.prototype.wrapParsys = function (key, index, renderedParsyses) {
    var encodedContentSource = new Buffer(JSON.stringify(this.RenderEngine.contentReference)).toString('base64');
    return `<div data-contentsrc="${encodedContentSource}" data-parsyssrc="${key}-${index}">${renderedParsyses}</div>`;
};

Content.parseParsys = function (parsyses, renderEngine) {

    logger.debug('parseParsys()', parsyses);

    /**
     * for each parsysSource generate String and return as an Object with passed key
     * @param parsysKey String
     * @param sources Array
     * @returns {Promise}
     */
    var pp = function (parsysKey, sources) {
        return new Promise((resolve, reject) => {
            var result = {};
            result[parsysKey] = [];

            var promises = [];

            sources.forEach((parsysSource) => {
                var re = renderEngine.clone();
                re.init(parsysSource); // pool already cloned
                promises.push(re.readContent());
            });

            Promise.all(promises)
                .then((renderedParsys) => {
                    renderedParsys.forEach((c) => {
                        result[parsysKey].push(c);
                    });
                    resolve(result);
                }, (error) => {
                    logger.error('parseParsys() pp()', error);
                    reject(error)
                });
        });
    };

    return new Promise((resolve, reject) => {
        var promises = [];
        Object.keys(parsyses)
            .filter((key) => {
                return parsyses[key]
            })
            .forEach((parsys) => {
                if (parsyses[parsys]) {
                    logger.debug('parseParsys() push into pp()', parsyses[parsys]);
                    promises.push(pp(parsys, parsyses[parsys]));
                }
            });

        Promise.all(promises)
            .then((renderedParsys) => {
                var result = {};
                renderedParsys.forEach((renderedParsys) => {
                    // console.log(renderedParsys);
                    result = Object.assign(result, renderedParsys);
                });

                logger.debug('parseParsys()', result);

                resolve({parsys: result});
            }, (error) => {
                logger.error('parseParsys()', error);
                reject(error)
            });
    });
};

Content.parseData = function (data, renderEngine) {

    logger.debug('parseData()', data);

    return new Promise((resolve, reject) => {
        var promises = [];

        //filter
        var passEmptyObjects = (key) => {
            return passOnlyObjects(key) && Object.keys(data[key]).length == 0
        };

        //filter
        var passOnlyObjects = (key) => {
            return typeof data[key] === 'object' && !Array.isArray(data[key]);
        };

        //replace empty data-objects with empty String
        Object.keys(data)
            .filter(passEmptyObjects)
            .forEach((key) => {
                data[key] = '';
            });

        //put data-objects into queue for rendering
        Object.keys(data)
            .filter(passOnlyObjects)
            .forEach((key) => {
                var re = renderEngine.clone();
                promises.push(re.readWithContent(data[key]));
            });

        if (promises.length > 0) {
            Promise.all(promises)
                .then((parsedContentData) => {
                    //match rendered String to data-object
                    Object.keys(data)
                        .filter(passOnlyObjects)
                        .forEach((key, index) => {
                            data[key] = parsedContentData[index].renderedResult || parsedContentData[index].computed;
                        });
                    resolve({data: data});
                }, (error) => {
                    logger.error('parseData()', error);
                    reject(error)
                });
        } else { //in case there are no complex object and as result no promises
            resolve({data: data});
        }
    });
};

module.exports = Content;