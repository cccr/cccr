function Env(context) {
    this.args = context.content.args;
    this.re = context.renderEngine;
}

Env.prototype.getResult = function () {
    return new Promise(function(resolve, reject) {
        try{
            var result = {};

            this.args.forEach(function(key) {
                result[key] = process.env[key];
            });

            resolve({'computed': result});

        } catch(err) {
            reject(err);
        }
    }.bind(this));
};

module.exports = Env;