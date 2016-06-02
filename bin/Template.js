Template.Fn = require('./Functions.js');

/**
 *
 * @param component Object
 * @param content Object
 * @constructor
 */
function Template(component, content) {
    this.template = component.templateString;
    this.data = content.data;
    this.parsys = content.parsys;
}

Template.prototype.render = function () {
    var {template, data, parsys} = this;
    var fn = new Template.Fn();
    return eval(template);
};

module.exports = Template;