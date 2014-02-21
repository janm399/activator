/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['main/pluginapi', 'services/build', './console/console', './console/connection', 'text!./inspect.html', 'css!./inspect.css'],
  function(api, build, Console, Connection, template){

    var inspectConsole = api.PluginWidget({
        id: 'inspect-console-widget',
        template: template,
        init: function() {
            // When we start a new application the data should always be flushed
            Connection.flush();
            this.consoleWidget = new Console();
            this.flush = function() {
              Connection.flush();
            }
        },
        route: function(path) {
            if (path == undefined || path.length == 0) {
              if (build.app.hasPlay()) {
                path = ["requests"];
              } else if (build.app.hasAkka()) {
                path = ["actors"];
              } else {
                path = ["deviations"];
              }
            }
            this.consoleWidget.route(path);
        }
    });

    return api.Plugin({
        id: 'inspect',
        name: "Inspect",
        icon: "C",
        url: "#inspect",
        routes: {
            'inspect': function(path) {
                api.setActiveWidget(inspectConsole);
                inspectConsole.route(path.rest);
            }
        },
        widgets: [inspectConsole]
    });
});
