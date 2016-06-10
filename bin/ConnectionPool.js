function ConnectionPool() {
    this.pool = {};
}

ConnectionPool.prototype.connect = function(connection, callback, context) {
    if (connection.type === 'mongodb') {
        var atob = this.atob(connection.option.url);
        if (!this._isExists(atob)) {
            var MongoClient = require('mongodb').MongoClient;
            MongoClient.connect(connection.option.url, (err, database) => {
                if (err) throw err;

                this.pool[atob] = {};
                this.pool[atob]['database'] = database;
                this.pool[atob]['closeCallback'] = database.close;
                callback.bind(context)(database);

            });

        } else {
            callback.bind(context)(this.pool[atob].database);
        }
    }
};

ConnectionPool.prototype.atob = function(a) {
    return new Buffer(a).toString('base64');
};

ConnectionPool.prototype._isExists = function(id) {
    return this.pool[id];
};

ConnectionPool.prototype.closeAllConnections = function() {
    Object.keys(this.pool).forEach(function(key) {
        var closeCallback = this.pool[key].closeCallback;
        closeCallback.call(this.pool[key].database);
    }.bind(this));
};


module.exports = ConnectionPool;