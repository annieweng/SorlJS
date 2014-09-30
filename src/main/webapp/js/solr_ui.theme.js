(function ($) {
 
 
        

	AjaxSolr.theme.prototype.table = function(docs, highlighting)
	{



		// This function creates a standard table with column/rows

		var sorted_entries=Manager.store.get("sort").value;
		var imagename="unsorted";
		var order='asc';
		if(sorted_entries!=null)
		{

			if(sorted_entries.endsWith("desc"))
			{
				imagename="descending";
				//set order to ascending for descending button
				order="asc";
			}
			else if(sorted_entries.endsWith("asc"))
			{
				imagename="ascending";
				order="desc";
			}
		}





		var str = '<table id="mytable"  class="resizable">';


		//find column that has highlighted result from query and construct those column first

		var hightlightedKey=new Array();
		var h=0;

		for(var i in highlighting)
		{
			for(var columnName in highlighting[i])
			{

				if(hightlightedKey.indexOf(columnName,0)<0)
				{
					//       console.log("columnName is"+columnName+" assign hightlightedKey to"+h);
					hightlightedKey[h++]=columnName;
				}


			}
		}
		hightlightedKey.sort(function(a,b) {
			a = a.toLowerCase();
			b = b.toLowerCase();
			if( a == b) return 0;
			if( a > b) return 1;
			return -1;
		});

		var key = new Array();
		var k=0;

		str += '<thead><tr>';

		//going through each line
		//go ahead clear the preferences
		$("#pref li ul").empty();
		for (var j=0; j< hightlightedKey.length; j++) {

			//add column to the preference menu
			$("#pref li ul").append('<li>'
					+'<a  href="javascript:tablePrefHandler(\''+hightlightedKey[j]+'\')" name="'+hightlightedKey[j]+'">'

					+hightlightedKey[j]+ '</a></li>');
			

			if(sorted_entries!=null && (sorted_entries.indexOf(hightlightedKey[j])<0))
			{

				str += '<th class="'+hightlightedKey[j]+'">';
				//if we already have facet value for the column, go ahead display it
				if(Manager.response.facet_counts!=undefined &&
						Manager.response.facet_counts.facet_fields[hightlightedKey[j]]!=undefined)
				{

					var cfilter=getCurrentFilter(cname).replace(/\"/g, '');                          
					str+='<select name="'+hightlightedKey[j]+'_select"  onchange="updateFilter(this)"> <option value="NONE" >'+getDisplayName(hightlightedKey[j])+': *</option>';
					for ( var facet in Manager.response.facet_counts.facet_fields[hightlightedKey[j]]) {


						str+='<option value="'+facet+'"';
						if(cfilter==facet)
						{
							str+='selected="selected"';
						}
						str+='>'+facet+'</option>';

					}
					str+='</select>';
				}
				else
				{
					str+=getDisplayName(hightlightedKey[j]);

				}                                         


				str+=' <a href="javascript:sortBy(\''+hightlightedKey[j] + '\', \''+order+'\')" class="unsorted">'+'</a></th>';
			}
			else
			{

				str +=  '<th   class="'+hightlightedKey[j]+'">';
				//if we already have facet value for the column, go ahead display it
				if(Manager.response.facet_counts!=undefined &&
						Manager.response.facet_counts.facet_fields[hightlightedKey[j]]!=undefined)
				{
					var cfilter=getCurrentFilter(hightlightedKey[j]).replace(/\"/g, '');

					str+='<select name="'+hightlightedKey[j]+'_select"  onchange="updateFilter(this)"> <option value="NONE" >'+getDisplayName(hightlightedKey[j])+': *</option>';
					for ( var facet in Manager.response.facet_counts.facet_fields[hightlightedKey[j]]) {


						str+='<option value="'+facet+'"';
						if(cfilter==facet)
						{
							str+='selected="selected"';
						}
						str+='>'+facet+'</option>';

					}
					str+='</select>';
				} else
				{
					str+=getDisplayName(hightlightedKey[j]);

				}

				str   +='<a href="javascript:sortBy(\''+hightlightedKey[j] + '\', \''+order+'\')" class="'+imagename+'">'
				+'</a></th>';
			}


		}


		//going through each line
		for ( i = 0; i < docs.length; i++) {
			//get the key of each highlighted field
			var highlightValue=highlighting[docs[i]["SOLR_UUID"]];



			//go ahead replace column content with hightlighted content from solr
			for( var columnName in highlightValue)
			{
				var columnValue=String(highlightValue[columnName]);

				//only replace content if value doesn't started with embeded >                       	
				if(columnValue.indexOf(">")!=0)
				{ 
                                    //check if highlight field from solr is sorter than original. solr have bug to trancate the original text. 
                                    //have to do manual merge here
                                    var origValue=docs[i][columnName];
                                    if(columnValue.length>origValue.length)
                                        {
                                            docs[i][columnName]=columnValue;
                                        }
                                        else
                                            {
                                                //doing the highlight ourself.
                                                 docs[i][columnName]=highlightText(origValue);
                                                
                                
                                            }
                                    
				}
				else
				{
					//if highlighted content include >, it's mulform tag, go ahead ignore it

					console.log("malform highlight key , will not replace with original column column");
				}
                       


			}


			for (var index in docs[i]) {

				//replace the content in docs with highlighted

				//if the header column doesn't already exist. add to the string

				if(key.indexOf(index, 0)<0  && 
						hightlightedKey.indexOf(index, 0)<0)
				{
					key[k++]=index;
				}



			}
		}
		key.sort(function(as,bs) {
                   
                        as = as.toLowerCase();
			bs = bs.toLowerCase();
                   //put digits as higher order than alpha
               if((as.charAt(0)>='0'&& as.charAt(0)<='9') &&
                      (bs.charAt(0)>='a'&& bs.charAt(0)<='z') )
                   {
                       return 1;
                   }
                   if((bs.charAt(0)>='0'&& bs.charAt(0)<='9') &&
                      (as.charAt(0)>='a'&& as.charAt(0)<='z') )
                   {
                       return -1;
                   }
                   
                  
                       
			if( as == bs) return 0;
			if( as > bs) return 1;
			return -1;
                   
          
                
                } );





		for (j=0; j< key.length; j++) {

			var cname=key[j];


			//add column to the preference menu
			$("#pref li ul").append('<li><a href="javascript:tablePrefHandler(\''+cname+'\')"  name="'+cname+'">'
					+cname+
					//'<input type="checkbox" name="'+cname+
					// onchange="javascript:CheckboxHandler(this)"
					//'" checked="true" />
			'</a></li>');

			if(sorted_entries!=null && (sorted_entries.indexOf(cname)<0))
			{

				str +=  '<th  class="'+cname+
				'">';
				if(Manager.response.facet_counts!=undefined &&
						Manager.response.facet_counts.facet_fields[cname]!=undefined)
				{
					var cfilter=getCurrentFilter(cname).replace(/\"/g, '');   

					str+='<select name="'+cname+'_select"  onchange="updateFilter(this)"> <option value="NONE" >'+getDisplayName(cname)+': *</option>';


					for ( var facet in Manager.response.facet_counts.facet_fields[cname]) {


						str+='<option value="'+facet+'"';
						if(cfilter==facet)
						{
							str+='selected="selected"';
						}


						str+='>'+facet+'</option>';

					}
					str+='</select>';
				}
				else
				{
					str+=getDisplayName(cname);

				}


				str+='<a href="javascript:sortBy(\''+cname + '\', \''+order+'\')" class="unsorted">'
				+'</a></th>';

			}
			else
			{

				str +=  '<th  class="'+cname+'">';
				//if we already have facet value for the column, go ahead display it
				if(Manager.response.facet_counts!=undefined &&
						Manager.response.facet_counts.facet_fields[cname]!=undefined)
				{
					var cfilter=getCurrentFilter(cname).replace(/\"/g, '');   

					str+='<select name="'+cname+'_select"  onchange="updateFilter(this)"> <option value="NONE" >'+getDisplayName(cname)+': *</option>';
					for ( var facet in Manager.response.facet_counts.facet_fields[cname]) {


						str+='<option value="'+facet+'"'
						if(cfilter==facet)
						{
							str+='selected="selected"';
						}
						str+=  '>'+facet+'</option>';

					}
					str+='</select>';
				}
				else
				{
					str+=getDisplayName(cname);

				}



				str+= '<a href="javascript:sortBy(\''+cname + '\', \''+order+'\')" class="'+imagename+'">'
				+'</a></th>';
			}


		}




		str += '</tr></thead>';


		// table body
		str += '<tbody>';


		var query=Manager.store.get("q").value;

		for ( i = 0; i < docs.length; i++) {
			// str += (i % 2 == 0) ? '<tr class="alternative">' : '<tr>';


			str += '<tr onclick="javascript:showTr(this)">';

                        //store the row's data as a html in last column, used to create a document view on click
			var tiledItem='<div>';
                        
			for ( j=0; j< hightlightedKey.length; j++) {
                            var pValue=AjaxSolr.theme.prototype.printValue( docs[i][hightlightedKey[j]], query, hightlightedKey[j], true);
				str += '<td class="'+hightlightedKey[j]+
				'">' +pValue + '</td>';
                        if(pValue && pValue.length>0)
                                        {
                                           // console.log("nonempty value");
                                            tiledItem += '<p><strong>' +hightlightedKey[j]+': </strong>' + pValue+ '</p>';    
                                        }
                        }     
			for ( j=0; j< key.length; j++) {
                            pValue=AjaxSolr.theme.prototype.printValue( docs[i][key[j]], query, key[j], true);
				str += '<td class="'+key[j]+'">' +pValue + '</td>';
                                    if(pValue && pValue.length>0)
                                        {
                                           // console.log("nonempty value");
                                            tiledItem += '<p><strong>' +key[j]+': </strong>' + pValue+ '</p>';    
                                        }
				
			}
			tiledItem+='</div>';
			str+='<td  style="display:none;">'+tiledItem+'</td>';

			str +='</tr>';


		}
		str += '</tbody>';
		str += '</table>';

		return str;


	};

	function getCurrentFilter(columnName)
	{
		var filter="NONE";
		var fq = Manager.store.values('fq');

		if(fq!=undefined)
		{


			for(var j = 0; !(j>=fq.length); j++) {
				if (fq[j].startsWith(columnName)) {

					filter=fq[j].substr(fq[j].indexOf(':')+1);
					break;
				} 
			}
		}
		return filter;

	}
        
        function highlightText(str)
        {
            
            var fq = Manager.store.values('q');
                fq=String(fq).toUpperCase();          

            var keywords=fq.split(" ");
			for(var j = 0; !(j>=keywords.length); j++) {
                           // console.log("keyword is "+keywords[j]);
                             //console.log("keyword before is "+str);
                             var nstr='<span style=\"BACKGROUND-COLOR: #66CCFF\">'+ keywords[j]+'</span>';
			str=str.replace(keywords[j], nstr);	
			
                        //console.log("keyword after is "+str);
            }
		
		return str;
                
        }

	//get display name for column header
	function getDisplayName(str)
	{
		return  str.replace(/\_/g, ' ').replace(' dt', '');

	}

	function htmlEscape(str) {
		return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\//g, '&#47;');

		/*
            .replace(/\/n/g, '</br>')
             .replace(/(/g, '&#40;')
             .replace(/)/g, '&#41;');
		 */

	}
	function snippet (v, checkLength) {
		if(v==undefined)
			return '';
		else
		{
			var str=String(v);


			var output = '';
			if (checkLength && str.length > 200) {

				var index= str.indexOf(' ', 200);

				if(index<0)
				{
					index=200;
				}



				//  <a href="javascript:showDocument(\''+str+'\')" >show document</a>';

				output +=str.substring(0, index);
				output+='<div><span style="display:none;">'+str+
				'</span><a href="#" class="showDoc" >show document</a><div>';
			
			}
			else {
				output += str;
			}
			return output;
		}
	}



	function formatCurrency(num){
		num=String(num),fnum=new Array();
		num = num.match(/\d/g).reverse();
		i=1;	
		$.each(num,function(k,v){
			fnum.push(v);
			if(i%3==0){
				if(k<(num.length-1)){
					fnum.push(",");
				}	
			}
			i++;
		});
		fnum=fnum.reverse().join("");
		return(fnum);
	}


	/// Replaces commonly-used Windows 1252 encoded chars that do not exist in ASCII or ISO-8859-1 with ISO-8859-1 cognates.

	replaceWordChars = function(text) {

		var s = text;
		/*
		// smart single quotes and apostrophe

		s = s.replace(/[\u2018|\u2019|\u201A]/g, "\'");

		// smart double quotes

		s = s.replace(/[\u201C|\u201D|\u201E]/g, "\"");

		// ellipsis

		s = s.replace(/\u2026/g, "...");

		// dashes

		s = s.replace(/[\u2013|\u2014]/g, "-");

		// circumflex

		s = s.replace(/\u02C6/g, "^");

		// open angle bracket

		s = s.replace(/\u2039/g, "<");

		// close angle bracket

		s = s.replace(/\u203A/g, ">");

		// spaces

		s = s.replace(/[\u02DC|\u00A0]/g, " ");
		 */
		/*
		s=s.replace(/<em>/g, '<span style="BACKGROUND-COLOR: #66CCFF">');
		s=s.replace(/<\/em>/g, '</span>');
		 */
		//console.log(s);
		return s;

	}


	AjaxSolr.theme.prototype.printValue=function(v, q, key, checkLength){


            //console.log("before print: "+v);

		if(v==undefined)
			return '';
		else
		{

			v=String(v);
			
                        if(key.indexOf('amount')>=0)
                {
                v=formatCurrency(v);
                }
                //todo: make the field link, so it could be clicked to added as facet field value
                /*
                        if(key==)
                       
                            {
                                v='<a '+ 'name='+key+ ' class="innerlink" href="#"  onclick="javascript:disabledEventPropagation(event);javascript:updateFilter(this);return false;">'+v+'</a>';
                            
                                return v;
                            }
                           
			
			else
                */        
               //handle any column type with link keyword. assumption: they are embedded link
                if(key.toLowerCase().indexOf('link')>0 || v.toLowerCase().indexOf('http')>=0)
			{
                            //html 
				if(v.indexOf('.html')>0)
                                
				{
					//var root=v.substring(0, v.indexOf('media'));
					//v='<a href="'+root+encodeURI(v.substring(v.indexOf('media')))+'" target="_blank">HTML Format</a>';
					v='<a href="'+v+'" target="_blank">HTML Format</a>';
					return v;
				}
                                //wave file
				else if(v.indexOf('.wav')>0)
				{
					if(!checkLength)
					{

						v='</br></br><audio  controls preload="none"><source src="'+v+'">'+
						'<object data="player.swf?audio='+v+'"><param name="movie" value="player.swf?audio='+v+'">'+
						'Your browser does not support the audio element html5/flash.</audio>';
					} 
					else
					{
						v='<a  href="javascript:closePanel()"> <audio  controls preload="none"><source src="'+v+'">'+
						'<object data="player.swf?audio='+v+'"><param name="movie" value="player.swf?audio='+v+'">'+
						'Your browser does not support the audio element html5/flash.</audio></a>';
					}	
					return v;
				}
                                //images
				else if( v.indexOf('.png')>0 || v.indexOf('.jpg')>0)
				{
					var   str='';
					if(v.indexOf(",")>0)
					{
						var varray=v.split(',');

						for (var i = 0, length = varray.length; i < length; i++) {
							var chunk = varray[i];



							if(checkLength)
							{
								str+='<div><span style="display:none;"><img src="'+chunk+'"/>'+
								'</span><a href="#" class="showDoc" >';
								str+='<img width="100"  src="'+chunk+'"/></a></div>';   

							}
							else
							{
								//jbig2 file format are for whole page of pdf. change
								//width to 1000 instead of original. whichis usually 3000-4000px
								if(chunk.indexOf("jbig2")>0)
								{
									str+='<img width="1000" src="'+chunk+'"/>';    
								}
								else
								{
									str+='<img  src="'+chunk+'"/>';  
								}
							}

						}

					}
					else{




						if(checkLength)
						{
							str='<div><span style="display:none;"><img src="'+v+'"/>'+
							'</span><a href="#" class="showDoc" >';

							str+='<img width="100"  src="'+v+'"/></a></div>';   

						}
						else
						{
							str='<img  src="'+v+'"/>';   
						}


					}


					return str;
				}
				else
				{
					v='<a href="'+v+'" target="_blank">Original  Document</a>';
					return v;
				}

				return v;
			}


			//preserve all original format of string. this is needed to preserve .doc, .pdf formats.

			if(key=='content')
			{
				v='<div white-space="pre-wrap" word-break="break-all" text-wrap="break-all">'+v+'</div>';	
			}

			//v= replaceWordChars(v);
			if(!checkLength)
			{
				return v;
			}

                    
			return snippet(v,  checkLength);


		}
	};


	AjaxSolr.theme.prototype.tag = function (value, weight, count, handler) {
		return $('<a href="#" title='+count+' class="tagcloud_item"/>').text(value).addClass('tagcloud_size_' + weight).click(handler);
	};

	AjaxSolr.theme.prototype.facet_link = function (value, handler) {
		return $('<a href="#"/>').text(value).click(handler);
	};

	AjaxSolr.theme.prototype.sort_link = function (value, headingTitle,  handler) {

		//update the image of sort base on sorted result
		var sorted_entries=Manager.store.get("sort").value;
		var imagename="";
		if(sorted_entries!=null)
		{
			if(sorted_entries.endsWith("desc"))
			{
				imagename="descending";
			}
			else if(sorted_entries.endsWith("asc"))
			{
				imagename="ascending";
			}
		}
		if(sorted_entries!=null && sorted_entries.startsWith(value))
		{
			return $('<a href="#"/>').text(headingTitle).addClass(imagename).click(handler);
		}
		else
		{
			return $('<a href="#"/>').text(headingTitle).click(handler);

		}

	};

	AjaxSolr.theme.prototype.no_items_found = function () {
		return 'no items found in current selection';
	};


})(jQuery);
