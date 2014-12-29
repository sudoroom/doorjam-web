#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var async = require('async');
var express     = require('express');
var path        = require('path');
var bodyParser  = require('body-parser');
var argv = require('minimist')(process.argv.slice(2));
var settings = require('./settings.js')

var port = argv.port || settings.port || 3000;

function error(res, msg) {
  res.status(500).send(JSON.stringify({
      status: 'error',
      msg: msg
  }));
}

var app = express();

app.use(express.static(path.join(__dirname, 'static')));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/foo', function(req, res) {
    res.send({status: 'success', data: 42});
});


console.log("Listening on http://localhost:" + port + "/")

app.listen(port);
