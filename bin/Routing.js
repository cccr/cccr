function Routing() {
}

var routing;
var blacklist;

var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');
var ObjectUtils = require('ObjectUtils');
var logger = require('Logger').Routing;

var init = function () {
    fs.readFile(path.join(process.cwd(), 'bin/routing.yml'), 'utf8', (err, content) => {
        if (err) {
            logger.warn('init() routing', err);
            routing = {};
        } else {
            routing = yaml.safeLoad(content);
        }
    });

    fs.readFile(path.join(process.cwd(), 'bin/blacklist.json'), 'utf8', (err, content) => {
        if (err) {
            logger.warn('init() blacklist', err);
            blacklist = [];
        } else {
            blacklist = JSON.parse(content);
        }
    });

};

init();


Routing.isInBlackList = function () {
    //TODO regex
    return false;
};

Routing.getRef = function (uri) {
    uri = (uri.endsWith('/')) ? uri += 'index' : uri;

    var content_ref = ObjectUtils.getKey(routing, uri.split('/').slice(1));

    if (content_ref && content_ref['__ref']) {
        content_ref = content_ref['__ref']
    } else {
        logger.debug('getRef() set default ref');
        var filename = path.join(process.cwd(), 'content', uri) + '.json';
        content_ref = {
            type: 'fs',
            url: filename
        };
    }

    logger.debug('getRef()', content_ref);
    return content_ref;
};

module.exports = Routing;