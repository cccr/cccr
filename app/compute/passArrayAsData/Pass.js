var url = require("url");

function Pass(context) {
    this.args = context.content.args;
    this.re = context.renderEngine;
}

Pass.prototype.getResult = function () {
    return new Promise(function(resolve, reject) {
        try{
            var result = {};

            Object.keys(this.args[0]).forEach(function(key) {
                result[key] = [];
            });

            var cnt = url.parse(this.re.request.url, true).query.cnt;

            this.args.slice(0, cnt).forEach(function(obj) {
                Object.keys(this.args[0]).forEach(function(key) {
                    result[key].push(obj[key]);
                });
            }.bind(this));


            resolve({'computed': result});
//            return result;

        } catch(err) {
            reject(err);
        }
    }.bind(this));
};

module.exports = Pass;