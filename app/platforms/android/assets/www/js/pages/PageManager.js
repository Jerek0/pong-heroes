/**
 * Created by jerek0 on 08/02/2015.
 */

var HomePage = require('./HomePage');
var TestPage = require('./TechnoPage');

var PageManager = function(pageContainer) {
    this.pageContainer = pageContainer;
    this.changePage('HomePage');
};

PageManager.prototype.changePage = function(newPage) {
    var scope = this;
    
    // Function handlers
    this.onTemplateLoadedHandler = this.onTemplateLoaded.bind(this);
    this.onChangePageHandler = this.onChangePage.bind(this);

    switch (newPage) {
        case "HomePage":
            this.currentPage = new HomePage();
            break;
        case "TestPage":
            this.currentPage = new TestPage();
            break;
        default:
            this.currentPage = new HomePage();
    }
    
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