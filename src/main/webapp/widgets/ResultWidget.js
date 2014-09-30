(function ($) {
	
       	
AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,
  
  beforeRequest: function () {
    $(this.target).html($('<img/>').attr('src', 'images/ajax-loader.gif'));
  },

  facetLinks: function (facet_field, facet_values) {
    var links = [];
    if (facet_values) {
    	  if (facet_values !== undefined) {
              links.push(AjaxSolr.theme('facet_link', facet_values, this.facetHandler(facet_field, facet_values)));
            }
            else {
              links.push(AjaxSolr.theme('no_items_found'));
            }
    
    }
    return links;
  },

  facetHandler: function (facet_field, facet_value) {
	    var self = this;
	    return function () {
	      self.manager.store.remove('fq');
	      self.manager.store.addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value));
	      self.doRequest();
	      return false;
	    };
	  },

	
		  
  headerHandler: function (header_field, header_order) {
    var self = this;
    return function () {
    	
      self.manager.store.remove('sort');
      self.manager.store.addByValue('sort', header_field + ' ' + header_order);
      
       if(header_order=='desc')
    	   {
    	    sortingOrder='asc';
    	   }
       else
    	   {
    	     sortingOrder='desc';
    	   }
      self.doRequest();
     
      return false;
    };
  },

 

	

  afterRequest: function () {

    $(this.target).empty();

	  $(this.target).append(AjaxSolr.theme('table',this.manager.response.response.docs, this.manager.response.highlighting ));
		//	  localStorage.clear();
	  for(var i=0; i<localStorage.length; i++)
 	 {
 	   var key=localStorage.key(i);
 	//alert("key"+key);   
 		//toggle the table column
	    $('.' + key).toggle();
	    var link=$("#pref li ul li a[name=" + key + "]");
	  //  alert("link"+link);
	    link.text(key+'  >>');
	 
	    link.css({"font-weight":"bold", "color":"#616161"});
	
 	 }
	  
	  
	
		
	
	  //go ahead update advance search function options
	  $("#searchFields").empty();
	  $("#sortfields").empty();
	  $("#sortfields").append($('<option>', { 
          value: '*',
          text : 'None' 
      }));
	   $("#pref li ul li a").each(function() {
        
           $("#searchFields").append($('<option>', { 
               value: $(this).attr('name'),
               text : $(this).attr('name') 
           }));
           
           $("#sortfields").append($('<option>', { 
               value: $(this).attr('name'),
               text : $(this).attr('name') 
           }));
           
     });
     /*
	 $('a.innerlink').click(function(e){
          alert("event clicked in innerlink");
            e.stopPropagation(); 
        });   
	*/  
 	  
	  var t=document;
	  var o=t.createElement('script');
	 
	  o.setAttribute('type','text/javascript');
	  o.setAttribute('src','js/table_resizable.js');
	  document.getElementsByTagName("head")[0].appendChild(o);
	// jQuery MAY OR MAY NOT be loaded at this stage
	  
	  var waitForLoad = function () {
		

	      if (resizableTables != "undefined") {
	    	
	    	  
	    	     
	    	     ResizableColumns();
	    		
	    		
	         
	      } else {
	          window.setTimeout(waitForLoad, 1000);
	      }
	      
	  };
	  window.setTimeout(waitForLoad, 1000);
	  
	
   

  },

  init: function () {
    $('a.more').livequery(function () {
      $(this).toggle(function () {
    	//  $(this).siblings('span:first').hide();
        $(this).parent().find('span').show();
        $(this).text('hide..');
        return false;
      }, function () {
    	  //$(this).siblings('span:first').show();
        $(this).parent().find('span').hide();
        $(this).text('show more..');
        return false;
      });
    });
    
   
        
     $('a.showDoc').livequery(function () {
        
       
      $(this).toggle(function () {
    	
       showDocument( $(this).parent().find('span').html());
      
        return false;
      }, function () {
    	  showDocument( $(this).parent().find('span').html());
      
        return false;
      });
      
      
    });
    

         
         
       
        
       
    
  
  }
});

 
	    
})(jQuery);