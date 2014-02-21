/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['text!./monitor.html', 'main/pluginapi', 'webjars!d3', './connection'], function (template, api, d3, Connection) {

    var ko = api.ko;
    var sbt = api.sbt;

    function dthree(data) {
        var width = 800;
        var height = 1000;
        var barHeight = 20;

        var chart = d3.select("#svg").attr("width", width).attr("height", height);
        var x = d3.scale.linear().domain([0, d3.max(data)]).range([0, width]);
        var p = chart.selectAll("g").data(data);
        p.exit().remove();
        var bar = p.enter().append("g").attr("transform", function (d, i) {
                return "translate(0," + i * barHeight + ")";
            });

        bar.append("rect").attr("width", x).attr("height", barHeight - 1);
        bar.append("text").attr("x", function (d) { return x(d) - 3; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .text(function (d) { return d; });
    }

    var monitorConsole = api.PluginWidget({
        id: 'monitor-widget',
        template: template,
        init: function (parameters) {
            var self = this;
            this.flush = function () {
                Connection.flush();
            }

            this.defaultTime = { "startTime": "", "endTime": "", "rolling": "20minutes" };
            Connection.init(self.defaultTime);
            Connection.open(consoleWsUrl, function () {});
            Connection.updateModules([ self ]);

            this.title = ko.observable("monitor");
        },
        collect: function (parameters) {
            var count = 5 + Math.round(Math.random() * 10);
            var counters = [];
            for (var i = 0; i < count; i++) {
                counters[i] = Math.round(Math.random() * 100);
            }
            dthree(counters);
        },
        dataName: 'monitordata',
        dataTypes: ['monitordata'],
        dataRequest: function() {
            return {};
        },
        onData: function(data) {
            var values = data.map(function(d) { return d.value });
            dthree([]);
            dthree(values);
        }
    });

    return api.Plugin({
        id: 'monitor',
        name: "Monitor",
        icon: "M",
        url: "#monitor",
        routes: {
            'monitor': function () {
                api.setActiveWidget(monitorConsole);
            }
        },
        widgets: [monitorConsole]
    });
});
