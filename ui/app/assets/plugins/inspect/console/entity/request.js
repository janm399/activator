define(['text!./request.html', 'core/pluginapi', './../widget'], function(template, api, ConsoleWidget) {
  var ko = api.ko;

  var Request = api.Class(ConsoleWidget, {
    id: 'console-request-widget',
    template: template,
    init: function(args) {
      this.traceId = "unknown";
      this.parameters = function(params) {
        this.traceId = params[0];
      };
      this.req = ko.observable();
    },
    dataName: 'request',
    dataTypes: ['request'],
    dataScope: {},
    dataRequest: function() {
      return { 'traceId': this.traceId };
    },
    onData: function(data) {
      this.req(data.playRequestSummary);
    }
  });

  return Request;
});
