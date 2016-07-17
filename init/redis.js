#!/usr/local/bin/node

var redis = require("redis"),
    client = redis.createClient({"host": "localhost", "port": 32768}),
    fs = require('fs'),
    path = require('path');

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

walk('../content/its', function(err, results) {
    if (err) throw err;
    results.forEach(writeToRedis)
});

walk('../app/its', function(err, results) {
    if (err) throw err;
    results.forEach(writeToRedis)
});

function writeToRedis(filePath) {
    console.log(filePath);
    fs.readFile(filePath, "utf8", (err, content) => {
        var key = getKeyFromPath(filePath);
        client.set(key, content, redis.print);
    });
}

function getKeyFromPath(filePath) {
    var relativePath = path.relative(path.resolve('..'), filePath);
    if (path.sep === '/') return '/' + relativePath;
    return '/' + relativePath.replace(new RegExp(escapeRegExp(path.sep), 'g'), '/');
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}