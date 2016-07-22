var util = require('util');

function Pass(context) {
}

Pass.prototype.getResult = function () {
    return new Promise(function(resolve, reject) {
        try{


            resolve({'computed': [{"id":"7_1469096166885","name":"test","quotesLength":0},{"id":"9_1469096248720","name":"test","quotesLength":0},{"id":"4_1469094057685","name":"quotes","quotesLength":0},{"id":"5_1469094185390","name":"quotes","quotesLength":0},{"id":"1_1469014071319","name":"quotes","quotesLength":2},{"id":"2_1469014717452","quotesLength":0},{"id":"6_1469094284753","name":"quotes","quotesLength":0}]});
//            return result;

        } catch(err) {
            reject(err);
        }
    }.bind(this));
};

module.exports = Pass;