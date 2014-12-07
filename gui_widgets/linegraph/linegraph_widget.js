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


Linegraph GUI Widget
--------------------
TODO:
* animation/transitions
* add SVG text/notification if some config is wrong
* add mouseover numbers
*/


var full_data = [];
var x_title = "X Axis Title";
var x_date_format = null;
var y_title = "Y Axis Title";
var y_max = 100;
var line_colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"];
var line_type = "linear";
var line_width = "1.5px";
var axis_font = "10px sans-serif";

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

function line(close_position) {
  var line_var = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d["close" + close_position]); })
      .interpolate(line_type);
  return line_var;
};

function redraw_svg() {
  d3.selectAll("svg").remove();
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  return svg;
};

function receive_data(data_file) {
  svg = redraw_svg();
  d3.select("body").style("font", axis_font);

  d3.tsv(data_file, function(error, data) {
    if (error) {
      console.log("tsv file receive error");
    };
    if (data === undefined) {
      console.log("No data received");
      return;
    }
    data.forEach(function(d) {
      d.date = x_date_format.parse(d.date);
    });
    full_data = data.concat(full_data);
    if (full_data.length > y_max) {
      full_data = full_data.slice(0, y_max);
    };
    data = full_data;
    if (data.length <= 0) {
      console.log("Warning: 0 records of data received");
      d3.select("g")
        .append("text")
          .attr("x", width / 2 - 100)
          .attr("y", height / 2)
          .attr("font-size", "25px")
          .text("Waiting for data...")
          .transition()
          .duration(3000)
          .style("opacity", 0.2)
          .transition()
          .delay(3000)
          .style("opacity", 1);
      return;
    };
    x.domain(d3.extent(data, function(d) { return d.date; }));

    y_domain_array = [];
    total_close = 0;
    while(true) {
      data.forEach(function(d) {
        y_domain_array.push(d["close" + total_close]);
      });
      if (full_data[0] === undefined) {
        console.log("warning: full_data was undefined")
        break;
      };
      if (full_data[0]["close" + (total_close + 1)] === undefined) {
        break;
      };
      total_close += 1;
    };
    y.domain(d3.extent(y_domain_array));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("x", width)
        .attr("dy", "-.5em")
        .attr("font-size", "15px")
        .style("text-anchor", "end")
        .text(x_title);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("font-size", "15px")
        .attr("dy", ".8em")
        .style("text-anchor", "end")
        .text(y_title);

    svg.selectAll(".axis path")
        .style("fill", "none")
        .style("stroke", "#000")
        .style("shape-rendering", "crispEdges");
    svg.selectAll(".axis line")
        .style("fill", "none")
        .style("stroke", "#000")
        .style("shape-rendering", "crispEdges");

    for (close_pos = 0; close_pos <= total_close; close_pos++) {
      line_color = "black";
      if (line_colors[close_pos] !== undefined) {
        line_color = line_colors[close_pos];
      };
      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line(close_pos))
          .attr("stroke-width", line_width)
          .attr("stroke", line_color)
          .attr("fill", "none")
    };
  });
};

function receive_config(config_file) {
  d3.tsv(config_file, function(error, data) {
    data.forEach(function(d) {
      switch (d.name) {
        case "x_title":
          x_title = d.value;
          console.log("Config: x_title = " + x_title);
          break;
        case "x_date_format":
          x_date_format = d3.time.format(d.value);
          console.log("Config: x_date_format = " + d.value);
          break;
        case "y_title":
          y_title = d.value;
          console.log("Config: y_title = " + y_title);
          break;
        case "y_max":
          y_max = d.value;
          console.log("Config: y_max = " + y_max);
          break;
        case "line_colors":
          line_colors = d.value.split(',');
          console.log("Config: line_colors = " + line_colors);
          break;
        case "line_type":
          line_type = d.value;
          console.log("Config: line_type = " + line_type);
          break;
        case "line_width":
          line_width = d.value;
          console.log("Config: line_width = " + line_width);
          break;
        case "axis_font":
          axis_font = d.value;
          console.log("Config: axis_font = " + axis_font);
          break;

        default:
          console.log("Config: Unknown configuration option: " + d.name);
          break;
      };
    });
  });
};


// Websockets connection to receive server pushed data
var socket = io();
socket.on('linegraph/linegraph_config', function(msg){
  console.log("Received linegraph_config command");
  receive_config(msg);
});

socket.on('linegraph/linegraph_refresh', function(msg){
  console.log("Recevied linegraph_refresh command");
  receive_data(msg);
});

socket.on('linegraph/linegraph_delete', function(msg){
  console.log("Received linegraph_delete command");
  redraw_svg();
  full_data = [];
});


receive_config('linegraph/linegraph.cfg'); // First time config
receive_data('linegraph/linegraph.tsv'); // First time download