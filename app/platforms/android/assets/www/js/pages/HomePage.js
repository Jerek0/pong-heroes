/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

var HomePage = function() {
    this.addEventListener('templateLoaded', this.onPageDisplayed.bind(this));
    this.setTemplateUrl('templates/home.html');
}
// Héritage de Page
HomePage.prototype = new Page();
HomePage.prototype.constructor = HomePage;

HomePage.prototype.onPageDisplayed = function() {
    console.log('HomePage template displayed');
    this.removeEventListener('templateLoaded', this.onPageDisplayed.bind(this));
}

module.exports = HomePage;