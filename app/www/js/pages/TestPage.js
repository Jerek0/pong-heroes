/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');
var HomePage = require('./HomePage');

var TestPage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    
    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/test.html');
};

// Héritage de Page
TestPage.prototype = new Page();
TestPage.prototype.constructor = TestPage;

TestPage.prototype.onPageDisplayed = function() {
    console.log('TestPage template displayed');
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);

    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        console.log(HomePage);
        scope.dispatchEvent({ type: 'changePage', newPage: new HomePage() });
    });
};

module.exports = TestPage;