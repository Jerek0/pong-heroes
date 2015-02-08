/**
 * Created by jerek0 on 08/02/2015.
 */

var HomePage = require('./HomePage');

var PageManager = function(pageContainer) {
    this.pageContainer = pageContainer;
    this.changePage(new HomePage());
}

PageManager.prototype.changePage = function(newPage) {
    var scope = this;

    this.currentPage = newPage;
    this.currentPage.addEventListener('templateLoaded', this.onPageDisplayed.bind(this));
}

PageManager.prototype.onPageDisplayed = function(e) {
    this.updateView(e.data);
    this.currentPage.removeEventListener('templateLoaded', this.onPageDisplayed.bind(this));
} 

PageManager.prototype.updateView = function(template) {
    // TODO Create in/out transitions when changing page
    this.pageContainer.innerHTML = template;
    console.log('Template changed !');
}

module.exports = PageManager;