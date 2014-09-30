(function ($) {

AjaxSolr.TextWidget = AjaxSolr.AbstractTextWidget.extend({
  init: function () {
    var self = this;
    $(this.target).find('input').bind('keydown', function(e) {
      if (e.which == 13) {
        var value = $(this).val();
        /*
    	var field=document.getElementById("searchFields").value;
    			
    	  if(field!="*")
    	  {
    		value=field+":"+value;  
    	  }
    	 */
     
   
        if (value && self.set(value)) {
       // if (value ) {
          self.doRequest();
        }
      }
    });
  },

  afterRequest: function () {
    $(this.target).find('input').val('');
  }
});

})(jQuery);
