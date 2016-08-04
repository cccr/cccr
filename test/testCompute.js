require('app-module-path').addPath('../lib');
require('app-module-path').addPath('../bin');

var CP = require('ConnectionPool');
var RE = require('RenderEngine');

console.time('testCompute');
var content_ref = {
    "type": "fs",
    "url": "./content/compute.json"
};

var re = new RE({url: 'qwe://qwe.qwe/qwe?qwe=qwe'}, {}, {});
re.init(content_ref, CP);
re.readContent().catch((err) => {
    console.error(err)
    console.timeEnd("testCompute")
}).then((o) => {
    console.log(o)
    console.timeEnd("testCompute")
});
