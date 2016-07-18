var MongoClient = require('mongodb').MongoClient
    , assert = require('assert')
    , ObjectId = require('mongodb').ObjectID;

var CP = require('../bin/ConnectionPool.js');
var RE = require('../bin/RenderEngine.js');

var collection = 'testData';
var content_ref = {
    type: 'mongodb',
    option: {
        url: 'mongodb://localhost:27017/test',
        collection: collection
    }
};

MongoClient.connect(content_ref.option.url, function (err, db) {
    assert.equal(null, err);
    insertDocument(db)
        .then((id) => {
            content_ref.url = id;
            console.time('testMongo');
            test()
                .then(() => {
                    deleteTestContent(db)
                        .then(() => {
                            db.close()
                        })
                });
        });
});

var insertDocument = function (db) {
    return new Promise((resolve, reject) => {
        db.collection(collection).insertOne(
            {
                "simpleAs": {
                    "parsys": {},
                    "data": {
                        "text": "as",
                        "text2": {
                            "simpleAs2": {
                                "data": {
                                    "text": "inner 0",
                                    "text2": "inner 2"
                                }
                            }
                        },
                        "text3": "333"
                    },
                    "args": {}
                }
            }
            , function (err, result) {
                assert.equal(err, null);
                resolve(result.insertedId);
            });
    });
};

var deleteTestContent = function (db) {
    return new Promise((resolve, reject) => {
        db.collection(collection).deleteMany({}, function (err, results) {
            assert.equal(err, null);
            resolve();
        });
    });
};

function test(callback) {
    return new Promise((resolve, reject) => {
        var re = new RE({url: 'qwe://qwe.qwe/qwe?qwe=qwe'}, {}, {});
        var cp = new CP();
        re.init(content_ref, cp);
        re.readContent().catch((err) => {
            console.error(err);
            console.timeEnd("testMongo");
            cp.closeAllConnections();
            resolve();
        }).then((o) => {
            console.log(o);
            console.timeEnd("testMongo");
            cp.closeAllConnections();
            resolve();
        });
    });
}