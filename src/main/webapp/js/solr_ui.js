var Manager;

(function($) {

    $(function() {
        Manager = new AjaxSolr.Manager({
            //main solr UrL
            ALLsolrUrl: 'http://localhost:8080/solr/example/select'
                    //uncomment this, if we want to have proxy through local web container. this is needed for
                    //export function to work.
                    //   , proxyUrl: '/SolrJS/servlets/solrRequestServer'
                    //facet fields of solr
                    , facetFields: ['source_nm', 'state_text', 'country_text', 'record_type', 'phone_text', 'account_text','money_text']
        });
        Manager.addWidget(new AjaxSolr.ResultWidget({
            id: 'result',
            target: '#docs'
        }));
        //add pager widget
        Manager.addWidget(new AjaxSolr.PagerWidget({
            id: 'pager',
            target: '#pager',
            prevLabel: '&lt;',
            nextLabel: '&gt;',
            innerWindow: 1,
            renderHeader: function(perPage, offset, total) {
                $('#pager-header').html($('<span/>').text('displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total));
            }
        }));
        //'account_text', 'phone_text', , 'city_text'
        //get all facet fields
        var fields = Manager.facetFields;

        //register all tag clouds
        for (var i = 0, l = fields.length; i < l; i++) {
            Manager.addWidget(new AjaxSolr.TagcloudWidget({
                id: fields[i],
                target: '#' + fields[i],
                field: fields[i]
            }));

            //dynamically create a html element for each tag cloud navigation
            var txt = fields[i].replace(/\_/g, ' ');
            var $label = $("<h2>", {id: fields[i] + '_label', text: 'By ' + txt});
            $("#leftColumn").append($label);
            var $div = $("<div>", {id: fields[i], class: "tagcloud"});

            $("#leftColumn").append($div);


        }









        //add year facet view to html
        var $label = $("<h2>", {id: 'year_label', text: 'By Year'});
        $("#leftColumn").append($label);
        var $div = $("<div>", {id: 'year', class: "tagcloud"});
        $("#leftColumn").append($div);

        Manager.addWidget(new AjaxSolr.DateTagcloudWidget({
            id: 'year',
            target: '#year',
            field: 'date_text'
        }));



        //add month facet view to html
        var $label = $("<h2>", {id: 'month_label', text: 'By Month'});
        $("#leftColumn").append($label);
        var $div = $("<div>", {id: 'month', class: "tagcloud"});
        $("#leftColumn").append($div);
        Manager.addWidget(new AjaxSolr.DateTagcloudWidget({
            id: 'month',
            target: '#month',
            field: 'date_text'
        }));


        Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
            id: 'currentsearch',
            target: '#selection'
        }));

        Manager.addWidget(new AjaxSolr.TextWidget({
            id: 'text',
            target: '#search'
        }));





        //add data selection/calendar view to html
        var $label = $("<h2>", {id: 'calendar_label', text: 'By Day'});
        $("#leftColumn").append($label);
        var $div = $("<div>", {id: 'calendar'});
        $("#leftColumn").append($div);
        $("#leftColumn").append($("<br>"));

        Manager.addWidget(new AjaxSolr.CalendarWidget({
            id: 'calendar',
            target: '#calendar',
            field: 'date_text'
        }));

        Manager.init();
        Manager.store.addByValue('q', '*:*');
        Manager.store.addByValue('hl', true);
        Manager.store.addByValue('hl.fl', '*');

        var params = {
            facet: true,
            'facet.field': fields,
            'facet.limit': 10,
            'facet.mincount': 1,
            'facet.date': 'date_text',
            'facet.date.start': '2000-1-1T00:00:00.000Z/MONTH',
            'facet.date.end': '2014-12-30T00:00:00.000Z/MONTH+1MONTH',
            'facet.date.gap': '+1MONTH',
            'facet.query': ['money_text:[* TO 9999]', 'money_text:[10000 TO 99999]', 'money_text:[100000 TO *]'],
            'json.nl': 'map',
            'shards.info': 'true'
        };
        //'facet.field': ['currency', 'Type_desc', 'AcType', 'caller_phone_nbr', 'called_phone_nbr',],
        //  'facet.method': 'enum',

        for (var name in params) {
            Manager.store.addByValue(name, params[name]);
        }

        //default to 15 rows
        Manager.store.addByValue("rows", 15);

        //go ahead default to hide some of column 
        //   localStorage.removeItem('dataLoaded');

        if (localStorage.getItem("dataLoaded") === null)
        {

            localStorage.setItem('dataLoaded', true);
            //hide following columns
            localStorage.setItem("SOLR_UUID", false);
            // localStorage.setItem("file", false);


        }
        //check if get url have link 
        if ($(location).attr('search').length > 1)
        {
            var sPageURL = $(location).attr('search').substring(1);
            console.log("location search: " + sPageURL);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++)
            {
                var sParameterName = sURLVariables[i].split('=');
                console.log("add by value" + sParameterName[0] + " " + sParameterName[1]);
                Manager.store.addByValue(sParameterName[0], sParameterName[1]);



            }

        }

        Manager.doRequest();
    });

    $.fn.showIf = function(condition) {
        if (condition) {
            return this.show();
        }
        else {
            return this.hide();
        }
    }

})(jQuery);

function toggleFieldView(link) {


    if (document.getElementById('advancedFieldSet').classList[0] == 'prefill') {
        document.getElementById('advancedFieldSet').classList
                .remove('prefill');
        document.getElementById('advancedFieldSet').classList
                .add('postfill');
        //document.getElementById('arrowImage').style="image-orientation: 90deg;";
        document.getElementById('arrowImage').src = "images/DownArr.png";

    } else {
        document.getElementById('advancedFieldSet').classList
                .remove('postfill');
        document.getElementById('advancedFieldSet').classList
                .add('prefill');
        //document.getElementById('arrowImage').style="image-orientation: 90deg;";
        document.getElementById('arrowImage').src = "images/SideArr.png";

    }

}
