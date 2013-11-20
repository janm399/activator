/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['webjars!knockout', './router', 'commons/settings', 'plugins/tutorial/tutorial', 'widgets/log/log', 'services/build'], function(ko, router, settings, Tutorial, log, build) {
  // Model for the whole app view; created in two parts
  // so that this first part is available during construction
  // of the second part.
  return {
    plugins: null, // filled in by init
    router: router,
    tutorial: new Tutorial(),
    snap: {
      // TODO this needs to be removed after it's no longer used
      // in application.scala.html
      testCallBinding: function(a,b,c,d){
      },
      activeWidget: ko.observable(""),
      navigationOpened: ko.observable( settings.get("app.navigationOpened", true) ),
      navigationSneak: ko.observable( false ),
      navigationSneakTimer: 0,
      panelDropdownActive: ko.observable( false ),
      panelOpened: ko.observable( settings.get("app.panelOpened", false) ),
      panelShape: ko.observable( settings.get("app.panelShape", "right1") ),
      pageTitle: ko.observable(),
      // TODO load last value from somewhere until we get a message from the iframe
      signedIn: ko.observable(false),
      build: build,
      app: {
        name: ko.observable(window.serverAppModel.name ? window.serverAppModel.name : window.serverAppModel.id),
        projects: ko.observableArray([]),
        currentRef: ko.observable(),
        hasAkka: ko.observable(false),
        hasPlay: ko.observable(false),
        hasConsole: ko.observable(false)
      },
      toggleNavigation: function(){
        this.snap.navigationOpened(!this.snap.navigationOpened());
        this.snap.navigationSneak(this.snap.navigationOpened());
        settings.set("app.navigationOpened", this.snap.navigationOpened());
      },
      sneakNavigationOn: function(){
        if (!this.snap.navigationOpened()) {
          this.snap.navigationSneak(true);
        }
      },
      sneakNavigationShow: function(){
        clearTimeout(this.snap.navigationSneakTimer);
      },
      sneakNavigationHide: function(){
        var navigationSneak = this.snap.navigationSneak;
        this.snap.navigationSneakTimer = setTimeout(function(){
          navigationSneak(false);
        } ,500);
      },
      togglePanel: function(){
        this.snap.panelOpened(!this.snap.panelOpened());
        settings.set("app.panelOpened", this.snap.panelOpened());
      },
      togglePanelShape: function(data, event){
        this.snap.panelShape(event.target.dataset.panelShape);
        this.snap.panelDropdownActive( false );
        settings.set("app.panelShape", this.snap.panelShape());
      },
      togglePanelDropdown: function(data, event){
        event.stopPropagation();
        this.snap.panelDropdownActive(!this.snap.panelDropdownActive());
      }
    },
    logModel: new log.Log(),
    // This is the initialization of the application...
    init: function(plugins) {
      var self = this;
      self.widgets = [];
      self.plugins = plugins;
      // TODO - initialize plugins in a better way perhaps...
      $.each(self.plugins.list, function(idx,plugin) {
        self.router.registerRoutes(plugin.routes);
        $.each(plugin.widgets, function(idx, widget) {
          self.widgets.push(widget);
        });
      });
      self.router.init();
      ko.applyBindings(self, window.body);
    }
  };
});
