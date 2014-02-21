/*
Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
*/
define(['text!./monitor.html', 'main/pluginapi', 'webjars!d3', './connection'], function(template, api, d3, Connection) {
    var ko = api.ko;

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
        var p = chart.selectAll("g").data(data);
        p.exit().remove();
        var bar = p.enter().append("g")
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

    var Console = api.Class(api.Widget, {
        id: 'monitor-widget',
        template: template,
        init: function(args) {
            var self = this;
            this.crumbs = ko.observableArray([]);
            this.defaultTime = { "startTime": "", "endTime": "", "rolling": "20minutes" };
            Connection.init(self.defaultTime);
            Connection.open(consoleWsUrl, function() {});
            this.connected = ko.observable(true);
            dhtree([1, 3, 5, 10, 1, 3, 5, 1]);
        },
        route: function(path) {
            // this.crumbs(path);
        },
        updateView: function(path) {
            console.log(path);
            Connection.updateModules(modules);
            return view;
        }
    });

    return Console;
});
