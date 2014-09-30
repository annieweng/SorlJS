
	var docWin = null;
	var panel = null;
      

	function closePanel() {
		if (docWin != null) {

			panel.destroy();

			docWin.destroy();
			docWin = null;
		}

	}
        function disabledEventPropagation(event)
{
   if (event.stopPropagation){
       event.stopPropagation();
   }
   else if(window.event){
      window.event.cancelBubble=true;
   }
}

	function updateFilter(sel) {
           
            var column,value;
          
                if(sel.options===undefined)
                    {
                        column= sel.name;
                        value=sel.text;
                    }
                    else
                        {
                            column = sel.name.substring(0, sel.name.length - 7);
               
                            value = sel.options[sel.selectedIndex].value;
                        }
		var valid = true;
		var fq = Manager.store.values('fq');
		var hasColumnFilter = false;
		if (fq != undefined) {

			for ( var j = 0; !(j >= fq.length); j++) {
				if (fq[j].startsWith(column)) {
					hasColumnFilter = true;
					var currentValue = fq[j].substr(fq[j].indexOf(':') + 1);

					if (currentValue != value) {
						Manager.store.removeByValue('fq', fq[j]);

						valid = true;
						break;

					} else {
						//existing query already contain same filter, set valid to false
						valid = false;
						break;
					}

				}

			}

		}
		//if the column filter is none, and there isn't any existing column filter, 
		//set valid to false
		if (value == 'NONE' && hasColumnFilter == false) {
			valid = false;
		}

		// alert(column+" "+value);

		if (valid) {
			if (value != 'NONE') {
				Manager.store.addByValue('fq', column + ":\"" + value + "\"");
			}

			Manager.doRequest();
		}
                

	}

	function showLinkInWindow(link) {

		$.ajax({
			url : link,
			success : function(content) {
				if (docWin != null) {
					panel.destroy();

					docWin.destroy();
					docWin = null;
				}
				panel = Ext.create('Ext.panel.Panel', {
					layout : 'fit',
					autoScroll : true,
					html : '<div id="doc-detail-div" class="doc-details-text">'
				});

				docWin = Ext.create('widget.window', {
					title : 'Document View',
					closable : true,
					closeAction : 'destroy',

					width : 600,
					height : 500,
					layout : 'fit',

					items : [ panel ]
				});

				docWin.show();

				Ext.get('doc-detail-div').dom.innerHTML = content;

			}
		});

	}
	/**
	 *showing the last <td> content of tr in a panel
	 */
	function showTr(tr) {

		var contents = $(tr).find('td:last').html();

		if (docWin != null) {
			panel.destroy();

			docWin.destroy();
			docWin = null;
		}
		panel = Ext.create('Ext.panel.Panel', {
			layout : 'fit',
			autoScroll : true,
			html : '<div id="doc-detail-div" class="doc-details-text">'
		});

		docWin = Ext.create('widget.window', {
			title : 'Document View',
			closable : true,
			closeAction : 'destroy',

			width : 600,
			height : 500,
			layout : 'fit',

			items : [ panel ]
		});

		docWin.show();
		// $(doc).val();
		Ext.get('doc-detail-div').dom.innerHTML = contents;

	}
	function showDocument(doc) {

		if (docWin != null) {
			panel.destroy();

			docWin.destroy();
			docWin = null;
		}
		panel = Ext.create('Ext.panel.Panel', {
			layout : 'fit',
			autoScroll : true,
			html : '<div id="doc-detail-div" class="doc-details-text">'
		});

		docWin = Ext.create('widget.window', {
			title : 'Document View',
			closable : true,
			closeAction : 'destroy',

			width : 600,
			height : 500,
			layout : 'fit',

			items : [ panel ]
		});

		docWin.show();

		Ext.get('doc-detail-div').dom.innerHTML = doc;
	}

	/*
	 new Ext.Resizable('custom', {
	 wrap:true,
	 pinned:true,
	 minWidth:50,
	 minHeight: 50,
	 preserveRatio: true,
	 dynamic:true,
	 handles: 'all', // shorthand for 'n s e w ne nw se sw'
	 draggable:true
	 });
	 */

	function updateStartRowByState(select) {
		//remove the sort paramter
		var returnfields = Manager.store.get('start').value;
		if (returnfields != undefined)
			Manager.store.removeByValue("start", returnfields);

		Manager.store.addByValue("start", select.value);

	}

	function updateNumRowsByState(select) {
		//remove the sort paramter
		var returnfields = Manager.store.get('rows').value;
		if (returnfields != undefined)
			Manager.store.removeByValue("rows", returnfields);

		Manager.store.addByValue("rows", select.value);

	}

	function updateDateState() {

		var fq = Manager.store.values('fq');
		if (fq != undefined) {

			for ( var j = 0; !(j >= fq.length); j++) {
				if (fq[j].startsWith("date_text")) {
					Manager.store.removeByValue('fq', fq[j]);
				}

			}
		}
		var startDate = document.getElementById('StartDate').value;
		var endDate = document.getElementById('EndDate').value;
		if (startDate == "") {
			startDate = "*";
		} else {
			startDate = startDate + 'T00:00:00Z';

		}

		if (endDate == "") {

			endDate = "*";

		} else {

			endDate = endDate + 'T23:59:59Z';
		}

		if ((startDate == '*' || startDate.length == 20)
				&& (endDate == '*' || endDate.length == 20)) {

			Manager.store.addByValue('fq', 'date_text:'
					+ AjaxSolr.Parameter.escapeValue('[' + startDate + ' TO '
							+ endDate + ']'));

		}

	}

	function submitRequest() {
		var valid = true;
		//check if there is any text in the search box, update it to store if it's different
		var value = document.getElementById("query").value;

		if (value != "") {
			//get  the query from last applied search
			var q = Manager.store.get("q").value;
			if (q != value) {
				Manager.store.removeByValue('q', q);

				Manager.store.addByValue('q', value);
			}
		}

		//update filter query to store 

		var fq = document.getElementById("filteredquery").value;

		if (fq != "") {

			var fqArrays = [];
			if (fq.indexOf("AND") != -1) {

				fqArrays = fq.split("AND");
			}

			if (fqArrays.length == 0) {

				fqArrays.push(fq);

			}

			//check if current fq already have the same field, remove it if it exist
			var origFq = Manager.store.values('fq');

			for ( var j = 0, jl = fqArrays.length; j < jl; j++) {
				var query = fqArrays[j].trim();
				var index = fqArrays[j].indexOf(":");

				//make sure each query has : and there is value in either end of :
				if (index > 0 && index < query.length) {
					//remove any exist fq in the store that have same field name
					for ( var i = 0, l = origFq.length; i < l; i++) {

						if (origFq[i].startsWith(query.substring(0, query
								.indexOf(":")))) {
							Manager.store.removeByValue('fq', origFq[i]);
						}

					}
                                      
					//go ahead add new query to fq store parameter
					Manager.store.addByValue('fq', query);
				} else {
					alert(" fq has invalid syntax. each filter should be in format of fieldName:fieldValue");
					valid = false;
					break;
				}

			}

		}

		if (valid) {
			Manager.doRequest();
		}

	}

	function updateSortedByState(select) {

		//remove the sort paramter
		var returnfields = Manager.store.get('sort').value;
		if (returnfields != undefined)
			Manager.store.removeByValue("sort", returnfields);

		var order = document.getElementById("sortfieldOrder").value;
		var orderField = document.getElementById("sortfields").value;

		if (orderField != "*") {

			Manager.store.addByValue("sort", orderField + " " + order);

		} else {
			var returnfields = Manager.store.get('sort').value;
			if (returnfields != undefined)
				Manager.store.removeByValue("sort", returnfields);

		}

	}

	function updateSearchText(select) {

		var field = document.getElementById("searchFields").value;

		//check if there is any text in the search box
		var fqs = document.getElementById("filteredquery").value;

		if (fqs == "") {

			//get  the query from last applied search
			fqs = field + ":*";

		} else if (fqs.indexOf(":") != -1) {
			fqs = fqs + " AND|OR " + field + ":*";

		} else {
			fqs = field + ":" + fqs;

		}

		document.getElementById("filteredquery").value = fqs;
		document.getElementById("filteredquery").focus();

	}

	function exportData(filetype) {
		//  $('#docs').html($('<img/>').attr('src', 'images/ajax-loader.gif'));
		alert("Please Wait for export to complete. \nTotal "
				+ Manager.response.response.numFound
				+ " records will be exported in the background.");

		//$("#loading").hide();
		var params = Manager.store.exportString();
		/*
		   if(Manager.currentShardUrl!=null)
		    {
		
		        params+="&shards="+Manager.currentShardUrl;
		    }
		
		 */
		var requestURL = Manager.currentSolrUrl + ';' + filetype + ';'
				+ Manager.response.response.numFound + ";" + params + '&wt=csv';

		$.ajax({

			type : "GET",
			url : "/SolrJS/servlets/solrExportServer",

			data : requestURL,
			success : function(url) {
				// $('#docs').html($('<img/>').attr('visible', 'false'));
				alert("Export Completed!");
				//    alert("url"+url);
				// window.open(url,'Download');  
				window.location = url;
			}
		});

	}
	function sortBy(fieldName, order) {

		var returnfields = Manager.store.get('sort').value;
		if (returnfields != undefined)
			Manager.store.removeByValue("sort", returnfields);

		Manager.store.addByValue("sort", fieldName + " " + order);
		Manager.doRequest();

	}
	
	//handle facet search change event
        //'account_text', 'phone_text'
	function handleFacetChange(cb) {
         
		var params = {
			facet : true,
			'facet.field' : Manager.facetFields,

			'facet.limit' : 10,
			'facet.mincount' : 1,

			'facet.date' : 'date_text',
			'facet.date.start' : '2000-1-1T00:00:00.000Z/MONTH',
			'facet.date.end' : '2014-12-30T00:00:00.000Z/MONTH+1MONTH',

			'facet.date.gap' : '+1MONTH',

			'facet.query' : [ 'money_text:[* TO 9999]',
			'money_text:[10000 TO 99999]', 'money_text:[100000 TO *]' ]
                                            
		
          
		};

		if (cb.checked) {
			//remove existing one, if it's there to avoid duplicate
			for ( var name in params) {
				Manager.store.removeByValue(name, params[name]);
                               
			}
			for ( var name in params) {
				Manager.store.addByValue(name, params[name]);
			}

		} else {
			for ( var name in params) {
                           
				Manager.store.removeByValue(name, params[name]);
			}

		}

	}
	function tablePrefHandler(target) {

		//alert("In tablePrefHandler target is "+target);

		//toggle the table column

		//	$('.' + target).toggle();

		if ($('.' + target).css('display') == 'none') {

			//  $('.' + target).css('position', 'relative');
			$('.' + target).css('display', '');

		} else {
			$('.' + target).css('display', 'none');
		}

		var link = $("#pref li ul li a[name=" + target + "]");
		if (link.text().indexOf(">>") > 0) {
			link.text(target);
			link.css({
				"font-weight" : "bold",
				"color" : "#000"
			});
			localStorage.removeItem(target);
		} else {
			//  alert("link"+link);
			link.text(target + '  >>');
			localStorage.setItem(target, false);
			link.css({
				"font-weight" : "bold",
				"color" : "#616161"
			});
		}

	}
        
    
      
    
