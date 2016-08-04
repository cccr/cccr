var redis = require("redis"),
    client = redis.createClient({"host": "redis", "port": 6379});

function Redis() {}

Redis.run = (key, callback, transformer, errorHandler) => {
    // console.log("zzzzz");
    // console.log(key);
    return new Promise((resolve, reject) => {

        /*client.on("error", function (err) {
            if (errorHandler) {
                resolve(errorHandler(err));
                //client.quit()
                return;
            }
            reject(err);
            //client.quit()
            return;
        });*/

    client.get(key, function (err, reply) {
        if (err) {
            if (errorHandler) {
                resolve(errorHandler(err));
                //client.quit()
                return;
            }
            reject(err);
            //client.quit()
            return;
        }
        // console.log(reply);
        var transformedContent = reply;
        if (transformer != undefined) {
            transformedContent = transformer(reply);
        }
         // console.log(transformedContent);
        //client.quit()
        resolve(callback(transformedContent));
    });
});

};

module.exports = Redis;