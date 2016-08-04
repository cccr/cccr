require('app-module-path').addPath('../lib');
require('app-module-path').addPath('../bin');

var CP = require('ConnectionPool');
var RE = require('RenderEngine');

var testName = 'testParsys';
console.time(testName);

var content_ref = {
    type: 'fs',
    url: './content/parsys.json'
};

var re = new RE({url: 'qwe://qwe.qwe/qwe?qwe=qwe'}, {}, {});
re.init(content_ref, CP);
re.readContent().catch((err) => {
    console.error(err);
    console.timeEnd(testName)
}).then((o) => {
    console.log(o);
    console.timeEnd(testName)
});
