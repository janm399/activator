/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['text!./overview.html', 'main/pluginapi', './widget', './format'], function(template, api, ConsoleWidget, format) {


  return api.Class(ConsoleWidget, {
    id: 'console-overview-widget',
    template: template,
    init: function(args) {
      var self = this;
      this.actors = ko.observable(0);
      this.requests = ko.observable(0);
      this.deviations = ko.observable(0);
      this.hasPlayRequests = ko.computed(function() {
        return self.requests() > 0;
      });
      this.hasActors = ko.computed(function() {
        return self.actors() > 0;
      });
      this.hasDeviations = ko.computed(function() {
        return self.deviations() > 0;
      });
    },
    active: ko.observable(''),
    dataName: 'overview',
    dataTypes: ['overview'],
    onData: function(data) {
      this.actors(data.metadata.actorPathCount);
      this.requests(data.metadata.playPatternCount);
      this.deviations(data.deviations.deviationCount);
    },
    dataRequest: function() {
      return {
        'paging': { 'offset': 0, 'limit': 10000 }
      };
    },
    shorten: function(count) {
      return format.shortenNumber(count);
    }
  });
});
