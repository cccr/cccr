var Fn = require('./Functions.js');
var fn = new Fn();

RenderEngine.Content = require("./Content.js");

function RenderEngine(request, response) {
    this.request = request;
    this.response = response;
    // console.log(this.request);
}

RenderEngine.prototype.clone = function () {
    var renderEngine = new RenderEngine(this.request, this.response);
    renderEngine.pool = this.pool;
    return renderEngine;
};

RenderEngine.prototype.init = function (contentReference, pool) {
    if (pool) this.pool = pool;
    this.contentReference = contentReference;
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
            computed.getResult().then((o) => resolve(o));

        } else {
            //var tmplt = new Template(component, content);
            var {data, parsys} = content;
            var output = eval(component.templateString); //tmplt.render();
            resolve({renderedResult: output});
        }
    });
};

module.exports = RenderEngine;