var exec = require('child_process').exec;
var readdir = require('fs').readdir;

var testRunner = function(filename) {
    var cmd = `cd ./test && node ./${filename}`;
    exec(cmd, function(error, stdout, stderr) {
        // console.log(stdout);
        if (!!error) {
            console.log('ERROR in ' + filename);
        } else {
            console.log(filename + ' successfully');
        }
    });
};

var runner = function(err, files) {
    files
        .filter(function(file) { return file.substr(0, 4) ==='test' && file.substr(-3) === '.js'; })
        .forEach(testRunner);
};

readdir('./test', runner);