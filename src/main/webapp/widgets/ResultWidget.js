(function($) {


    AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
        start: 0,
        beforeRequest: function() {
            $(this.target).html($('<img/>').attr('src', 'images/ajax-loader.gif'));
        },
        facetLinks: function(facet_field, facet_values) {
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
        facetHandler: function(facet_field, facet_value) {
            var self = this;
            return function() {
                self.manager.store.remove('fq');
                self.manager.store.addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value));
                self.doRequest();
                return false;
            };
        },
        headerHandler: function(header_field, header_order) {
            var self = this;
            return function() {

                self.manager.store.remove('sort');
                self.manager.store.addByValue('sort', header_field + ' ' + header_order);

                if (header_order === 'desc')
                {
                    sortingOrder = 'asc';
                }
                else
                {
                    sortingOrder = 'desc';
                }
                self.doRequest();

                return false;
            };
        },
        afterRequest: function() {
            var theInstance = this;
            //update current view to last setted preferences
            var currentview = localStorage.getItem("view");
            if (currentview && currentview !== ($("#viewButton").attr('value')))
            {
                //    alert(currentview);
                //console.trace("currentview: "+currentview);
                if (currentview === 'table')
                {
                    $("#viewButton").attr("value", 'table');
                    $("#viewButton").text("List");


                }
                else
                {
                    $("#viewButton").attr("value", 'list');
                    $("#viewButton").text("Table");

                }

            }
            refreshView(theInstance, $("#viewButton").attr("value"));




        },
        init: function() {

            var theInstance = this;
            $('div').on('click', 'a.more', function(event) {
                disabledEventPropagation(event);
                $(this).siblings('span.more').toggle();
                if ($(this).html().indexOf('more') > 0)
                {
                    $(this).text('Hide detail..');
                }
                else
                {
                    $(this).text('Show more..');

                }
               
                return false;
               
            });






            $('div').on('click', 'a.showDoc', function(event) {
                disabledEventPropagation(event);
                //showDocument($(this).parent().find('span:last').html());
                var dochtml=$(this).siblings('span.doc').html();
                if(dochtml!==undefined)
                    showDocument(dochtml);
                else
                   showDocument($(this).parent().find('span:last').html());
                return false;

            });



            $("#viewButton").on('click', function() {
                //$(this).attr('src', 'images/ajax-loader.gif');
                if ($(this).attr('value') === 'table')
                {
                    $(this).attr("value", 'list');
                    $(this).text("Table");
                    localStorage.setItem('view', 'list');

                }
                else
                {
                    $(this).attr("value", 'table');
                    $(this).text("List");
                    localStorage.setItem('view', 'table');
                }
                refreshView(theInstance, $(this).attr('value'));


            });


            $('div').on("click", 'a.summary', function() {



                showDocument($(this).parent().find('div').find('span').html());

                return false;

            });






        }
    });

    /*
     * 
     * @param {type} e event
     * @param {type} data  
     * @param {type} theInstance
     * @returns create jstree structures that are group by current_bsa_identifier,  only if current target is root node, and has no children yet
     */
    function getChildrenNodes(e, data, theInstance, openNode)
    {

        var inst = data.instance;
        if (data.selected.length)
        {
            var node = inst.get_node(data.selected[0]);
            //the the group field name 
            var fieldName = $("#" + node.id).parent().closest('div').attr('name');

            //if this node root node, and has no children, go ahead populate rest of records corresponding to current bsa identifier
            if (inst.get_parent(node) === '#' && node.children.length === 0)
            {
                var param = 'json.nl=map&group=true&group.field=' + fieldName + '&group.main=true&group.limit=30';
                if (Manager.treeSortByFieldName != '')
                {
                    param += '&sort=' + Manager.treeSortByFieldName + ' desc';
                }
                var params = [param];
                params.push('q=' + fieldName + ':' + node.text);

                //call back 
                var callback = function(response) {

                    //go through each document, add record number, then content to each record number to the tree
                    for (var i = 0, l = response.response.docs.length; i < l; i++) {
                        var uniq_id = data.node.id;

                        //if we have a sub tree category, go ahead group data by the treeCategoryFieldName
                        if (Manager.treeCategoryFieldName !== '')
                        {
                            var category = response.response.docs[i][Manager.treeCategoryFieldName];
                            //replace all ingle white space character, including space, tab, form feed, line feed
                            category = category.replace(/\s/g, '_');
                            uniq_id = uniq_id + "_" + category;
                            //if category doesn't exist it, go ahead create one.
                            if (!inst.get_node(uniq_id))

                            {
                                inst.create_node(node, {text: category, id: uniq_id}, "last", function() {
                                    //alert("created");
                                }, true);

                            }

                        }
                        //create the leaf for each document

                        var parentNode = $("#" + uniq_id);

                        var content = AjaxSolr.theme("treeList", response.response.docs[i]);
                        // console.log("content "+i+": "+content+"\n");
                        inst.create_node(parentNode, {text: content, id: uniq_id + "_" + i}, "last", function() {
                            //alert("created");
                        }, false);

                        if (openNode)
                        {
                            inst.open_node(parentNode);
                        }

                    }





                };
                if (theInstance.manager.proxyUrl) {


                    jQuery.getJSON(theInstance.manager.proxyUrl + '?' + theInstance.manager.currentSolrUrl + ';' + params.join('&') + '&wt=json&json.wrf=?',
                            {}, callback);

                }
                else {

                    var jointChar = '?';
                    if (theInstance.manager.currentSolrUrl.indexOf("?") > 0)
                    {
                        jointChar = '&';
                    }


                    jQuery.getJSON(theInstance.manager.currentSolrUrl + jointChar + params.join('&') + '&wt=json&json.wrf=?', {}, callback);
                }
            }

        }

    }

    /*
     * 
     
     * @param {type} view  'document' or 'table; style
     * @returns {undefined} */
    function refreshView(theInstance, view)
    {
        $(theInstance.target).empty();



        $(theInstance.target).append(AjaxSolr.theme(view, theInstance.manager.response.response.docs, theInstance.manager.response.highlighting));


        if (view === 'table')
        {
            //	  localStorage.clear();
            for (var i = 0; i < localStorage.length; i++)
            {
                var key = localStorage.key(i);
                //alert("key"+key);   
                //toggle the table column
                $('.' + key).toggle();
                var link = $("#pref li ul li a[name=" + key + "]");
                //  alert("link"+link);
                link.text(key + '  >>');

                link.css({"font-weight": "bold", "color": "#616161"});

            }






            //go ahead update advance search function options
            $("#searchFields").empty();
            $("#sortfields").empty();
            $("#sortfields").append($('<option>', {
                value: '*',
                text: 'None'
            }));
            $("#pref li ul li a").each(function() {

                $("#searchFields").append($('<option>', {
                    value: $(this).attr('name'),
                    text: $(this).attr('name')
                }));

                $("#sortfields").append($('<option>', {
                    value: $(this).attr('name'),
                    text: $(this).attr('name')
                }));

            });

            /*
             $('a.innerlink').click(function(e){
             alert("event clicked in innerlink");
             e.stopPropagation(); 
             });   
             */

            var t = document;
            var o = t.createElement('script');

            o.setAttribute('type', 'text/javascript');
            o.setAttribute('src', 'js/table_resizable.js');
            document.getElementsByTagName("head")[0].appendChild(o);
            // jQuery MAY OR MAY NOT be loaded at this stage


            var waitForLoad = function() {


                if (resizableTables !== undefined) {



                    ResizableColumns();



                } else {
                    window.setTimeout(waitForLoad, 1000);
                }

            };
            window.setTimeout(waitForLoad, 1000);

        }
        else
        {




            $('.idtrees').
                    on("check_node.jstree", function(e, data)
            {

                e.preventDefault();

                var inst = data.instance;
                if (data.selected.length)
                {
                    var node = inst.get_node(data.selected[0]);

                    if (inst.get_parent(node) === '#' && node.children.length === 0)
                            //  && inst.get_children_dom(node).length === 0)
                            {

                                getChildrenNodes(e, data, theInstance, true);
                            }
                    else
                    {
                        inst.open_node(data.node);
                        var childrens = inst.get_children_dom(data.node);
                        for (var i = 0; i < childrens.length; i++)
                        {

                            inst.open_node(childrens[i]);

                        }
                    }
                }
            }


            ).
                    on("uncheck_node.jstree", function(e, data)
            {
                e.preventDefault();

                var inst = data.instance;

                var childrens = inst.get_children_dom(data.node);
                for (var i = 0; i < childrens.length; i++)
                {


                    inst.close_node(childrens[i]);

                }
                inst.close_node(data.node);
            }

            )

                    .jstree({
                'core': {check_callback: true
                            //,expand_selected_onload: true

                },
                "checkbox": {
                    keep_selected_style: false,
                    tie_selection: false,
                    whole_node: true},
                /*
                 "types" : {
                 "default" : {
                 "icon" : "treegrid-expander-expanded treegrid-expander-collapsed"
                 },
                 "idtrees" : {
                 "icon" : "treegrid-expander-expanded treegrid-expander-collapsed"
                 }
                 },
                 */
                //, "contextmenu","search", , "unique", 
                "plugins": ["dnd", "types", "wholerow", "sort", "state", "checkbox"]
            })

                    ;


        }


    }

    function fnExcelReport(e)
    {
        var tab_text = "<table><thead><tr>";
        var table = $(e.target).closest('table');
        tab_text += $('th', table).closest('tr')[0].innerHTML + "</tr></thead><tbody>";

        $('td', table).has(':checkbox:checked').closest('tr')
                .each(function() {
            var row = $(this);



            //row[0].innerHTML;
            tab_text = tab_text + '<tr>' + row[0].innerHTML;
            tab_text = tab_text + "</tr>";
        });
        tab_text += "</tbody></table>";


        window.open('data:text/html;charset=utf-8,' + encodeURIComponent(tab_text));

        e.preventDefault();



    }


    function downloadInnerHtml(htmls, filename, mimeType) {

        var link = document.createElement('a');
        mimeType = mimeType || 'text/plain';
        link.setAttribute('download', filename);
        link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(htmls));
        link.click();
    }

    function fnTextReport(e)
    {
        var tab_text = "";
        var table = $(e.target).closest('table');


        $('td', table).has(':checkbox:checked').closest('tr').find('td:last')
                .each(function() {
            var row = $(this);


            console.log(row[0].innerHTML);
            //row[0].innerHTML;
            tab_text = tab_text + row[0].innerHTML + "<br></br>";

        });
        //  downloadInnerHtml(tab_text,'solrExport.html', 'text/html');


        window.open('data:text/html;charset=utf-8,' + encodeURIComponent(tab_text), "export");

        e.preventDefault();
        // return false;

    }

})(jQuery);