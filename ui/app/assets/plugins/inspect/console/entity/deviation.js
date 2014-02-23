define(['text!./deviation.html', 'main/pluginapi', './../widget', './../format', 'commons/templates', 'text!./tracetree.html'],
  function(template, api, ConsoleWidget, formatter, templates, traceTreeTemplate) {

    var ko = api.ko;
    return api.Class(ConsoleWidget, {
        id: 'console-deviation-widget',
        template: template,
        init: function(args) {
            // Register trace tree template that is used in the deviation view
            templates.registerTemplate("trace-tree-template", traceTreeTemplate);

            var self = this;
            this.eventId = "unknown";
            this.parameters = function(params) {
                this.deviationType(params[0]);
                this.eventId = params[1];
            };
            this.deviationType = ko.observable();
            this.deviationTime = ko.observable();
            this.deviationActorPath = ko.observable()
            this.deviationReason = ko.observable();
            this.showSystemMessages = ko.observable(false);
            this.showNanoSeconds = ko.observable(false);
            this.showActorSystems = ko.observable(false);
            this.showTraceInformation = ko.observable(false);
            this.traceTree = ko.observable();

            // Helper functions for the trace tree template
            this.isSystemEvent = function(type) {
                var result = false;
                if (type.indexOf('Msg') > 0 || type.indexOf('Stream') > 0) result = true;
                return result;
            }
            this.showEvent = function(type) { return !(self.isSystemEvent(type) && !self.showSystemMessages()); }
            this.formatTime = function(time) { return formatter.formatTime(new Date(time)); }
            this.extractTrace = function(trace) {
                var result = "N/A";
                if (trace != undefined) result = trace.substring(trace.lastIndexOf("/") + 1);
                return result;
            }
            this.isFailureEvent = function(type) { return  type == "ActorFailed"; }
            this.extractActorPath = function(annotation) {
                var result = "N/A";
                if (annotation != undefined && annotation.actorInfo != undefined) result = annotation.actorInfo.actorPath;
                return result;
            }
            // End: Helper functions
        },
        dataName: 'deviation',
        dataTypes: ['deviation'],
        dataScope: {},
        dataRequest: function() {
            return { 'eventId': this.eventId };
        },
        onData: function(data) {
            this.extractReason = function(json) {
                var event = json.event;
                if (event.annotation.reason != undefined) {
                    this.deviationTime(formatter.formatTime(new Date(event.timestamp)));
                    if (event.annotation.actorInfo != undefined) {
                        this.deviationActorPath(event.annotation.actorInfo.actorPath);
                    }
                    this.deviationReason(event.annotation.reason);
                } else {
                   if (json.children != undefined && json.children.length > 0) {
                       for(var i = 0; i < json.children.length; i++) {
                            this.extractReason(json.children[i]);
                       }
                   }
                }
            }

            this.extractReason(data.traceTree);
            this.traceTree(data.traceTree);
        }
    });
});
