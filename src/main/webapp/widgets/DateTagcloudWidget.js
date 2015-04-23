(function($) {

	AjaxSolr.DateTagcloudWidget = AjaxSolr.AbstractFacetWidget
	.extend({
		afterRequest : function() {


			if (this.manager.response.facet_counts == undefined) {

				$(this.target+"_label").hide();
				$(this.target).empty();
				/*
					$(this.target).html(
							AjaxSolr.theme('no_items_found'));
				 */
				return;
			}
			
				
			//show the label
			$(this.target+"_label").show();
				

			var maxCount = 0;
			var objectedItems = [];
			//	alert("this.target is"+this.target);
			if (this.field === this.manager.dateField ) {
				if(this.target ==='#year')
				{
					var output = new Object(); 

					for ( var facet in this.manager.response.facet_counts.facet_dates[this.field]) {
						if(facet.length>10)
						{

							var count = parseInt(this.manager.response.facet_counts.facet_dates[this.field][facet]);
							facet=facet.substr(0, 4);

							if(output[facet]!==undefined)
							{
								output[facet]=output[facet]+count;									   
							}
							else
							{
								output[facet]=count;
							}

							if(output[facet]>maxCount)
							{
								maxCount=output[facet];
							}
						}

					}
					for(var y in output){
						if(y!==undefined && output[y]>0)

						{
							objectedItems.push({
								facet : y,
								count : output[y]
							});
						}
					}



				}
				else if(this.target =='#month')
				{


					var output = new Object(); 

					for ( var facet in this.manager.response.facet_counts.facet_dates[this.field]) {
						if(facet.length>10)
						{

							var count = parseInt(this.manager.response.facet_counts.facet_dates[this.field][facet]);
							//get the month
							facet=facet.substr(5, 2);

							if(output[facet]!=undefined)
							{
								output[facet]=output[facet]+count;									   
							}
							else
							{
								output[facet]=count;
							}

							if(output[facet]>maxCount)
							{
								maxCount=output[facet];
							}
						}

					}
					for(var y in output){
						if(y!==undefined && output[y]>0)

						{
							objectedItems.push({
								facet : y,
								count : output[y]
							});
						}
					}








				}

		
			}
			objectedItems.sort(function(a, b) {
				return a.facet < b.facet ? -1 : 1;
			});

			$(this.target).empty();

			for ( var i = 0, l = objectedItems.length; i < l; i++) {
				var facet = objectedItems[i].facet;
				$(this.target).append(
						AjaxSolr.theme('tag', facet,
								parseInt(objectedItems[i].count
										/ maxCount * 10.0),
										objectedItems[i].count,
										this.clickHandler(this.field, facet)));
			}

		}
	});

})(jQuery);
