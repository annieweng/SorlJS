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

                if (header_order == 'desc')
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
            if (currentview&& currentview !== ($("#viewButton").attr('value')))
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
            $('a.more').livequery(function() {
                $(this).toggle(function() {
                    //  $(this).siblings('span:first').hide();
                    $(this).parent().find('span').show();
                    $(this).text('hide..');
                    return false;
                }, function() {
                    //$(this).siblings('span:first').show();
                    $(this).parent().find('span').hide();
                    $(this).text('show more..');
                    return false;
                });
            });



            $('a.showDoc').livequery(function() {


                $(this).toggle(function() {

                    showDocument($(this).parent().find('span').html());

                    return false;
                }, function() {
                    showDocument($(this).parent().find('span').html());

                    return false;
                });


            });

            //update to table td checkbox to match header
            $('#selectAll').live('click', (function(e) {
                var table = $(e.target).closest('table');
                $('td input:checkbox', table).prop('checked', this.checked);
                if (this.checked === true)
                {
                    $('#actions').removeAttr("disabled");
                }
                else
                {
                    $('#actions').prop("disabled", true);
                }
            }));

            $('#actions').live('change', (function(e) {

                if (this.value === 'export')
                {
                    fnTextReport(e);

                    //fnExcelReport(e);
                }

            }));

            $("#viewButton").live('click', function() {
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


            $('a.summary').live("click", function() {



                showDocument($(this).parent().find('div').find('span').html());

                return false;

            });

        }
    });

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


                if (resizableTables != "undefined") {



                    ResizableColumns();


                } else {
                    window.setTimeout(waitForLoad, 1000);
                }

            };
            window.setTimeout(waitForLoad, 1000);

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
        console.log(tab_text);
        //test
        // tab_text="<table><thead><tr><th>header1</th><th>header2</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>"
        //  window.open('data:application/vnd.ms-excel,' +tab_text);

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