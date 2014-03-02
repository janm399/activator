/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['text!./welcome.html', 'css!./welcome.css', 'main/pluginapi' ], function(template, css, api){


  var welcomePage = api.PluginWidget({
    id: 'welcome-page-screen',
    template: template,
    appVersion: window.serverAppVersion,
    init: function(config) {
      var self = this;
      self.newsHtml = ko.observable('<div></div>');
      self.loadNews();
    },
    loadNews: function() {
      var areq = {
          url: "http://downloads.typesafe.com/typesafe-activator/" + window.serverAppVersion + "/news.js",
          type: 'GET',
          // this is hardcoded for now since our server is just static files
          // so can't respect a ?callback= query param.
          jsonpCallback: 'setNewsJson',
          dataType: 'jsonp' // return type
        };
        debug && console.log("sending ajax news request ", areq)
        return $.ajax(areq);
    },
    setNewsJson: function(json) {
      debug && console.log("setting news json to ", json);
      if ('html' in json) {
        this.newsHtml(json.html);
      } else {
        console.error("json does not have an html field");
      }
    }
  });

  window.setNewsJson = welcomePage.setNewsJson.bind(welcomePage);

  return api.Plugin({
    id: 'welcome',
    name: "Welcome",
    icon: "",
    url: "#",
    routes: {
      'welcome': function(url) {
        api.setActiveWidget(welcomePage);
      }
    },
    widgets: [welcomePage]
  });
});
