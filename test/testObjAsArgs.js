var CP = require('../bin/ConnectionPool.js');
var RE = require('../bin/RenderEngine.js');

var testName = 'testPassObjToArgs';

console.time(testName);
var content_ref = {
    type: 'fs',
    url: './content/objToArgs.json'
};

var re = new RE({url: 'qwe://qwe.qwe/qwe?qwe=qwe'}, {}, {});
re.init(content_ref, CP);
re.readContent().catch((err) => {
    console.error(err);
    console.timeEnd(testName)
}).then((o) => {
    console.log('result');
    console.log(o);
    console.timeEnd(testName)
});
