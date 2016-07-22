const logger = require('./Logger').RenderEngine;

const Fn = require('./Functions.js');
const Router = require('./Router.js');
const fn = new Fn();

RenderEngine.Content = require("./Content.js");

function RenderEngine(request, response, session) {
    this.request = request;
    this.response = response;

    this.renderHierarchyLevel = 0;

    if (session) {
        this.session = session;
    }
    logger.debug('constructed');
}

RenderEngine.prototype.clone = function () {
    var renderEngine = new RenderEngine(this.request, this.response);
    renderEngine.pool = this.pool;
    renderEngine.session = this.session;
    renderEngine.renderHierarchyLevel = this.renderHierarchyLevel + 1;
    return renderEngine;
};

RenderEngine.prototype.init = function (contentReference, pool) {
    return new Promise((resolve, reject) => {
        if (pool) {
            this.pool = pool;
        }
        this.contentReference = contentReference;
        logger.debug('initialized');

        resolve(this);
    });

    //this.session =
};

RenderEngine.prototype.readWithContent = function (inputContent) {
    logger.debug('readWithContent()', inputContent);
    return new Promise((resolve, reject) => {
        var content = new RenderEngine.Content(this);
        content.parseContent(inputContent)
            .catch(reject)
            .then(resolve);
    });
};

RenderEngine.prototype.readContent = function () {
    logger.debug('readContent()');
    var content = new RenderEngine.Content(this);
    return new Promise((resolve, reject) => {
        content.read()
            .catch(reject)
            .then(resolve);
    });
};

/**
 *
 * @param content
 * @param Component component
 * @returns {Promise}
 */
RenderEngine.prototype.render = function (content, component) {
    return new Promise((resolve, reject) => {
        console.log(component.componentName);
        if (component.properties.compute) {
            logger.debug('render() compute', component.componentName);
            var context = {
                'component': component,
                'content': content,
                'renderEngine': this
            };

            var computed = new component.computeScriptObject(context);
            computed.getResult().then((o) => resolve(o)).catch((err) => {
                logger.error('render() computed getResult', component.componentName, component.source, err);
                reject(err);
            });

        } else {
            var {data, parsys} = content;
            var session = this.session.storage;
            var output = eval(component.templateString);
            logger.debug('render() renderHierarchyLevel', this.renderHierarchyLevel);

            var router = Router.router();
            Object.keys(data)
                .filter((key) => typeof data[key] === 'string')
                .forEach((a) => data[a] = eval(`\`${data[a]}\``));
            try {
                var output = eval(component.templateString);
                if (this.renderHierarchyLevel === 0) {
                    logger.debug('render() resolve', output, this.session);
                    resolve({renderedResult: output, session: this.session});
                } else {
                    logger.debug('render() resolve', output);
                    resolve({renderedResult: output});
                }
            } catch (error) {
                reject(error)
            }

        }
    });
};

module.exports = RenderEngine;