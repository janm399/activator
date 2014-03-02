define(function() {
  var makeSetting = function(label, def) {
    var initial;
    if (window.localStorage.getItem(label) != null) {
      initial = JSON.parse(window.localStorage.getItem(label));
      debug && console.log("Loaded saved setting ", label, "=", initial);
    } else {
      initial = def;
      debug && console.log("Using default for setting ", label);
    }
    var o = ko.observable(initial);
    // save the value when it changes
    o.subscribe(function(newValue) {
      window.localStorage.setItem(label, JSON.stringify(newValue));
      debug && console.log("Persisted new setting value ", label, "=", newValue);
    });
    return o;
  };

  var settings = {
    // register a setting on init
    register: function(label, def) {
      var elements = label.split('.');
      // every other field in 'settings' is just a setting value
      var o = this;
      var e = elements.shift();
      while (typeof(e) === 'string') {
        if (elements.length == 0) {
          if (e in o)
            throw new Error("double-registering setting " + label);
          else
            o[e] = makeSetting(label, def);
          break;
        } else {
          if (!(e in o))
            o[e] = {};
          o = o[e];
          e = elements.shift();
        }
      }
    }
  };
  return settings;
});
