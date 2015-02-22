/**
 * Created by jerek0 on 08/02/2015.
 */
var CustomEventDispatcher = require('../events/CustomEventDispatcher');

/**
 * Page class *
 * 
 * Each of the pages will inherit from this *
 * Pages also need to inherit CustomEventDispatcher to allow them to dial with the PageManager *
 * @constructor
 */
var Page = function() {
    this.templateUrl = '';
}
// Héritage de CustomEventDispatcher
Page.prototype = new CustomEventDispatcher();
Page.prototype.constructor = Page;

/**
 * Change the HTML template file URL *
 * @param value
 */
Page.prototype.setTemplateUrl = function(value) {
    this.templateUrl = value;
    this.loadTemplate();
}

/**
 * Loads templateUrl with an XHR Ajax request and wait for it's response *
 */
Page.prototype.loadTemplate = function() {
    var scope = this;
    var xmlhttp;

    if(window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.open('GET', this.templateUrl, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                scope.dispatchEvent({ type: 'templateLoaded', data: xmlhttp.response });
            } else if(xmlhttp.status == 404) {
                alert('404 : Template not found');
            } else {
                alert('Error : '+xmlhttp.status);
            }
        }
    }
};

/**
 * This will be called on each page changement *
 * Need to be overriden when a page uses eventListeners *
 */
Page.prototype.unbindUiActions = function() {
    // Function to override !
};

module.exports = Page;