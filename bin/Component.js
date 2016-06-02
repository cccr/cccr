var PathModule = require("path");

const PROPERTIES_FILENAME = 'properties.json';
const TEMPLATE_FILENAME = 'template.html';
const DEFAULT_VALUES_FILENAME = 'default.json';

function Component() {
}

Component.readComponent = function (componentName, componentSource) {
    return new Promise((resolve, reject) => {
        var c = new Component();
        c.componentName = componentName;
        c.source = componentSource || {
                "type": "fs",
                "url": c.propertiesPath(c.componentName)
            };
        c.readComponent()
            .catch((err) => console.error(err))
            .then((component) => {
                resolve(component)
            });
    });
};

Component.prototype.readComponent = function () {
    var contentReader;
    var propertiesPath = this.source.url;
    var templatePath;
    var defaultValuesPath;

    switch (this.source.type) {
        case "fs":
            contentReader = require("./_contentReaders/FsRead.js");
            templatePath = this.templatePath();
            defaultValuesPath = this.defaultValuesPath();
            break;
        case "rest":
            contentReader = require("./_contentReaders/HttpRequest.js");
            templatePath = this.source.url.replace(PROPERTIES_FILENAME, TEMPLATE_FILENAME);
            defaultValuesPath = this.source.url.replace(PROPERTIES_FILENAME, DEFAULT_VALUES_FILENAME);
            break;
    }

    return new Promise((resolve, reject) => {
        var promises = [];

        promises.push(contentReader.run(propertiesPath, (properties) => {
            this.properties = properties;
        }, JSON.parse));

        promises.push(contentReader.run(defaultValuesPath, (defaults) => {
            this.defaults = defaults;
        }, JSON.parse, () => this.defaults = {}));

        promises.push(contentReader.run(templatePath, (template) => {
            this.templateString = template;
        }, (x) => x, () => this.templateString = ''));

        Promise.all(promises)
            .catch((error) => {
                reject(error)
            })
            .then(() => {
                if (this.properties.compute) {
                    var computeScriptPath = this.computeScriptPath(this.properties.script);
                    delete require.cache[computeScriptPath];
                    this.computeScriptObject = require(computeScriptPath);
                } else {
                    this.templateString = this.properties.isTemplateString ? this.templateString : `\`${this.templateString}\``;
                }
                resolve(this)
            });
    });
};

Component.prototype.propertiesPath = function () {
    return Component.resolveFullPath(this.componentName, PROPERTIES_FILENAME)
};

Component.prototype.templatePath = function () {
    return Component.resolveFullPath(this.componentName, TEMPLATE_FILENAME)
};

Component.prototype.defaultValuesPath = function () {
    return Component.resolveFullPath(this.componentName, DEFAULT_VALUES_FILENAME)
};

Component.prototype.computeScriptPath = function (scriptFileName) {
    return Component.resolveFullPath(this.componentName, scriptFileName)
};

Component.resolveFullPath = function (componentName, filename) {
    var path = componentName.split('.');
    path.unshift('.', 'app');
    var fullPath = PathModule.resolve(path.join(PathModule.sep), filename);
    //if (pathModule.relative(pathModule.resolve('app', 'components'), fullPath).startsWith('..')) throw Error('Access denied');
    return fullPath;
};

/**
 * Return dumb parsyses for template
 *
 * @this {Component}
 * @return {Object} parsys object with blank value
 */
Component.prototype.getDumbParsys = function () {
    var parsys = {};
    var regex = /\${parsys\.(.*?)}/gmi;
    var match;

    while (match = regex.exec(this.templateString))
        parsys[match[1]] = '';

    return parsys;
};

module.exports = Component;