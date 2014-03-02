/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['text!./compile.html', 'main/pluginapi', 'services/build', 'commons/settings', 'widgets/log/log', 'css!./compile.css'],
    function(template, api, build, settings, log) {


  var compileConsole = api.PluginWidget({
    id: 'compile-widget',
    template: template,
    init: function(parameters){
      var self = this

      this.title = ko.observable("Compile");
      this.startStopLabel = ko.computed(function() {
        if (build.compile.haveActiveTask())
          return "Stop compiling";
        else
          return "Start compiling";
      }, this);

      this.logView = new log.LogView(build.log);
      this.logScroll = this.logView.findScrollState();
      // TODO get rid of per-plugin status
      this.status = ko.observable(api.STATUS_DEFAULT);

      // aliased here so our html template can find it
      this.recompileOnChange = settings.build.recompileOnChange;
    },
    update: function(parameters){
    },
    startStopButtonClicked: function(self) {
      debug && console.log("Start/stop compile was clicked");
      build.toggleTask('compile');
    },
    onPreDeactivate: function() {
      this.logScroll = this.logView.findScrollState();
    },
    onPostActivate: function() {
      this.logView.applyScrollState(this.logScroll);
    }
  });

  return api.Plugin({
    id: 'compile',
    name: "Compile & Logs",
    icon: "B",
    url: "#compile",
    routes: {
      'compile': function() { api.setActiveWidget(compileConsole); }
    },
    widgets: [compileConsole],
    status: compileConsole.status
  });
});
