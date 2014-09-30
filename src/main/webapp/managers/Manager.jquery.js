//$Id$

/**
 * @see http://wiki.apache.org/solr/SolJSON#JSON_specific_parameters
 * @class Manager
 * @augments AjaxSolr.AbstractManager
 */
AjaxSolr.Manager = AjaxSolr.AbstractManager.extend(
		/** @lends AjaxSolr.Manager.prototype */
		{
			executeRequest: function (servlet, string, handler) {
				var self = this;
				string = string || this.store.string();


                        var dbSolrUrl=self.ALLsolrUrl;
                       
                                self.currentSolrUrl=dbSolrUrl;
                               
			
				

				handler = handler || function(data){


					self.handleResponse(data);
				};


				if (this.proxyUrl) {


					jQuery.getJSON(this.proxyUrl+'?'+dbSolrUrl+';' + string + '&wt=json&json.wrf=?', {}, handler);
					
				}
				else {


				//	console.log("query is "+dbSolrUrl+'?' + string + '&wt=json&json.wrf=?');
					var jointChar='?';
					if(dbSolrUrl.indexOf("?")>0)
					{
						jointChar='&';
					}
					jQuery.getJSON(dbSolrUrl+jointChar + string + '&wt=json&json.wrf=?', {}, handler);
				
				}


			}

		});
