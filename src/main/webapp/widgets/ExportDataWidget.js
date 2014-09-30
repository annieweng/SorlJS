(function ($) {
	var sortingOrder='desc';
AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,
  
  beforeRequest: function () {
        
        $(this.target).html($('<img/>').attr('src', 'images/ajax-loader.gif'));
  
    },




  afterRequest: function () {
 

  },

  init: function () {
   
  
  }
});

})(jQuery);