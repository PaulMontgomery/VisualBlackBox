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
* Add a REST API to receive data and send visualizations
  - Create a REST client to match
*/


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var config = require('config.json')('./vbb_config.json');


var widget_data = {};


console.log('Visual Black Box server');
console.log('configuration:');
console.log('\tversion: ' + config.version);
console.log('\tlisten port: ' + config.listen_port);
console.log('\tenabled gui widgets: ' + config.enabled_gui_widgets);


// Default web pages/resources, always serve up d3 and socket.io js libs
app.get('/d3.min.js', function(req, res){
  console.log("Sending d3.min.js");
  res.sendFile(__dirname + '/d3.min.js');
});
app.get('/socket.io/socket.io.js', function(req, res){
  console.log("Sending socket.io.js");
  res.sendFile(__dirname + '/socket.io.js');
});

// Iterate enabled gui widgets and enable URLs/file listeners, etc
config.enabled_gui_widgets.forEach(function(widget_name) {
  widget_dir = __dirname + '/gui_widgets/' + widget_name + '/';
  console.log(widget_name + " widget configuration:");
  console.log("\tenabled URLs:");
  // Read the required [widget_name]_config.json for url and file info
  var widget_config = require('config.json')(widget_dir + widget_name + '_config.json');
  // Iterate each widget required URL and enable it
  widget_config.enabled_urls.forEach(function(url_record) {
    if (url_record['file_name'].length > 0) {
      // Just serve normal files
      console.log("\t\t" + widget_name + '/' + url_record['url']);
      app.get('/' + widget_name + '/' + url_record['url'], function(req, res){
        console.log("sending " + widget_name + ":" + url_record['file_name']);
        res.sendFile(widget_dir + url_record['file_name']);
      });
    } else {
      // Special case, cache data in widget-specific memory
      console.log("\t\t" + widget_name + '/' + url_record['url'] + " (cached data)");
      app.get('/' + widget_name + '/'  + url_record['url'], function(req, res){
        console.log("sending " + widget_name + ":" + url_record['url'] + " cached data");
        res.send(widget_data[widget_name]);
        widget_data[widget_name] = '';
      });
    };
  });

  // Iterate the file events and enable them
  console.log("\tfile events:");
  widget_config.file_events.forEach(function(file_event_record) {
    console.log("\t\t" + file_event_record['event_name'] + " - type: " + file_event_record['action'])
    fs.watchFile(widget_dir + file_event_record['file_name'], function(curr,prev) {
        if (curr.isFile() != true) { // was likely just deleted
          return;
        };
        console.log("event: " + widget_name + "/" + file_event_record['file_name'] + " changed");
        if (file_event_record['action'] == "store") {
          fs.readFile(widget_dir + file_event_record['file_name'], function(err, data) {
            if (err) {
              console.log("Unable to access " + widget_name + "/" + file_event_record['file_name'] + ", continuing...");
              return;
            };
            widget_data[widget_name] = String(data);
          });
        };
        if (file_event_record['action'] == "delete") {
          widget_data[widget_name] = '';
        };
        fs.unlink(widget_dir + file_event_record['file_name']);
        io.sockets.emit(widget_name + '/' + file_event_record['event_name'],
          widget_name + '/' + file_event_record['event_data']);
    });
  });
});


http.listen(config.listen_port, function(){
});