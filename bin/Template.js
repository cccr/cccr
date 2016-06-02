Template.Fn = require('./Functions.js');

/**
 *
 * @param component Object
 * @param content Object
 * @constructor
 */
function Template(component, content) {
    // console.log(component);
    // console.log(content);

    this.template = component.templateString;
    this.data = content.data;
    this.parsys = content.parsys;
}

Template.prototype.render = function () {
    var {template, data, parsys} = {template: this.template, data: this.data, parsys: this.parsys};
    var fn = new Template.Fn();
    return eval(template);
};

module.exports = Template;