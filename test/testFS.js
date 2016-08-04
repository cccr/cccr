require('app-module-path').addPath('../lib');
require('app-module-path').addPath('../bin');

var CP = require('ConnectionPool');
var RE = require('RenderEngine');

console.time('testFS');
var content_ref = {
    "type": "fs",
    "url": "./content/indexByComponentName.json"
};

var re = new RE({url: 'qwe://qwe.qwe/qwe?qwe=qwe'}, {}, {});
re.init(content_ref, CP);
re.readContent().catch((err) => {
    console.error(err)
    console.timeEnd("testFS")
}).then((o) => {
    console.log(o)
    console.timeEnd("testFS")
});
