(function($) {

	AjaxSolr.TagcloudWidget = AjaxSolr.AbstractFacetWidget
	.extend({
		afterRequest : function() {
			var maxCount = 0;
			var objectedItems = [];
			var processed=false;
			//if there is no facet count return, go ahead hide the entry
			if( this.manager.response.facet_counts==undefined)
			{

				//if(this.field=="source_nm")
				console.log("this.manager.response[shards.info] is"+this.manager.response["shards.info"]);

				//facet is disable, however could still get count information for shard.info.
				
				if(this.field=='source_nm')

				{

					//10.1.70.232:8082/solr/NIU_DB_shard10_replica1/
					for ( var shard in this.manager.response['shards.info'])
					{
						//find corresponding collection name . each shard is in format of solr/$collection_shard
						var source_nm=shard.substring(shard.indexOf('solr/')+5, 
								shard.indexOf('_shard'));
						console.log("source_nm:"+source_nm+" snumFound: "
								+ this.manager.response['shards.info'][shard]['numFound']);
						//response.facet_counts.facet_fields[this.field]) {
						//var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
						var count=this.manager.response['shards.info'][shard]['numFound'];
						if(count==0)
							{
							continue;
							
							}
						var found=false;

						//check if source is already in the list
						for ( var i = 0, l = objectedItems.length; i < l; i++) {
							if( objectedItems[i].facet==source_nm)
							{
								objectedItems[i].count+=count;
								if(objectedItems[i].count>maxCount)
								{
									maxCount=objectedItems[i].count;
								}
								found=true;
								break;							
							}

						}

						if(!found)
						{	

							if (count > maxCount) {
								maxCount = count;
							}
							objectedItems.push({
								facet : source_nm,
								field : this.field,
								count : count
							});
						}
					}
					processed=true;

				}

				else
				{

					$(this.target+"_label").hide();
					$(this.target).empty();
					/*
							$(this.target).html(
									AjaxSolr.theme('no_items_found'));
					 */
					return;
				}
			}
			if(!processed)
			{
				if ( this.field != this.manager.dateField && 
						 this.field!='money_text') {

					if (this.manager.response.facet_counts.facet_fields[this.field] == undefined) {

						$(this.target+"_label").hide();
						$(this.target).empty();
						/*
							$(this.target).html(
									AjaxSolr.theme('no_items_found'));
						 */
						return;
					}
				}
				//show the label
				$(this.target+"_label").show();


				if (this.field === this.manager.dateField  ) {

					for ( var facet in this.manager.response.facet_counts.facet_dates[this.field]) {
						var count = parseInt(this.manager.response.facet_counts.facet_dates[this.field][facet]);
						if (count > maxCount) {
							maxCount = count;
						}
						// only care of facet value with date format. since
						// facet return start and end as well, need this to
						// filter it
						if (facet.length > 10) {
							facet = facet.substr(0, 4);
							objectedItems.push({
								facet : facet,
								field : this.field,
								count : count
							});
						}

					}
				} else {


					if (this.field == 'money_text' ) {
						facetFields = this.manager.response.facet_counts.facet_queries;
						for ( var facet in this.manager.response.facet_counts.facet_queries) {
							var count = parseInt(this.manager.response.facet_counts.facet_queries[facet]);
							if (count != 0) {
								if (count > maxCount) {
									maxCount = count;
								}

								objectedItems.push({
									facet : facet.substr(
											facet.indexOf(":") + 1,
											facet.length),
											field : this.field,
											count : count
								});
							}
						}

					} 
					else {
						for ( var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
							var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
							if (count > maxCount) {
								maxCount = count;
							}
                                                        if(facet!='y')
                                                            {
                                                            objectedItems.push({
								facet : facet,
								field : this.field,
								count : count
                                                                });
                                                            }
						}
					}
				}
			}
			//if there is facet count, go ahead remove the label
			if(objectedItems.length==0)
			{
				$(this.target+"_label").hide();
				$(this.target).empty();

			}
			objectedItems.sort(function(a, b) {
				return a.facet < b.facet ? -1 : 1;
			});

			$(this.target).empty();

			for ( var i = 0, l = objectedItems.length; i < l; i++) {
				var facet = objectedItems[i].facet.toString();

				var fl=objectedItems[i].field;


				$(this.target).append(
						AjaxSolr.theme('tag', facet.toUpperCase(),
								parseInt(objectedItems[i].count
										/ maxCount * 10.0),
										objectedItems[i].count,

										this.clickHandler(fl, facet)));
			}

		}
	});

})(jQuery);
