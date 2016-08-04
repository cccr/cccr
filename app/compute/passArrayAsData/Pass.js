function Pass(context) {
    this.args = context.content.args;
    this.re = context.renderEngine;
}

Pass.prototype.getResult = function () {
    return new Promise(function(resolve, reject) {
        try {
            var result = {};

            fn = () => {
                Object.keys(this.args[0]).forEach(function (key) {
                    result[key] = [];
                });

                var cnt = this.re.session.query.cnt;

                this.args.slice(0, cnt).forEach(function(obj) {
                    Object.keys(this.args[0]).forEach(function(key) {
                        result[key].push(obj[key]);
                    });
                }.bind(this));

                resolve({'computed': result});
            };

            if (typeof this.args === 'object' && !Array.isArray(this.args)) {
                var ObjectUtils = require('ObjectUtils');
                var componentName = ObjectUtils.getUniqueKey(this.args);
                var source = this.args[componentName].source;

                var Component = require('Component.js');
                Component.readComponent(componentName, source)
                    .catch((err) => console.error(err))
                    .then((component) => {
                        var re = this.re.clone();
                        re.render({args: this.args[componentName].args}, component)
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