/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['text!./monitor.html', 'main/pluginapi', 'webjars!d3'], function(template, api, d3){

  var ko = api.ko;
  var sbt = api.sbt;

  function dthree(data) {
    var width = 800;
    var height = 1000;
    var barHeight = 20;

    var chart = d3.select("#svg")
                    .attr("width", width)
                    .attr("height", height);
    var x = d3.scale.linear()
                .domain([0, d3.max(data)])
                .range([0, width]);
    var bar = chart.selectAll("g")
                      .data(data)
                    .enter().append("g")
                      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
    bar.append("rect")
         .attr("width", x)
         .attr("height", barHeight - 1);
    bar.append("text")
         .attr("x", function(d) { return x(d) - 3; })
         .attr("y", barHeight / 2)
         .attr("dy", ".35em")
         .text(function(d) { return d; });
  }

  var monitorConsole = api.PluginWidget({
    id: 'monitor-widget',
    template: template,
    init: function(parameters){
      var self = this;

      this.title = ko.observable("monitor");
    },
    collect: function(parameters) {
        alert("collect");
        dthree([1, 2, 3, 4, 5, 1, 4, 5, 1]);
    }
  });

  return api.Plugin({
    id: 'monitor',
    name: "Monitor",
    icon: "⌮",
    url: "#monitor",
    routes: {
      'monitor': function() { api.setActiveWidget(monitorConsole); }
    },
    widgets: [monitorConsole]
  });
});
