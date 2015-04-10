(function($) {

    /**
     * 
     * @param {type} docs
     * @param {type} highlighting
     * @returns {String} list view of content
     */
    AjaxSolr.theme.prototype.list = function(docs, highlighting)
    {
        var str = "<ul>";
        for (var i = 0, l = docs.length; i < l; i++) {

            str += template(docs[i], highlighting);
        }
        str += "</ul>";
        // console.log(str);
        return str;

    },
            AjaxSolr.theme.prototype.treeList = function(doc)
    {

        var str = '';
        str = template_tree(doc);

        // console.log(str);
        return str;

    },
            AjaxSolr.theme.prototype.table = function(docs, highlighting)
    {




        // This function creates a standard table with column/rows

        var sorted_entries = Manager.store.get("sort").value;
        var imagename = "unsorted";
        var order = 'asc';
        if (sorted_entries !== null)
        {

            if (sorted_entries.endsWith("desc"))
            {
                imagename = "descending";
                //set order to ascending for descending button
                order = "asc";
            }
            else if (sorted_entries.endsWith("asc"))
            {
                imagename = "ascending";
                order = "desc";
            }
        }




        var str = '<table id="mytable"  class="resizable">';


        //find column that has highlighted result from query and construct those column first

        var hightlightedKey = new Array();
        var h = 0;

        for (var i in highlighting)
        {
            for (var columnName in highlighting[i])
            {

                if (hightlightedKey.indexOf(columnName, 0) < 0)
                {
                    //       console.log("columnName is"+columnName+" assign hightlightedKey to"+h);
                    hightlightedKey[h++] = columnName;
                }


            }
        }
        hightlightedKey.sort(function(a, b) {
            a = a.toLowerCase();
            b = b.toLowerCase();
            if (a === b)
                return 0;
            if (a > b)
                return 1;
            return -1;
        });

        var key = new Array();
        var k = 0;

        str += '<thead><tr>';

        //going through each line
        //go ahead clear the preferences
        $("#pref li ul").empty();
        for (var j = 0; j < hightlightedKey.length; j++) {

            //add column to the preference menu
            $("#pref li ul").append('<li>'
                    + '<a  href="javascript:tablePrefHandler(\'' + hightlightedKey[j] + '\')" name="' + hightlightedKey[j] + '">'

                    + hightlightedKey[j] + '</a></li>');



            if (sorted_entries !== null && (sorted_entries.indexOf(hightlightedKey[j]) < 0))
            {

                str += '<th class="' + hightlightedKey[j] + '">';
                //if we already have facet value for the column, go ahead display it
                if (Manager.response.facet_counts !== undefined &&
                        Manager.response.facet_counts.facet_fields[hightlightedKey[j]] !== undefined)
                {

                    var cfilter = getCurrentFilter(cname).replace(/\"/g, '');
                    str += '<select name="' + hightlightedKey[j] + '_select"  onchange="updateFilter(this)"> <option value="NONE" >' + getDisplayName(hightlightedKey[j]) + ': *</option>';
                    for (var facet in Manager.response.facet_counts.facet_fields[hightlightedKey[j]]) {


                        str += '<option value="' + facet + '"';
                        if (cfilter === facet)
                        {
                            str += 'selected="selected"';
                        }
                        str += '>' + facet + '</option>';

                    }
                    str += '</select>';
                }
                else
                {
                    str += getDisplayName(hightlightedKey[j]);

                }


                str += ' <a href="javascript:sortBy(\'' + hightlightedKey[j] + '\', \'' + order + '\')" class="unsorted">' + '</a></th>';
            }
            else
            {

                str += '<th   class="' + hightlightedKey[j] + '">';
                //if we already have facet value for the column, go ahead display it
                if (Manager.response.facet_counts !== undefined &&
                        Manager.response.facet_counts.facet_fields[hightlightedKey[j]] !== undefined)
                {
                    var cfilter = getCurrentFilter(hightlightedKey[j]).replace(/\"/g, '');

                    str += '<select name="' + hightlightedKey[j] + '_select"  onchange="updateFilter(this)"> <option value="NONE" >' + getDisplayName(hightlightedKey[j]) + ': *</option>';
                    for (var facet in Manager.response.facet_counts.facet_fields[hightlightedKey[j]]) {


                        str += '<option value="' + facet + '"';
                        if (cfilter === facet)
                        {
                            str += 'selected="selected"';
                        }
                        str += '>' + facet + '</option>';

                    }
                    str += '</select>';
                } else
                {
                    str += getDisplayName(hightlightedKey[j]);

                }

                str += '<a href="javascript:sortBy(\'' + hightlightedKey[j] + '\', \'' + order + '\')" class="' + imagename + '">'
                        + '</a></th>';
            }


        }


        //going through each line
        for (i = 0; i < docs.length; i++) {
            //get the key of each highlighted field
            var highlightValue = highlighting[docs[i]["SOLR_UUID"]];



            //go ahead replace column content with hightlighted content from solr
            for (var columnName in highlightValue)
            {
                var columnValue = String(highlightValue[columnName]);
                //console.log("in get hightline:"+ columnName+": " +columnValue);
                //only replace content if value doesn't started with embeded >                       	
                if (columnValue.indexOf(">") !== 0)
                {
                    //check if highlight field from solr is sorter than original. solr have bug to trancate the original text. 
                    //have to do manual merge here
                    var origValue = docs[i][columnName];
                    if (columnValue.length > origValue.length)
                    {
                        docs[i][columnName] = columnValue;
                    }
                    else
                    {
                        //doing the highlight ourself.
                        docs[i][columnName] = highlightText(origValue);


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

                if (key.indexOf(index, 0) < 0 &&
                        hightlightedKey.indexOf(index, 0) < 0)
                {
                    key[k++] = index;
                }



            }
        }
        key.sort(function(as, bs) {

            as = as.toLowerCase();
            bs = bs.toLowerCase();
            //put digits as higher order than alpha
            if ((as.charAt(0) >= '0' && as.charAt(0) <= '9') &&
                    (bs.charAt(0) >= 'a' && bs.charAt(0) <= 'z'))
            {
                return 1;
            }
            if ((bs.charAt(0) >= '0' && bs.charAt(0) <= '9') &&
                    (as.charAt(0) >= 'a' && as.charAt(0) <= 'z'))
            {
                return -1;
            }



            if (as === bs)
                return 0;
            if (as > bs)
                return 1;
            return -1;

            /*
             var a, b, a1, b1, i= 0, n, L,
             rx=/(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
             if(as=== bs) return 0;
             a= as.toLowerCase().match(rx);
             b= bs.toLowerCase().match(rx);
             L= a.length;
             while(i<L){
             if(!b[i]) return 1;
             a1= a[i],
             b1= b[i++];
             if(a1!== b1){
             n= a1-b1;
             if(!isNaN(n)) return n;
             return a1>b1? 1:-1;
             }
             }
             return b[i]? -1:0;
             
             
             */

        });





        for (j = 0; j < key.length; j++) {

            var cname = key[j];


            //add column to the preference menu
            $("#pref li ul").append('<li><a href="javascript:tablePrefHandler(\'' + cname + '\')"  name="' + cname + '">'
                    + cname +
                    '</a></li>');

            if (sorted_entries !== null && (sorted_entries.indexOf(cname) < 0))
            {

                str += '<th  class="' + cname +
                        '">';
                if (Manager.response.facet_counts !== undefined &&
                        Manager.response.facet_counts.facet_fields[cname] !== undefined)
                {
                    var cfilter = getCurrentFilter(cname).replace(/\"/g, '');

                    str += '<select name="' + cname + '_select"  onchange="updateFilter(this)"> <option value="NONE" >' + getDisplayName(cname) + ': *</option>';


                    for (var facet in Manager.response.facet_counts.facet_fields[cname]) {


                        str += '<option value="' + facet + '"';
                        if (cfilter === facet)
                        {
                            str += 'selected="selected"';
                        }


                        str += '>' + facet + '</option>';

                    }
                    str += '</select>';
                }
                else
                {
                    str += getDisplayName(cname);

                }


                str += '<a href="javascript:sortBy(\'' + cname + '\', \'' + order + '\')" class="unsorted">'
                        + '</a></th>';

            }
            else
            {

                str += '<th  class="' + cname + '">';
                //if we already have facet value for the column, go ahead display it
                if (Manager.response.facet_counts !== undefined &&
                        Manager.response.facet_counts.facet_fields[cname] !== undefined)
                {
                    var cfilter = getCurrentFilter(cname).replace(/\"/g, '');

                    str += '<select name="' + cname + '_select"  onchange="updateFilter(this)"> <option value="NONE" >' + getDisplayName(cname) + ': *</option>';
                    for (var facet in Manager.response.facet_counts.facet_fields[cname]) {


                        str += '<option value="' + facet + '"'
                        if (cfilter === facet)
                        {
                            str += 'selected="selected"';
                        }
                        str += '>' + facet + '</option>';

                    }
                    str += '</select>';
                }
                else
                {
                    str += getDisplayName(cname);

                }



                str += '<a href="javascript:sortBy(\'' + cname + '\', \'' + order + '\')" class="' + imagename + '">'
                        + '</a></th>';
            }


        }




        str += '</tr></thead>';


        // table body
        str += '<tbody>';


        var query = Manager.store.get("q").value;

        for (i = 0; i < docs.length; i++) {
            // str += (i % 2 == 0) ? '<tr class="alternative">' : '<tr>';


            str += '<tr onclick="javascript:showTr(this, event)">';


            //store the row's data as a html in last column, used to create a document view on click
            var tiledItem = '<div>';

            for (j = 0; j < hightlightedKey.length; j++) {
                var pValue = AjaxSolr.theme.prototype.printValue(docs[i][hightlightedKey[j]], query, hightlightedKey[j], true);
                str += '<td class="' + hightlightedKey[j] +
                        '">' + pValue + '</td>';
                if (pValue && pValue.length > 0)
                {
                    // console.log("nonempty value");
                    tiledItem += '<p><strong>' + hightlightedKey[j] + ': </strong>' 
                            + AjaxSolr.theme.prototype.printValue(docs[i][hightlightedKey[j]], query, hightlightedKey[j], false) + '</p>';
                }
            }
            for (j = 0; j < key.length; j++) {
                pValue = AjaxSolr.theme.prototype.printValue(docs[i][key[j]], query, key[j], true);
                str += '<td class="' + key[j] + '">' + pValue + '</td>';
                if (pValue && pValue.length > 0)
                {
                    // console.log("nonempty value");
                    tiledItem += '<p><strong>' + key[j] + ': </strong>' + AjaxSolr.theme.prototype.printValue(docs[i][key[j]], query, key[j], false) + '</p>';
                }

            }
            tiledItem += '</div>';
            str += '<td  style="display:none;" class="doc">' + tiledItem + '</td>';

            str += '</tr>';


        }
        str += '</tbody>';
        str += '</table>';

        return str;


    };


    function getCurrentFilter(columnName)
    {
        var filter = "NONE";
        var fq = Manager.store.values('fq');

        if (fq != undefined)
        {


            for (var j = 0; !(j >= fq.length); j++) {
                if (fq[j].startsWith(columnName)) {

                    filter = fq[j].substr(fq[j].indexOf(':') + 1);
                    break;
                }
            }
        }
        return filter;

    }

    function highlightText(str)
    {

        var fq = Manager.store.values('q');
        fq = String(fq).toUpperCase();
//console.log("q is "+fq);
        var keywords = fq.split(" ");
        for (var j = 0; !(j >= keywords.length); j++) {
            // console.log("keyword is "+keywords[j]);
            //console.log("keyword before is "+str);
            var nstr = '<span style=\"BACKGROUND-COLOR: #66CCFF\">' + keywords[j] + '</span>';
            str = str.replace(keywords[j], nstr);

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
    function template(doc, highlighting) {
        //hidden tiled view in document window, when show detail, or sumary link is clicked
        var tiledItem = '<div>';

        var content = "<li><div class=\"record\">";
        //list all highlighted feilds
        var hightlightedKey = new Array();

        //all other keys
        var key = new Array();

        //maintain a list of tre vieww enabled fields
        var treeViewEnabledField_key = new Array();
        var h = 0;
        var dateFound = false;
        content += "<a class='summary' >";
        var query = Manager.store.get("q").value;



        //go through highlighting key fields, and list them first in the record view
        if (highlighting)
        {
            for (var i in highlighting)
            {
                for (var columnName in highlighting[i])
                {
                    //ends with a date time type
                    if ((!dateFound) && (columnName.match(/\_tdt$/) || columnName.indexOf('date')) >= 0)
                    {
                        var dt = doc[columnName];
                        if (doc['source_nm']!==undefined )
                        {
                            content += "<h2>  " + dt + "  From Source " + doc['source_nm'] + "</h2>";
                        }
                        else if(doc['title']!==undefined)
                        {
                            content += '<h2>' + dt + "  " + doc['title'] + '</h2>';
                        }
                        else
                            {
                                 content += '<h2>'+dt+'</h2>';
                            }
                        dateFound = true;
                    }
                    if (hightlightedKey.indexOf(columnName, 0) < 0)
                    {
                        //       console.log("columnName is"+columnName+" assign hightlightedKey to"+h);
                        hightlightedKey[h++] = columnName;
                    }



                }
            }
            hightlightedKey.sort(function(a, b) {
                a = a.toLowerCase();
                b = b.toLowerCase();
                if (a === b)
                    return 0;
                if (a > b)
                    return 1;
                return -1;
            });
        }



        var k = 0;
        //populate tre view enable Fields keys
        for (var index in doc) {
           for (var i = 0; i < Manager.treeViewEnabledFields.length; i++)
            {
                if (Manager.treeViewEnabledFields[i] === index)
                {
                   
                    treeViewEnabledField_key[k++] = index;
                    
                    
                }
            }
        }
            k = 0;
        for (var index in doc) {

            
            //check for list of tree view enable fields, and list them first.
            var notInTreeView = treeViewEnabledField_key.indexOf(index, 0)<0;
            

            if (notInTreeView && index != "SOLR_UUID" && index != '_version_' &&
                    hightlightedKey.indexOf(index, 0) < 0)
            {
                key[k++] = index;
                //ends with a date time type
                if ((!dateFound) && (index.match(/\_tdt$/) || index.indexOf('date') >= 0))
                {
                    dateFound = true;
                    var dt = doc[index];
                    if (doc['source_nm']!==undefined )
                        {
                            content += "<h2> " + dt + " Source: " + doc['source_nm'] + "</h2>";
                        }
                        else if(doc['title']!==undefined)
                        {
                            content += '<h2>' + dt + "  " + doc['title'] + '</h2>';
                        }
                        else
                            {
                                 content += '<h2>'+dt+'</h2>';
                            }
                }

            }




        }

        key.sort(function(as, bs) {

            as = as.toLowerCase();
            bs = bs.toLowerCase();
            //put digits as higher order than alpha
            if ((as.charAt(0) >= '0' && as.charAt(0) <= '9') &&
                    (bs.charAt(0) >= 'a' && bs.charAt(0) <= 'z'))
            {
                return 1;
            }
            if ((bs.charAt(0) >= '0' && bs.charAt(0) <= '9') &&
                    (as.charAt(0) >= 'a' && as.charAt(0) <= 'z'))
            {
                return -1;
            }


            if (as == bs)
                return 0;
            if (as > bs)
                return 1;
            return -1;

        });



        for (j = 0; j < hightlightedKey.length; j++) {
            var pValue = AjaxSolr.theme.prototype.printValue(doc[hightlightedKey[j]], query, hightlightedKey[j], false);


            if (pValue && pValue.length > 0)
            {

                //only print key if it doesn't started  with number
                // if ( isNaN(parseInt(hightlightedKey[j])) ) 
                //   {
                content += (hightlightedKey[j].replace(/\_/g, ' ').replace(/[0-9]/g, "")) + ': ';
                // }
                content += highlightText(pValue) + "  ";
                //   if(i%3===0)
                // {
                content += "<br>";
                //}

                // console.log("nonempty value");
                tiledItem += '<p><strong>' + hightlightedKey[j].replace(/_/g, ' ') + ': </strong>' + highlightText(pValue) + '</p>';




            }
        }
        content += "</a>";

        for (j = 0; j < treeViewEnabledField_key.length; j++) {
            pValue = AjaxSolr.theme.prototype.printValue(doc[treeViewEnabledField_key[j]], query, treeViewEnabledField_key[j], false, true);


            if (pValue && pValue.length > 0)
            {
                // console.log("nonempty value");
                tiledItem += '<p><strong>' + treeViewEnabledField_key[j] + ': </strong>' + pValue + '</p>';

                if (isNaN(parseInt(treeViewEnabledField_key[j])))
                {
                    content += treeViewEnabledField_key[j].replace(/\_/g, ' ') + ':';
                }

                content +=
                        '<div  class="idtrees"' + 'name="' + treeViewEnabledField_key[j] + '">' +
                        '<ul>' +
                        "<li  data-jstree='{ \"opened\" : true }' >" + pValue + "</li></ul></div>";

            }


        }


        for (j = 0; j < key.length; j++) {
            pValue = AjaxSolr.theme.prototype.printValue(doc[key[j]], query, key[j], true);

            if (pValue && pValue.length > 0)
            {
                // console.log("nonempty value");
                tiledItem += '<p><strong>' + key[j] + ': </strong>' + AjaxSolr.theme.prototype.printValue(doc[key[j]], query, key[j], false) + '</p>';

                if (isNaN(parseInt(key[j])))
                {
                    content += key[j].replace(/\_/g, ' ') + ':';
                }



                content += pValue + " | ";

                if (j > 0 && j % 4 === 0)
                {
                      content=content.substr(0, content.length-1);
                    content += "<br>";
                }
            }

        }

        tiledItem += '<br><br></div>';
        content += '<br><div><span style="display:none;" class="doc">' + tiledItem +
                '</span><a href="#" class="showDoc" >show document...</a><div>';
        content += '<br><br></div></li>';


        return content;


    }

    /**
     * 
     * @param {type} doc
     * @returns {String} tree leaf format for the  document
     */
    function template_tree(doc) {

        var tiledItem = '<div>';
        var content = "";
        // var content="<li><div>";

        var key = new Array();
        var h = 0;


        content += '<a href="#" class="showDoc" >';
        var query = Manager.store.get("q").value;

        var k = 0;
        for (var index in doc) {

            //replace the content in docs with highlighted

            //if the header column doesn't already exist. add to the string

            if (index != "SOLR_UUID" && index != '_version_')
            {
                key[k++] = index;


            }

        }

        key.sort(function(as, bs) {

            as = as.toLowerCase();
            bs = bs.toLowerCase();
            //put digits as higher order than alpha
            if ((as.charAt(0) >= '0' && as.charAt(0) <= '9') &&
                    (bs.charAt(0) >= 'a' && bs.charAt(0) <= 'z'))
            {
                return 1;
            }
            if ((bs.charAt(0) >= '0' && bs.charAt(0) <= '9') &&
                    (as.charAt(0) >= 'a' && as.charAt(0) <= 'z'))
            {
                return -1;
            }



            if (as == bs)
                return 0;
            if (as > bs)
                return 1;
            return -1;



        });




        //content+="</a>";
        for (j = 0; j < key.length; j++) {
            //disable any  embeded facet link in the tree leaf
            pValue = AjaxSolr.theme.prototype.printValue(doc[key[j]], query, key[j], false, true);

            if (pValue && pValue.length > 0)
            {
                if(query!=='*:*')
                    {
                //go ahead highlight the text as needed
                pValue = highlightText(pValue);
                    }
                // console.log("nonempty value");
                tiledItem += '<strong>' + key[j] + ': </strong>' + pValue + "</br>";


               
                    content += pValue + " | ";
                

            }

        }
        
        content=content.substr(0, content.length-1);
        tiledItem += '<br><br></div>';
        
        //let's make content shrink, extend as needed, when length is >100
         if (content.length > 100) {

                var index = content.indexOf(' ', 100);

                if (index < 0)
                {
                    index = 100;
                }

                //  <a href="javascript:showDocument(\''+str+'\')" >show document</a>';

                
                var snippet=content.substring(index);
                content = content.substring(0, index);
                //add more content to enable show/hide capability
                 content += '</a><span  class="more" style="display:none;">' + snippet;
                 content += '</span> <a href="#" class="more">show more..</a>';
                 //add hidden tileItem to enable creation of document view when click 
                   content += '<span  class="doc" style="display:none;">' + tiledItem +
               '</span>';
         }
         else
             {
    
       //make more and show doc work
        content += '</a><span style="display:none;" class="doc">' + tiledItem +
               '</span>';
             }

        return content;

    }
    /**
     * 
     * @param {type} v content
     * @param {type} maxLength
     * @returns {String} snippet of v, up to maxLength
     */
    
    function snippet(v, maxLength) {
        
        if (v === undefined)
            {
            return '';
            }
        else
            var str = String(v);

        {

            var output = '';
            if (str.length > maxLength) {

                var index = str.indexOf(' ', maxLength);

                if (index < 0)
                {
                    index = maxLength;
                }

                //  <a href="javascript:showDocument(\''+str+'\')" >show document</a>';

                output += str.substring(0, index);
                /*
                output += '<div><span style="display:none;">' + str +
                        '</span><a href="#" class="showDoc" >show document</a><div>';
                */
                
                
                 output += '<div><span style="display:none;" class="more">' + str.substring(index);
                 output += '</span> <a href="#" class="more">show more..</a></div>';
                 
            }
            else {
                output += str;
            }
            return output;
        }
    }



    function formatCurrency(num) {
        num = String(num), fnum = new Array();
        num = num.match(/\d/g).reverse();
        i = 1;
        $.each(num, function(k, v) {
            fnum.push(v);
            if (i % 3 == 0) {
                if (k < (num.length - 1)) {
                    fnum.push(",");
                }
            }
            i++;
        });
        fnum = fnum.reverse().join("");
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

    /**
     * 
     * @param {type} v  value
     * @param {type} q   current query
     * @param {type} key  the field key name
     * @param {type} checkLength check length 
     * @param {type} enableFacetLink enable facet link for the record
     * @returns {String}
     */
    AjaxSolr.theme.prototype.printValue = function(v, q, key, checkLength, disableFacetLink) {


        //console.log("before print: "+v);

        if (v == undefined)
            return '';
        else
        {

            v = String(v);
            //if key ends with '_d', and value is not 4 words(like year), treat it as number
            /*
             if(key.indexOf('_d', key.length-2)!=-1  && v.length!=4)
             {
             v=formatCurrency(v);
             }
             
             
             */

            if (key.indexOf('amount') >= 0)
            {
                v = formatCurrency(v);
            }
            if (!disableFacetLink)
            {
                // enable facet query on those fields
                for (var i = 0; i < Manager.facetLinkEnableFields.length; i++) {
                    if (Manager.facetLinkEnableFields[i] === key)
                    {
                        v = '<a ' + 'name=' + key + ' class="innerlink" href="#"  onclick="javascript:disabledEventPropagation(event);javascript:updateFilter(this);return false;">' + v + '</a>';

                        return v;
                    }
                }
            }


            //go ahead embedded link to the column value
            if (key === 'web_link' || key === "image_links" || key === 'html_link')
            {
                if (v.indexOf('.html') > 0)

                {
                    //var root=v.substring(0, v.indexOf('media'));
                    //v='<a href="'+root+encodeURI(v.substring(v.indexOf('media')))+'" target="_blank">HTML Format</a>';
                    v = '<a href="' + v + '" target="_blank">HTML Format</a>';
                    return v;
                }
                else if (v.indexOf('.wav') > 0)
                {
                    if (!checkLength)
                    {

                        v = '</br></br><audio  controls preload="none"><source src="' + v + '">' +
                                '<object data="player.swf?audio=' + v + '"><param name="movie" value="player.swf?audio=' + v + '">' +
                                'Your browser does not support the audio element html5/flash.</audio>';
                    }
                    else
                    {
                        v = '<a  href="javascript:closePanel()"> <audio  controls preload="none"><source src="' + v + '">' +
                                '<object data="player.swf?audio=' + v + '"><param name="movie" value="player.swf?audio=' + v + '">' +
                                'Your browser does not support the audio element html5/flash.</audio></a>';
                    }
                    return v;
                }
                else if (v.indexOf('.png') > 0 || v.indexOf('.jpg') > 0)
                {
                    var str = '';
                    if (v.indexOf(",") > 0)
                    {
                        var varray = v.split(',');

                        for (var i = 0, length = varray.length; i < length; i++) {
                            var chunk = varray[i];



                            if (checkLength)
                            {
                                str += '<div><span style="display:none;"><img src="' + chunk + '"/>' +
                                        '</span><a href="#" class="showDoc" >';
                                str += '<img width="100"  src="' + chunk + '"/></a></div>';

                            }
                            else
                            {
                                //jbig2 file format are for whole page of pdf. change
                                //width to 1000 instead of original. whichis usually 3000-4000px
                                if (chunk.indexOf("jbig2") > 0)
                                {
                                    str += '<img width="1000" src="' + chunk + '"/>';
                                }
                                else
                                {
                                    str += '<img  src="' + chunk + '"/>';
                                }
                            }

                        }

                    }
                    else {




                        if (checkLength)
                        {
                            str = '<div><span style="display:none;"><img src="' + v + '"/>' +
                                    '</span><a href="#" class="showDoc" >';

                            str += '<img width="100"  src="' + v + '"/></a></div>';

                        }
                        else
                        {
                            str = '<img  src="' + v + '"/>';
                        }


                    }


                    return str;
                }
                else
                {
                    v = '<a href="' + v + '" target="_blank">Original  Document</a>';
                    return v;
                }

                return v;
            }


            //preserve all original format of string. this is needed to preserve .doc, .pdf formats.

            if (key == 'content')
            {
                v = '<div white-space="pre-wrap" word-break="break-all" text-wrap="break-all">' + v + '</div>';
            }

            //v= replaceWordChars(v);
            if (!checkLength)
            {
                return v;
            }


            return snippet(v,  100);


        }
    };


    AjaxSolr.theme.prototype.tag = function(value, weight, count, handler) {
        return $('<a href="#" title=' + count + ' class="tagcloud_item"/>').text(value).addClass('tagcloud_size_' + weight).click(handler);
    };

    AjaxSolr.theme.prototype.facet_link = function(value, handler) {
        return $('<a href="#"/>').text(value).click(handler);
    };

    AjaxSolr.theme.prototype.sort_link = function(value, headingTitle, handler) {

        //update the image of sort base on sorted result
        var sorted_entries = Manager.store.get("sort").value;
        var imagename = "";
        if (sorted_entries != null)
        {
            if (sorted_entries.endsWith("desc"))
            {
                imagename = "descending";
            }
            else if (sorted_entries.endsWith("asc"))
            {
                imagename = "ascending";
            }
        }
        if (sorted_entries != null && sorted_entries.startsWith(value))
        {
            return $('<a href="#"/>').text(headingTitle).addClass(imagename).click(handler);
        }
        else
        {
            return $('<a href="#"/>').text(headingTitle).click(handler);

        }

    };

    AjaxSolr.theme.prototype.no_items_found = function() {
        return 'no items found in current selection';
    };


})(jQuery);
