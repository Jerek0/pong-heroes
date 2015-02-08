/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');
var TestPage = require('./TestPage');

var HomePage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/home.html');
};

// Héritage de Page
HomePage.prototype = new Page();
HomePage.prototype.constructor = HomePage;

HomePage.prototype.onPageDisplayed = function() {
    console.log('HomePage template displayed');
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);
    
    var scope = this;
    var btnPlay = document.getElementById("btn-play");
    btnPlay.addEventListener('click', function() {
        console.log(TestPage);
        scope.dispatchEvent({ type: 'changePage', newPage: new TestPage() });
    });
};

module.exports = HomePage;