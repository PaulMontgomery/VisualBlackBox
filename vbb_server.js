/*
Copyright 2014 Paul Montgomery

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Data Visualization Web Server
-----------------------------
Execute: [sudo] node vbb_server.js

TODOs:
* Read a JSON configuration file to remove hardcoding below and get:
  - Port and optionally IP address to bind to
  - Which GUI widgets to display, configuration, watch files, etc
* Add a REST API to receive data and send visualizations
  - Create a REST client to match
* Add web page-based configuration editing
*/


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');


// ---------- Globals ---------
var linegraph_data = '';


// ---------- Web Resources ----------
app.get('/', function(req, res){
  console.log("Sending index.html");
  res.sendFile(__dirname + '/gui_widgets/linegraph/index.html');
});
app.get('/d3.min.js', function(req, res){
  console.log("Sending d3.min.js");
  res.sendFile(__dirname + '/d3.min.js');
});
app.get('/socket.io/socket.io.js', function(req, res){
  console.log("Sending socket.io.js");
  res.sendFile(__dirname + '/socket.io.js');
});
app.get('/linegraph_widget.js', function(req, res){
  console.log("Sending linegraph_widget.js");
  res.sendFile(__dirname + '/gui_widgets/linegraph/linegraph_widget.js');
});
app.get('/linegraph.tsv', function(req, res){
  console.log("Sending linegraph.tsv cached data");
  res.send(linegraph_data);
});
app.get('/linegraph.cfg', function(req, res){
  console.log("Sending linegraph.cfg");
  res.sendFile(__dirname + '/gui_widgets/linegraph/linegraph.cfg');
});

// ---------- File Watch List ----------
fs.watchFile(__dirname + '/gui_widgets/linegraph/linegraph.tsv', function(curr,prev) {
    if (curr.isFile() != true) {
      // linegraph.tsv was likely just deleted
      return;
    };
    console.log("linegraph.tsv changed");
    fs.readFile(__dirname + '/gui_widgets/linegraph/linegraph.tsv', function(err, data) {
      if (err) {
        console.log("Unable to access linegraph.tsv, continuing...");
        return;
      };
      linegraph_data = String(data);
    });
    fs.unlink(__dirname + '/gui_widgets/linegraph/linegraph.tsv');
    io.sockets.emit('linegraph_refresh', 'linegraph.tsv');
});

fs.watchFile(__dirname + '/gui_widgets/linegraph/linegraph.del', function(curr,prev) {
    if (curr.isFile() != true) {
      return;
    };
    console.log("linegraph.del changed");
    linegraph_data = '';
    io.sockets.emit('linegraph_delete', 'linegraph.tsv');
    fs.unlink(__dirname + '/gui_widgets/linegraph/linegraph.del');
});


http.listen(80, function(){
  console.log('Visual Black Box Server v0.0.1\n\t...listening on port 80');
});