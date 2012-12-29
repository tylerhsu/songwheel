const LISTEN_PORT = 8000;

var express = require('express');
var fs = require('fs');
var notequeue = require('./notequeue');
var songwheel = require('./songwheel');
var app = express();

app.all('*', function(req, res, next) {
    console.log(req.method + ' ' + req.path);
    next();
});

app.get('/', function(req, res) {
    var q = new notequeue.TestNoteQueue();
    songwheel.run(q, function(summary) {
        res.send("complete");
    });
});

// app.listen(LISTEN_PORT);
// console.log('Server listening on port ' + LISTEN_PORT);

var q = new notequeue.TestNoteQueue();
songwheel.run(q, function() {
    res.send("complete");
});