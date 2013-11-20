/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['text!./requests.html', 'core/pluginapi', './../widget', '../format'], function(template, api, ConsoleWidget, format) {

  var ko = api.ko;

  var Requests = api.Class(ConsoleWidget, {
    id: 'console-requests-widget',
    template: template,
    init: function(args) {
      var self = this;
      this.data = ko.observable({ 'requests': [], 'total': 0 });
      this.limit = ko.observable('25');
      this.requests = ko.observableArray([]);
    },
    dataName: 'requests',
    dataTypes: ['requests'],
    dataScope: {},
    dataRequest: function() {
      return {
        'paging': { 'offset': 1, 'limit': parseInt(this.limit(), 10) }
      };
    },
    onData: function(data) {
      var newRequests = [];
      var requestData = data.playRequestSummaries.playRequestSummaries;
      for (var i = 0; i < requestData.length; i++) {
        var req = requestData[i];
        var requestId = req.traceId.substring(req.traceId.lastIndexOf("/") + 1)
        var requestLink = "#inspect/request/" + requestId;
        var path = req.invocationInfo.path;
        var controller = req.invocationInfo.controller;
        var controllerMethod = req.invocationInfo.method;
        var httpMethod = req.invocationInfo.httpMethod;
        var invocationTimeMillis = format.nanosToMillis(req.endNanoTime - req.startNanoTime, 2);
        var responseCode = req.response.httpResponseCode;
        var request = {
          'path' : path,
          'requestLink' : requestLink,
          'requestId' : requestId,
          'controller' : controller + "#" + controllerMethod,
          'method' : httpMethod,
          'responseCode' : responseCode,
          'invocationTime' : invocationTimeMillis
        };
        newRequests.push(request);
      }

      this.requests(newRequests);
    }
  });

  return Requests;
});
