var util = require('util');

function Sleep(_context) {
    this.args = _context._data.args;
}

Sleep.prototype.getResult = function () {
    return new Promise(function(resolve, reject) {
        try{
            setTimeout(function() { resolve({'computed': 'sleeped'}) }, this.args[0]);
            //resolve({'computed': 'sleeped'});
        } catch(err) {
            reject(err);
        }
    }.bind(this));
};

module.exports = Sleep;