(

		function ($) {

			AjaxSolr.CalendarWidget = AjaxSolr.AbstractFacetWidget.extend({
				afterRequest: function () {
					
					
				
					
					var self = this;

					if (self.manager.response.facet_counts == undefined) {

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
				
					/*
					 * 	
					 */
				//	alert("start date: "+self.manager.store.get('facet.date.start').val().substr(0, 10));
					var ddate='2001-1-1';
					 
					var fqs=self.manager.store.values('fq');
				
					if(fqs!=undefined)
					{
						for ( var i = 0, l = fqs.length; i < l; i++) {
						
							if ( fqs[i].startsWith("date_text")) {
								//if the fq has year bound query, add year filter to current query

								ddate=fqs[i].substr(fqs[i].indexOf("[")+1, 10);
								
								break;
							}


						}
					}
					else
					
					 if(self.manager.store.get('facet.date.start')!=undefined)
					{

						ddate= self.manager.store.get('facet.date.start').val().substr(0, 10);
					}

					$(this.target).datepicker('destroy');
					$(this.target).empty();
					$(this.target).datepicker({
						dateFormat: 'yy-mm-dd',

						defaultDate:$.datepicker.parseDate('yy-mm-dd', ddate),
						maxDate: self.manager.store.get('facet.date.end')==undefined ? 
								$.datepicker.parseDate('yy-mm-dd', '2014-12-29') :
									$.datepicker.parseDate('yy-mm-dd', self.manager.store.get('facet.date.end').val().substr(0, 10)) ,
									minDate:  self.manager.store.get('facet.date.start')==undefined ?
											$.datepicker.parseDate('yy-mm-dd', '2005-7-1'):
												$.datepicker.parseDate('yy-mm-dd', self.manager.store.get('facet.date.start').val().substr(0, 10)),
												nextText: '&gt;',
												prevText: '&lt;',

												// maxDate: $.datepicker.parseDate('yy-mm-dd', this.manager.store.get('facet.date.end').val().substr(0, 10)),

												// minDate: $.datepicker.parseDate('yy-mm-dd', this.manager.store.get('facet.date.start').val().substr(0, 10)),


												/*
      beforeShowDay: function (date) {
        var value = $.datepicker.formatDate('yy-mm-dd', date) + 'T00:00:00Z';
       var count = self.manager.response.facet_counts.facet_dates[self.field][value];
        return [ parseInt(count) > 0, '', count + ' documents found!' ];
      },
												 */
												onSelect: function (dateText, inst) {

													var fq = self.manager.store.values('fq');
													for (var i = 0, l = fq.length; i < l; i++) {
														if(fq[i].startsWith("date_text"))
														{
															self.manager.store.removeByValue('fq',fq[i]);
														}

													}


													if (self.add('[' + dateText + 'T00:00:00Z TO ' + dateText + 'T23:59:59Z]')) {
														self.doRequest();
													}
												}
					});
				}
			});

		})(jQuery);
