/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['text!./deviations.html', 'main/pluginapi', './../widget', '../format'], function(template, api, ConsoleWidget, formatter) {
    var ko = api.ko;
    return api.Class(ConsoleWidget, {
        id: 'console-deviations-widget',
        template: template,
        init: function(args) {
            var self = this;
            this.data = ko.observable({ 'deviations': [], 'total': 0 });
            this.errors = ko.observableArray([]);
            this.warnings = ko.observableArray([]);
            this.deadLetters = ko.observableArray([]);
            this.unhandledMessages = ko.observableArray([]);
            this.deadlocks = ko.observableArray([]);
            this.errorCount = ko.observable(0);
            this.warningCount = ko.observable(0);
            this.deadLetterCount = ko.observable(0);
            this.unhandledMessageCount = ko.observable(0);
            this.deadlockCount = ko.observable(0);
            this.deviationCount = ko.observable(0);
            this.hasDeviations = api.valueGTZero(self.deviationCount);
            this.hasErrors = api.valueGTZero(self.errorCount);
            this.hasWarnings = api.valueGTZero(self.warningCount);
            this.hasDeadLetters = api.valueGTZero(self.deadLetterCount);
            this.hasUnhandledMessages = api.valueGTZero(self.unhandledMessageCount);
            this.hasDeadlocks = api.valueGTZero(self.deadlockCount);
            this.actorPath = ko.observable("");
            this.parameters = function(params) {
              self.actorPath(params.toString().replace(/,/g, "/"));
            }
        },
        dataName: 'deviations',
        dataTypes: ['deviations'],
        dataScope: {},
        dataRequest: function() {
          if (this.actorPath() != "") {
            var path = this.actorPath();
            // Resets the actor path after each specific actor path call.
            // If this is not done then this scope will be used regardless of what link is being clicked.
            this.actorPath("");
            return { 'scope': { 'actorPath': path } };
          }
          return { 'scope': {} };
        },
        onData: function(data) {
            var deviations = 0;
            this.formatTimestamp = function(value) {
                return formatter.formatTime(new Date(value));
            };
            this.format = function(collection, deviationType) {
                var newCollection = [];
                if (collection != undefined) {
                    for (var i = 0; i < collection.length; i++) {
                        deviations += 1;
                        var element = {
                            'event' : collection[i].event,
                            'message' : collection[i].message,
                            'timestamp' : this.formatTimestamp(collection[i].timestamp),
                            'traceLink' : "#inspect/deviation/" + deviationType + "/" + collection[i].trace.substring(collection[i].trace.lastIndexOf('/') + 1)
                        };
                        newCollection.push(element);
                    }
                }
                return newCollection;
            };

            // TODO - this is a temp hack => handle array values better
            this.errors(this.format(data.deviations[0].errors, "Error"));
            this.warnings(this.format(data.deviations[0].warnings, "Warning"));
            this.deadLetters(this.format(data.deviations[0].deadletters, "Deadletter"));
            this.unhandledMessages(this.format(data.deviations[0].unhandledMessages, "Unhandled Message"));
            this.deadlocks(this.format(data.deviations[0].deadlocks, "Deadlock"));
            this.errorCount(data.deviations[0].errorCount);
            this.warningCount(data.deviations[0].warningCount);
            this.deadLetterCount(data.deviations[0].deadLetterCount);
            this.unhandledMessageCount(data.deviations[0].unhandledMessageCount);
            this.deadlockCount(data.deviations[0].deadlockCount);
            this.deviationCount(deviations);
        }
    });
});
