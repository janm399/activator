define ->
  class Connection
    websocket: undefined
    connected: false
    sendQueue: []
    modules: []
    request: {}
    receiveCallbacks: []

    constructor: ->

    init: (initialtime) ->
      @request.time = initialtime
      @

    registerRecieveCallback: (callback) ->
      @receiveCallbacks.push callback
      @

    open: (url, onOpenCallback) ->
      @close()
      @websocket = new WebSocket(url)
      @websocket.onerror = (event) ->
        # $(window).trigger("console-alert", {message: "Connection error", level: "error"})
        console.log "console websocket error : ", event
      @websocket.onopen = (event) =>
        @connected = true
        console.log "console websocket opened : ", event
        # Send queued messages
        messages = @sendQueue
        @sendQueue = []
        @send message for message in messages
        # Run callback
        onOpenCallback event if onOpenCallback?
      @websocket.onmessage = (event) =>
        @receive event.data
      @websocket.onclose = (event) =>
        # $(window).trigger("console-alert", {message: "Connection closed", level: "warning"})
        console.log "console websocket closing : ", event

    close: ->
      if @websocket
        @connected = false
        @websocket.close()
        @sendQueue = []
      @

    flush: ->
      console.log "flushing inspect statistics"
      this.send({
        "commands": [
          {
            "module": "lifecycle",
            "command": "reset"
          }]
      })

    send: (message) ->
      json = JSON.stringify message
      if @connected
        @websocket.send json
      else
        @sendQueue.push message
      @

    receive: (message) ->
      try
        message = JSON.parse(message)
        $(window).trigger("network-data")
      catch e
        console.log "console connection couldn't parse received JSON message : ", message
        $(window).trigger("network-error")
        return false

      # Update module with data
      for module in @modules
        # Match modules with loaded module object's data types
        if module?.dataTypes? and message.type in module.dataTypes
          module.onData message.data

      # Run receive callbacks
      callback(message) for callback in @receiveCallbacks
      @

    # Update all modules
    updateModules: (modules) =>
      @modules = modules if modules?
      @request.modules = []

      for index, module of @modules
        if module.dataRequest
          moduleRequest = module.dataRequest()
          if !moduleRequest.name
            moduleRequest.name = module.dataName
          if !moduleRequest.scope
            moduleRequest.scope = {}
          @request.modules.push(moduleRequest)

      @update()
      @

    updateTime: (time, minutes) ->
      console.log "console connection updateTime : ", time, minutes
      @request.time = time
      @update()
      for module in @modules
        module.onTimeUpdateMinutes minutes if module.onTimeUpdateMinutes
      @

    getTimeInMinutes: (startTime, endTime) ->
      Math.ceil(new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000

    update: ->
      # Build request object
      sendData =
        modules: []
      sentModules = []
      # Only request each specific module once
      # TODO: Better handling of duplicate modules in request?
      for module in @request.modules
        if module.name not in sentModules
          sentModules.push module.name
          sendData.modules.push module
      # TODO: Add time from time machine object
      sendData.time = @request.time
      @send sendData
      @

  new Connection()
