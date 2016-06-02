var util = require('util');

function Pass(_context) {
    this.args = _context._data.args;
}

Pass.prototype.getResult = function () {
    return new Promise(function(resolve, reject) {
        try{
            var result = {};

            Object.keys(this.args[0]).forEach(function(key) {
                result[key] = [];
            });

            this.args.forEach(function(obj) {
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