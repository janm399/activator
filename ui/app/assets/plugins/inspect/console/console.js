/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['text!./console.html', 'css!./console.css', 'main/pluginapi', './connection', './overview', './entity/actors', './entity/actor', './entity/requests', './entity/request', 'commons/utils', './entity/deviations', './entity/deviation'],
  function(template, css, api, Connection, Overview, Actors, Actor, Requests, Request, Utils, Deviations, Deviation) {


  var Console = api.Class(api.Widget, {
    id: 'console-widget',
    template: template,
    init: function(args) {
      var self = this;
      this.crumbs = ko.observableArray([]);
      this.defaultTime = { "startTime": "", "endTime": "", "rolling": "20minutes" };
      Connection.initTime(self.defaultTime);
      Connection.open(consoleWsUrl, function() {});
      this.connected = ko.observable(true);
      this.navigation = new Overview();
      this.views = {
        'actors': { 'contents': new Actors() },
        'actor' : { 'contents': new Actor() },
        'requests': { 'contents': new Requests() },
        'request' : { 'contents': new Request() },
        'deviations' : { 'contents': new Deviations() },
        'deviation' : { 'contents': new Deviation() }
      };
      this.viewer = ko.computed(function() {
        return self.updateView(self.crumbs());
      });
    },
    route: function(path) {
      this.crumbs(path);
    },
    updateView: function(path) {
      name = path[0];
      view = this.views[name];
      if (path.length > 1) {
        // If the view expects extra params it should implement a parameters function
        view.contents.parameters(path.slice(1));
      }

      if (view) this.navigation.active(name);
      modules = view ? [ this.navigation, view.contents ] : [ this.navigation ]
      Connection.updateModules(modules);
      return view;
    }
  });

  return Console;
});
