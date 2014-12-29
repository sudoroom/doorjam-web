#!/usr/bin/env node

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var util = require('util');
var async = require('async');
var express     = require('express');
var path        = require('path');
var bodyParser  = require('body-parser');
var argv = require('minimist')(process.argv.slice(2));
var settings = require('./settings.js')

settings.recent_hours = settings.recent_hours || 8;

var port = argv.port || settings.port || 3000;
var acl_path = path.join(settings.doorjam_path, "access_control_list");

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



function get_recent_failed_attempts(hours_back, callback) {
    hours_back = hours_back || 8;
    var recent = new Date();
    recent.setHours(recent.getHours() - hours_back); // subtract hours_back from current time
    var instream = fs.createReadStream(path.join(settings.doorjam_path, 'failed_attempts'));
    var outstream = new stream;
    outstream.readable = true;
    outstream.writable = true;
    var rl = readline.createInterface({
        input: instream,
        output: outstream,
        terminal: false
    });

    var counts = {}; // attempt count
    var attempts = [];

    rl.on('line', function(line) {
        if(!line) return;
        var attempt = JSON.parse(line);
        attempt.date = new Date(attempt.date);
        if(!attempt) return;

        if(attempt.date >= recent) {
            // count how many time the same code has been tried
            if(!counts[attempt.code]) {
                counts[attempt.code] = 1;
            } else {
                counts[attempt.code] += 1;
            }
            // if the code has been tried three or more times, add it as an attempt
            if(counts[attempt.code] >= 3) {
                attempts.push(attempt);
            }
        }
    });

    rl.on('close', function() {
        attempts.sort(function(a, b) {
            if(a.date > b.date) {
                return -1;
            } else if(a.date < b.date) {
                return 1
            } else {
                return 0;
            }
        });
        callback(null, attempts);
    });
}

function clean(str) {
    return str.replace(/[\t\n]+/g, ' ').replace(/\r+/g, '');
}

function grant_access(code, member, callback) {
    var str = "\n# " + clean(member.name) + " - " + clean(member.contact_info) + " - " + clean(member.collective);
    if(clean(member.notes)) {
        str += " - " + clean(member.notes);
    }
    str += " | " + new Date() + "\n";
    str += code + "\n";

    fs.appendFile(acl_path, str, callback);
}

app.get('/recent', function(req, res) {

    get_recent_failed_attempts(settings.recent_hours, function(err, attempts) {
        if(err) {
            return error(res, err);
        }
        res.send({status: 'success', data: {attempts: attempts, recent_hours: settings.recent_hours}});
    });
});

app.use('/access-control-list', function(req, res) {
    if(!req.body.password || (req.body.password != settings.admin_password)) {
        return error(res, "Wrong password. Hint: The password is in the file settings.js in the doorjam-web directory on the server");
    }

    fs.readFile(acl_path, {encoding: 'utf8'}, function(err, data) {
        if(err) {
            return error(res, err);
        }
        data = data.replace(/\n+/g, "\n");
        var list = data.split("\n");

        var entries = [];
        var i;
        for(i=0; i < list.length; i++) {

            // skip comments
            if(!list[i] || (list[i][0] == '#')) {
                continue;
            }
            
            // check if entry has a comment
            var comment;
            if(list[i-1] && (list[i-1][0] == '#')) {
                comment = list[i-1];
            }
            entries.push({
                comment: comment,
                code: list[i]
            });
        }

        res.send({status: 'success', data: {acl: entries}});
    });
});

app.use('/grant-access/:code', function(req, res, next) {
    var code = req.params.code;

    if(!code || !req.body.password || !req.body.name || !req.body.contact_info || !req.body.collective) {
        return error(res, "Missing physical access code, password, name, contact info or collective.");
    }

    if(req.body.password != settings.admin_password) {
        return error(res, "Wrong password. Hint: The password is in the file settings.js in the doorjam-web directory on the server");
    }

    grant_access(code, req.body, function(err) {
        if(err) {
            return error(res, "Error granting access: " + err);
        }

        res.send(JSON.stringify({status: 'success'}));
        next();
    });
});


console.log("Listening on http://localhost:" + port + "/")

app.listen(port);
