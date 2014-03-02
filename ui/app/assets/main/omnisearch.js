/*
 Copyright (C) 2013 Typesafe, Inc <http://typesafe.com>
 */
define(['commons/utils'], function(utils) {
  var omnisearch = utils.Singleton({
    init: function() {
      this.searchString = ko.observable("");
      this.searchStringLast = "";
      this.busy = ko.observable(false);
      this.active = ko.observable(false);
      this.options = ko.observableArray([]);
      this.selected = ko.observable(0);
    },
    onKeyUp: function(data, event){
      var self = this;
      switch (event.keyCode) {
        // Escape
        case 27:
          event.target.blur();
          break;
        // Return
        case 13:
          var selectedUrl = self.options()[self.selected()].url;
          if (selectedUrl) {
            location.href = selectedUrl;
            event.target.blur();
          }
          break;
        // Up
        case 38:
          if (self.selected() > 0) {
            self.selected(self.selected() - 1);
          } else {
            self.selected(self.options().length - 1);
          }
          self.scrollToSelected();
          break;
        // Down
        case 40:
          if (self.selected() < self.options().length - 1) {
            self.selected(self.selected() + 1);
          } else {
            self.selected(0);
          }
          self.scrollToSelected();
          break;
        default:
          var search = self.searchString();
          // Don't search until at least two characters are entered and search string isn't the same as last
          if (search.length >= 2 && search != self.searchStringLast) {
            self.busy(true);
            // Talk to backend, update omnisearchOptions with result
            // TODO - Figure out a better way to get this URL!
            var url = '/app/' + window.serverAppModel.id + '/search/' + search;
            $.ajax({
             url: url,
             dataType: 'json',
             success: function(values) {
               // No values returned
               if (values.length == 0) {
                values = [{
                  title: "(no results found)",
                  subtitle: "",
                  type: "",
                  url: false
                }];
               }
               // TODO - Maybe be smarter about how we fill stuff out here?
               self.options(values);
               self.busy(false);
               self.active(true);
               self.searchStringLast = search;
             }
            });
          } else {
            self.busy(false);
            self.active(false);
          }
          break;
      }
      return true;
    },
    scrollToSelected: function() {
      var $omnisearch = $('#omnisearch ul');
      var $selected = $omnisearch.find('li.selected');
      if ($selected.position().top < 0) {
        $omnisearch.scrollTop($omnisearch.scrollTop() + $selected.position().top);
      } else if ($selected.position().top + $selected.outerHeight() >= $omnisearch.height()) {
        $omnisearch.scrollTop($omnisearch.scrollTop() + $selected.position().top + $selected.outerHeight() - $omnisearch.height());
      }
    },
    onOptionSelected: function(data){
      var self = this;
      if (data.url) {
        location.href = data.url;
      }
    },
    onBlur: function(data, event){
      var self = this;
      // Delay hiding of omnisearch list to catch mouse click on list before it disappears
      setTimeout(function(){
        self.active(false);
        self.selected(0);
        self.searchString("");
      }, 100);
    },
    openSearch: function() {
      $("#omnisearch input")[0].focus();
      // TODO nothing connects to this?
      $.event.trigger("search.open");
    }
  });

  return omnisearch;
});
