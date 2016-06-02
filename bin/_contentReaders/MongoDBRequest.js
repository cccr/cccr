var ObjectId = require('mongodb').ObjectID;

function MongoDBRequest({id, callback, collection, resolve, reject, context}) {
    this.id = id;
    this.callback = callback;
    this.collectionName = collection;
    this.resolve = resolve;
    this.reject = reject;
    this.context = context;
}

MongoDBRequest.run = function(_connectionURL, _callback, context) {

//console.log(arguments);

    return new Promise((resolve, reject) => {
        var args = {
            id: _connectionURL.url,
            resolve: resolve,
            reject: reject,
            callback: _callback,
            context: context,
            collection: _connectionURL.option.collection
        };

        var mongoDBRequest = new MongoDBRequest(args);

        context.pool.connect(_connectionURL, mongoDBRequest._findContentDB, mongoDBRequest);

    });
};

MongoDBRequest.prototype._findContentDB = function(database) {
    database.collection(this.collectionName).findOne({"_id": new ObjectId(this.id)}, { _id: 0, qty: 0 },
        (err, doc) => {
            if (err || doc === null) {
                this.reject(err || new Error("doc is null"));
            }
            this.resolve(this.callback.bind(this.context)(doc));
        });
};

module.exports = MongoDBRequest;