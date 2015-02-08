/**
 * Created by jerek0 on 08/02/2015.
 */

var HomePage = require('./HomePage');

var PageManager = function(pageContainer) {
    this.pageContainer = pageContainer;
    this.changePage(new HomePage());
};

PageManager.prototype.changePage = function(newPage) {
    var scope = this;
    
    // Function handlers
    this.onTemplateLoadedHandler = this.onTemplateLoaded.bind(this);
    this.onChangePageHandler = this.onChangePage.bind(this);

    this.currentPage = newPage;
    this.currentPage.addEventListener('templateLoaded', this.onTemplateLoadedHandler);
    this.currentPage.addEventListener('changePage', this.onChangePageHandler);
};

PageManager.prototype.onChangePage = function (e) {
    this.changePage(e.newPage);
    console.log('changingpage');
    this.currentPage.removeEventListener('changePage', this.onChangePageHandler);
};

PageManager.prototype.onTemplateLoaded = function(e) {
    this.updateView(e.data);
    this.currentPage.removeEventListener('templateLoaded', this.onTemplateLoadedHandler);
};

PageManager.prototype.updateView = function(template) {
    // TODO Create in/out transitions when changing page
    this.pageContainer.innerHTML = template;
    this.currentPage.dispatchEvent({ type: 'pageDisplayed' });
    console.log('Template changed !');
};

module.exports = PageManager;