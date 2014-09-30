# SolrJS

SolrJS is a self contain Java Script html5 library for creating user interfaces to [Apache Solr].
the application can also be deploy as WAR file in any J2EE web container using Maven.

this application is originally fork from https://github.com/evolvingweb/ajax-solr/
In addition features provided by reuter example,
	*It provide simple and advanced search function for Apache Solr application.
	*It provide a table view of search result.
	*All columns that have matching search text will automatically highlighted, sorted and show in left most columns in the table.
		rest of columns will be sort alphabetically.
	*Individual row could further show in pop up document view when clicked. only applicable fields for the row will be 
		show in pop up document view.
	*It provide check box to turn on/off facet view.
	*Configurable facet fields- Automatic create and show facet navigation view base on facet fields configuration. 
	*Handle embedded hyper link content column in the table. content that starts with "http" will be handle as a link.
		handled contents include wave file, image file, and html file.
	*embedded facet link in the table header. 
	*added function to show/hide columns in a table.
	*added export data as csv/excel function. 
	*added offline helpful page to solr query syntax page. 
	*handled highlight text in search result, where solr highlight failed due to long text fields.

following fields can be change to  fit your configuration:

solr_ui.js ALLSolrURL:  URL of your solr server instance.
solr_ui.js facetFields:  facet fields your application want to focus on.
solr_ui.js  proxyURL:  proxy server url. this is needed for export of csv/excel function to work. currently comment out
						to run as pure html5 application. uncomment this to support proxy and export function.
						
						


