var CP = require('../bin/ConnectionPool.js');
var RE = require('../bin/RenderEngine.js');

console.time('testCompute');
var content_ref = {
    "type": "fs",
    "url": "./content/compute.json"
};

var re = new RE();
re.init(content_ref, CP);
re.readContent().catch((err) => {
    console.error(err)
    console.timeEnd("testCompute")
}).then((o) => {
    console.log(o)
    console.timeEnd("testCompute")
});
