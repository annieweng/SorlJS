(function ($) {

AjaxSolr.CurrentSearchWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,

  afterRequest: function () {
    var self = this;
    var links = [];

    var q = this.manager.store.get('q').val();
    if (q != '*:*') {
      links.push($('<a href="#"/>').text('(x) ' + q).click(function () {
        self.manager.store.get('q').val('*:*');
        self.afterRequest();
        //self.doRequest();
        return false;
      }));
    }

    var fq = this.manager.store.values('fq');
    for (var i = 0, l = fq.length; i < l; i++) {
      if (fq[i]!=null && fq[i].match(/[\[\{]\S+ TO \S+[\]\}]/)) {
    	
        var field = fq[i].match(/^\w+:/)[0];
      
        var value = fq[i].substring(field.length + 1, fq[i].length-1);
      //go ahead translate full month query to simple string
        
        
        if(value.indexOf("date_text")>0)
        	{
        	
        		value="xxxx-"+value.substr(5, 2)+"-xx";
        	}
        links.push($('<a href="#"/>').text('(x) ' + field + value).click(self.removeFacet(fq[i])));
      }
      else {
        links.push($('<a href="#"/>').text('(x) ' + fq[i]).click(self.removeFacet(fq[i])));
      }
    }

    if (links.length > 1) {
      links.unshift($('<a href="#"/>').text('remove all').click(function () {
        self.manager.store.get('q').val('*:*');
        self.manager.store.remove('fq');
        //self.doRequest();
        self.afterRequest();
        return false;
      }));
    }

    if (links.length) {
      AjaxSolr.theme('list_items', this.target, links);
    }
    else {
      $(this.target).html('<div>Viewing all documents!</div>');
    }
  },

  removeFacet: function (facet) {
    var self = this;
    return function () {
      if (self.manager.store.removeByValue('fq', facet)) {
      //self.doRequest();
    	  self.afterRequest();
      }
      return false;
    };
  }
});

})(jQuery);
