var redis = require('redis'),
    client = redis.createClient({
        'host': process.env.ENGRUN_SESSION_REDIS_HOST,
        'port': process.env.ENGRUN_SESSION_REDIS_PORT
    });
var crypto = require('crypto');

Session.generate_key = function () {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};

function Session() {}

Session.new = function (key, content) {
    return new Promise((resolve, reject) => {
        client.setex(key, 604800, content, (err, reply) => {
            if (err) {
                reject(err);
            }
            resolve(reply)
        });
    })
};

Session.get = function (key) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, reply) => {
            if (err) {
                reject(err);
            }
            resolve(reply);
        });
    });
};


module.exports = Session;

// Session.new("sdfdsf");
// Session.get("99a7f0600e42892b60c89a42fcd65dec76644ad96c0dce06bfd8e7d13223b3c0").then(console.log);