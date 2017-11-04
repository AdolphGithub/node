const express = require('express');
const utility = require('utility');

var app = express();

app.get('/',(req,res) => {
    res.send('hello world');
});

app.get('/test',(req,res) => {
    let query = req.query ? req.query : {};
    if(query.hasOwnProperty('q')){
        res.send(utility.md5(query.q));
    }
});

app.get('/test/sha1',(req,res) => {
    let query = req.query ? req.query : {};
    if(query.hasOwnProperty('q')){
        res.send(utility.sha1(query.q));
    }
});

var server = app.listen(3000,() => {
    var address = server.address().address;

    var port = server.address().port;

    console.dir(`express serve run ${address}:${port}`);
});