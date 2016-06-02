var util = require('util'),
    Template = require('./Template.js');

RenderEngine.Content = require("./Content.js");

function RenderEngine() {}

RenderEngine.prototype.init = function(contentReference, pool) {
    this.pool = pool;
    this.contentReference = contentReference;
};

RenderEngine.prototype.readWithContent = function(inputContent){
    return new Promise((resolve, reject) => {
        var content = new RenderEngine.Content(this);
        content.parseContent(inputContent).then(resolve);
    });
};

RenderEngine.prototype.readContent = function(){
    var content = new RenderEngine.Content(this);
    return new Promise((resolve, reject) => {
        content.read().then(resolve);
    });
};

RenderEngine.prototype.render = function(content, component){
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
            var tmplt = new Template(component, content);
            var output = tmplt.render();
            resolve({renderedResult: output});
        }
    });
};

module.exports = RenderEngine;