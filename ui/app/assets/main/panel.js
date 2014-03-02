/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['commons/utils', 'commons/settings'],
    function(utils, settings) {
  settings.register("app.panelOpened", true);
  settings.register("app.panelShape", "right1");

  var panel = utils.Singleton({
    init: function() {
      this.dropdownActive = ko.observable(false);
    },
    toggle: function() {
      settings.app.panelOpened(!settings.app.panelOpened());
    },
    toggleShape: function(data, event){
      settings.app.panelShape(event.target.dataset.panelShape);
      this.dropdownActive(false);
    },
    toggleDropdown: function(data, event){
      event.stopPropagation();
      this.dropdownActive(!this.dropdownActive());
    }
  });
  return panel;
});
