var redis = require("redis"),
    client = redis.createClient({"host": "192.168.99.100", "port": 6379});
var crypto = require('crypto');

Session.generate_key = function() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};

function Session() {}

Session.new = function(content) {
    return new Promise((resolve, reject) => {
        var key = Session.generate_key();
        client.set(key, content, (err, reply) => {
            if (err) {
                reject(err);
            }
            resolve(key)
        });
    })
};

Session.get = function(key) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, reply) => {
            if (err) {
                reject(err);
            }
            console.log(reply);
            resolve(reply);
        });
    });
};


module.exports = Session;

// Session.new("sdfdsf");
// Session.get("99a7f0600e42892b60c89a42fcd65dec76644ad96c0dce06bfd8e7d13223b3c0").then(console.log);