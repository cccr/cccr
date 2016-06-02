var CP = require('../bin/ConnectionPool.js');
var RE = require('../bin/RenderEngine.js');

console.time('testFunctionLoop');
var content_ref = {
    "type": "fs",
    "url": "./content/head.json"
};

var re = new RE();
re.init(content_ref, CP);
re.readContent().catch((err) => {
    console.error(err)
    console.timeEnd("testFunctionLoop")
}).then((o) => {
    console.log(o)
    console.timeEnd("testFunctionLoop")
});
