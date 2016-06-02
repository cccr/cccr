var Engine = require("../bin/RenderEngine.js");

var CP = require('../bin/ConnectionPool.js');


var content2 = {
    type: 'mongodb',
    option: {
        url: 'mongodb://localhost:27017/test',
        collection: 'form'
    },
    url: '56cdfc8ac71de8bd4badc0eb'
};


console.time('a');

var pool = new CP();


console.time('b');
var next = function(content){
    var ec2 = new Engine(content, pool);

    ec2.render().catch(function (err) {
        console.error(err.stack);
        pool.closeAllConnections();
        process.exit(1)
    }).then(function (renderedResult) {
        console.log(renderedResult.renderedResult);
        console.timeEnd('b');
        pool.closeAllConnections();
    });
};

next(content2);
