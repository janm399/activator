/*
 Copyright (C) 2014 Typesafe, Inc <http://typesafe.com>
 */
define(['commons/utils'], function(utils) {

  var Connection = utils.Class({
    init: function() {
      this.webSocket = null;
      this.connected = false;
      this.sendQueue = [];
      this.modules = [];
      this.request = {};
    },

    initTime: function(time) {
      this.request.time = time;
    },

    open: function(url, onOpenCallback) {
      var self = this;
      self.close();

      var webSocket = new WebSocket(url);
      webSocket.onerror = function(event) {
        console.log("Console WebSocket error: " + event);
      }

      webSocket.onopen = function(event) {
        self.connected = true;
        console.log("Console WebSocket opened: " + event);
        var messages = self.sendQueue;
        self.resetSendQueue();
        if (messages != undefined) {
          for (var i = 0; i < messages.length; i++) {
            self.send(messages[i]);
          }
        }

        if (onOpenCallback != undefined) {
          onOpenCallback(event);
        }
      }

      webSocket.onmessage = function(event) {
        self.receive(event.data);
      }

      webSocket.onclose = function(event) {
        console.log("Console WebSocket closing: " + event);
      }

      self.webSocket = webSocket;
    },

    resetSendQueue: function() {
      this.sendQueue = [];
    },

    close: function() {
      if (this.webSocket != undefined) {
        this.connected = false;
        this.webSocket.close();
        this.resetSendQueue();
      }
    },

    flush: function() {
      console.log("Flushing inspect statistics");
      this.send({
        "commands": [
          {
            "module": "lifecycle",
            "command": "reset"
          }]
      })
    },

    send: function(message) {
      var json = JSON.stringify(message);

      if (this.connected) {
        this.webSocket.send(json);
      } else {
        this.sendQueue.push(json);
      }
    },

    receive: function (message) {
      try {
        var json = JSON.parse(message);

        for(var i = 0; i < this.modules.length; i++) {
          var module = this.modules[i];
          if (module.dataTypes != undefined && json.type == module.dataTypes) {
            module.onData(json.data);
          }
        }
      } catch(error) {
      }
    },

    updateModules: function(ms) {
      if (ms != null) {
        this.modules = ms;
      }
      this.request.modules = [];

      for (var i = 0; i < this.modules.length; i++) {
        var module = this.modules[i];
        var moduleRequest;
        if (module.dataRequest) {
          moduleRequest = module.dataRequest();
        }
        if (!moduleRequest.name) {
          moduleRequest.name = module.dataName;
        }
        if (!moduleRequest.scope) {
          moduleRequest.scope = {};
        }
        this.request.modules.push(moduleRequest);
      }

      this.update();
    },

    update: function() {
      var sendData = {
        modules: []
      };

      var sentModules = [];
      for (var i = 0; i < this.request.modules.length; i++) {
        var module = this.request.modules[i];
        if (sentModules.indexOf(module.name) < 0) {
          sentModules.push(module.name);
          sendData.modules.push(module);
        }
      }

      sendData.time = this.request.time;
      this.send(sendData);
    }

  });

  return new Connection;
});
