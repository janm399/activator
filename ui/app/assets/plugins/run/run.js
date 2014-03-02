/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['services/build', 'main/model', 'text!./run.html', 'main/pluginapi', 'commons/settings', 'widgets/log/log', 'css!./run.css'],
    function(build, model, template, api, settings, log, css){


  var runConsole = api.PluginWidget({
    id: 'play-run-widget',
    template: template,
    init: function(parameters){
      var self = this;

      this.title = ko.observable("Run");
      this.startStopLabel = ko.computed(function() {
        if (build.run.haveActiveTask())
          return "Stop";
        else
          return "Start";
      }, this);

      // Aliases so we can use these in our html template.
      // This is a mess to clean up; we should just alias
      // 'build' or something then refer to these.
      // But doing this to keep changes in one commit smaller.
      // We want to just change the whole 'build' API anyway.
      this.outputLogView = new log.LogView(build.run.outputLog);
      this.playAppLink = build.run.playAppLink;
      this.playAppStarted = build.run.playAppStarted;
      this.haveActiveTask = build.run.haveActiveTask;
      this.haveMainClass = build.run.haveMainClass;
      this.currentMainClass = build.run.currentMainClass;
      this.mainClasses = build.run.mainClasses;
      this.rerunOnBuild = settings.build.rerunOnBuild;
      this.restartPending = build.run.restartPending;
      this.consoleCompatible = build.app.hasConsole;
      this.statusMessage = build.run.statusMessage;
      this.outputScroll = this.outputLogView.findScrollState();
    },
    update: function(parameters){
    },
    startStopButtonClicked: function(self) {
      debug && console.log("Start or Stop was clicked");
      build.toggleTask('run');
    },
    restartButtonClicked: function(self) {
      debug && console.log("Restart was clicked");
      build.restartTask('run');
    },
    onPreDeactivate: function() {
      this.outputScroll = this.outputLogView.findScrollState();
    },
    onPostActivate: function() {
      this.outputLogView.applyScrollState(this.outputScroll);
    }  });

  return api.Plugin({
    id: 'run',
    name: "Run",
    icon: "▶",
    url: "#run",
    routes: {
      'run': function() { api.setActiveWidget(runConsole); }
    },
    widgets: [runConsole]
  });
});
