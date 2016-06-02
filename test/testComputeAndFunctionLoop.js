var CP = require('../bin/ConnectionPool.js');
var RE = require('../bin/RenderEngine.js');

var testName = 'testComputeAndFunctionLoop';

console.time(testName);
var content_ref = {
    type: 'fs',
    url: './content/computePlusFunc.json'
};

var re = new RE();
re.init(content_ref, CP);
re.readContent().catch((err) => {
    console.error(err);
    console.timeEnd(testName)
}).then((o) => {
    console.log(o);
    console.timeEnd(testName)
});
