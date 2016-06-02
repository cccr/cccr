var CP = require('../bin/ConnectionPool.js');
var RE = require('../bin/RenderEngine.js');

console.time('testFS');
var content_ref = {
    "type": "fs",
    "url": "./content/indexByComponentName.json"
};

var re = new RE();
re.init(content_ref, CP);
re.readContent().catch((err) => {
    console.error(err)
    console.timeEnd("testFS")
}).then((o) => {
    console.log(o)
    console.timeEnd("testFS")
});
