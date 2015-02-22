/**
 * Created by jerek0 on 08/02/2015.
 */

var HomePage = require('./HomePage');
var TechnoPage = require('./TechnoPage');
var MatchmakingPage = require('./MatchmakingPage');
var ChooseCharacterPage = require('./ChooseCharacterPage');
var GamePage = require('./GamePage');

/**
 * This is the page manager *
 * Here we manage the pages, the transitions and the routing, manually *
 * @param pageContainer - We have to give the DOM element in which we are going to put our pages
 * @constructor
 */
var PageManager = function(pageContainer) {
    this.pageContainer = pageContainer;
    this.changePage('HomePage');

    // Start listening for any request to change the page
    global.serverDialer.addEventListener('changePage', this.onChangePageHandler);
};

/**
 * This one allows to go from one page to another *
 * 
 * This function also manage the transition between pages and the unbinding of the pages listeners *
 * In case of a GamePage, we change the canvas state (which is behind) *
 * @param newPage
 */
PageManager.prototype.changePage = function(newPage) {
    var scope = this;
    
    // Function handlers
    this.onTemplateLoadedHandler = this.onTemplateLoaded.bind(this);
    this.onChangePageHandler = this.onChangePage.bind(this);
    
    // If there was already a page before we wanted to change, we unbind every listener
    if(this.currentPage) {
        this.currentPage.unbindUiActions();

        // If the last page was a GamePage, we put the canvas in "Idle" state
        if(this.currentPage instanceof GamePage) global.gameEngine.rendererController.setState('idle');
    }

    // The actual page switching
    // We need to add any new pages here because of a browserify issue
    switch (newPage) {
        case "HomePage":
            this.currentPage = new HomePage();
            break;
        case "TechnoPage":
            this.currentPage = new TechnoPage();
            break;
        case "MatchmakingPage":
            this.currentPage = new MatchmakingPage();
            break;
        case "ChooseCharacterPage":
            this.currentPage = new ChooseCharacterPage();
            break;
        case "GamePage":
            this.currentPage = new GamePage();
            break;
        default:
            this.currentPage = new HomePage();
    }
    
    // Once we changed the page, we wait for it's template loading and for any request to change page again
    this.currentPage.addEventListener('templateLoaded', this.onTemplateLoadedHandler);
    this.currentPage.addEventListener('changePage', this.onChangePageHandler);
};

/**
 * Function called when a page changement is requested *
 * @param e
 */
PageManager.prototype.onChangePage = function (e) {
    this.changePage(e.newPage);
    //console.log('changingpage');
    this.currentPage.removeEventListener('changePage', this.onChangePageHandler);
};

/**
 * Function called when the XHR request loaded the HTML template and is ready to show *
 * @param e
 */
PageManager.prototype.onTemplateLoaded = function(e) {
    this.updateView(e.data);
    this.currentPage.removeEventListener('templateLoaded', this.onTemplateLoadedHandler);
};

/**
 * Modifies the current template to put the currentPage's one *
 * @param template
 */
PageManager.prototype.updateView = function(template) {
    this.pageContainer.classList.remove('bounceIn');
    
    var scope = this;
    setTimeout(function() {
        scope.pageContainer.innerHTML = template;
        scope.pageContainer.classList.add('bounceIn');
        scope.currentPage.dispatchEvent({ type: 'pageDisplayed' });
    }, 50);
};

module.exports = PageManager;