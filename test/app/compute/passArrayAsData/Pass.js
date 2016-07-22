var util = require('util');

function Pass(context) {
    this.re = context.renderEngine;
    this.args = context.content.args;
}

Pass.prototype.getResult = function () {
    return new Promise(function (resolve, reject) {
        try {
            var result = {};

            fn = () => {
                Object.keys(this.args[0]).forEach(function (key) {
                    result[key] = [];
                });

                this.args.forEach(function (obj) {
                    Object.keys(this.args[0]).forEach(function (key) {
                        result[key].push(obj[key]);
                    });
                }.bind(this));

                resolve({'computed': result});
            };

            if (typeof this.args === 'object' && !Array.isArray(this.args)) {
                var ObjectUtils = require("../../../../bin/ObjectUtils.js");
                var componentName = ObjectUtils.getUniqueKey(this.args);
                var source = this.args[componentName].source;

                var Component = require("../../../../bin/Component.js");
                Component.readComponent(componentName, source)
                    .catch((err) => console.error(err))
                    .then((component) => {
                        var re = this.re.clone();
                        re.render(null, component)
                            .catch((err) => console.error(err))
                            .then((computedArray) => {
                                this.args = computedArray.renderedResult || computedArray.computed;
                                fn();
                            })
                    });
            } else {
                fn();
            }
        } catch (err) {
            reject(err);
        }
    }.bind(this));
};

module.exports = Pass;