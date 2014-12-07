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
* Add VBB home page
* Remove linegraph globals
* Add a REST API to receive data and send visualizations
  - Create a REST client to match
*/


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var config = require('config.json')('./vbb_config.json');

// Globals
var linegraph_data = '';


// Default web pages/resources, always server up d3 and socket.io
app.get('/d3.min.js', function(req, res){
  console.log("Sending d3.min.js");
  res.sendFile(__dirname + '/d3.min.js');
});
app.get('/socket.io/socket.io.js', function(req, res){
  console.log("Sending socket.io.js");
  res.sendFile(__dirname + '/socket.io.js');
});

// Iterate enabled gui widgets and enable URLs/file listeners, etc
config.enabled_gui_widgets.forEach(function(entry) {
  widget_dir = __dirname + '/gui_widgets/' + entry + '/';
  // TODO: Read a widget specific config file on what URLs to open, etc later
  // Assume that each widget has these URLs exposed:
  // * index.html - basic holder for the visualization
  // * [widget name].cfg - (example: linegraph.cfg) widget-specific config
  // * [widget name]_widget.js - the visualization d3-based javascript
  // ... and these files monitored:
  // * [widget name].tsv - the .tsv input data (also sent)
  // * [widget name].del - a write to this file resets the visualization
  app.get('/' + entry, function(req, res){
    console.log("Sending " + entry + " index.html");
    res.sendFile(widget_dir + 'index.html');
  });
  app.get('/' + entry + '/' + entry + '_widget.js', function(req, res){
    console.log("Sending " + entry + "_widget.js");
    res.sendFile(widget_dir + entry + '_widget.js');
  });
  app.get('/' + entry + '/'  + entry + '.tsv', function(req, res){
    console.log("Sending " + entry + ".tsv cached data");
    res.send(linegraph_data);
    linegraph_data = ''; // TODO may want to hold on to this later
  });
  app.get('/' + entry + '/'  + entry + '.cfg', function(req, res){
    console.log("Sending " + entry + ".cfg");
    res.sendFile(widget_dir + entry + '.cfg');
  });


  // widget files to be monitored
  fs.watchFile(widget_dir + entry + '.tsv', function(curr,prev) {
      if (curr.isFile() != true) {
        // was likely just deleted
        return;
      };
      console.log(entry + ".tsv changed");
      fs.readFile(widget_dir + entry + '.tsv', function(err, data) {
        if (err) {
          console.log("Unable to access " + entry + ".tsv, continuing...");
          return;
        };
        linegraph_data = String(data); // TODO obviously need to change this
      });
      fs.unlink(widget_dir + entry + '.tsv');
      io.sockets.emit(entry + '/' + entry + '_refresh', entry + '/' + entry + '.tsv');
  });

  fs.watchFile(widget_dir + entry + '.del', function(curr,prev) {
      if (curr.isFile() != true) {
        return;
      };
      console.log(entry + ".del changed");
      linegraph_data = '';  // TODO change this later
      io.sockets.emit(entry + '/' + entry + '_delete', entry + '.tsv');
      fs.unlink(widget_dir + entry + '.del');
  });
});


http.listen(config.listen_port, function(){
  console.log('Visual Black Box server');
  console.log('configuration:');
  console.log('\tversion: ' + config.version);
  console.log('\tlisten port: ' + config.listen_port);
  console.log('\tenabled gui widgets: ' + config.enabled_gui_widgets);
});