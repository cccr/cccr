var Fn = require('./Functions.js');
var fn = new Fn();

RenderEngine.Content = require("./Content.js");

function RenderEngine(request, response, session) {
    this.request = request;
    this.response = response;

    this.renderHierarchyLevel = 0;

    if (session) {
        this.session = session;
        var url = require("url");

        function parseCookies(request) {
            var list = {},
                rc = request.headers.cookie;

            rc && rc.split(';').forEach(function (cookie) {
                var parts = cookie.split('=');
                list[parts.shift().trim()] = decodeURI(parts.join('='));
            });

            return list;
        }

        this.session = {
            storage: {},
            query: url.parse(this.request.url, true).query,
            cookies: parseCookies(request),
            responseCode: 200,
            headers: {'Content-Type': 'text/html; charset=utf-8'}
        };




    }
    // console.log(this.request);
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
        if (pool) this.pool = pool;
        this.contentReference = contentReference;

        resolve();
    });

    //this.session =
};

RenderEngine.prototype.readWithContent = function (inputContent) {
    return new Promise((resolve, reject) => {
        var content = new RenderEngine.Content(this);
        content.parseContent(inputContent).then(resolve);
    });
};

RenderEngine.prototype.readContent = function () {
    var content = new RenderEngine.Content(this);
    return new Promise((resolve, reject) => {
        content.read().then(resolve);
    });
};

RenderEngine.prototype.render = function (content, component) {
    return new Promise((resolve, reject) => {
        if (component.properties.compute) {
            var context = {
                'component': component,
                'content': content,
                'renderEngine': this
            };

            var computed = new component.computeScriptObject(context);
            computed.getResult().then((o) => resolve(o)).catch((err) => {
                console.error(err);
                reject(err);
            });

        } else {
            //var tmplt = new Template(component, content);
            var {data, parsys} = content;
            var session = this.session.storage;
            var output = eval(component.templateString); //tmplt.render();
            console.log(this.renderHierarchyLevel);
            if (this.renderHierarchyLevel === 0) {
                resolve({renderedResult: output, session: this.session});
            } else {
                resolve({renderedResult: output});
            }
        }
    });
};

module.exports = RenderEngine;