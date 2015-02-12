/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

var TechnoPage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    
    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/techno.html');
};

// Héritage de Page
TechnoPage.prototype = new Page();
TechnoPage.prototype.constructor = TechnoPage;

TechnoPage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);
    
    this.bindUiEvents();
};

TechnoPage.prototype.bindUiEvents = function() {
    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'HomePage' });
    });
    
    this.registerTechnoChoosing();
};

TechnoPage.prototype.registerTechnoChoosing = function() {
    this.chooseTechnoHandler = this.chooseTechno.bind(this);
    
    // Listen to every technoChooser
    this.technoChoosers = document.querySelectorAll('.techno-chooser');
    var numberOfTechnos = this.technoChoosers.length;
    var i;
    for(i = 0; i < numberOfTechnos; i++) {
        this.technoChoosers[i].addEventListener('click', this.chooseTechnoHandler);
    }
};

TechnoPage.prototype.destroyTechnoChoosing = function() {
    var numberOfTechnos = this.technoChoosers.length;
    var i;
    for(i = 0; i < numberOfTechnos; i++) {
        this.technoChoosers[i].removeEventListener('click', this.chooseTechnoHandler);
    }
};

TechnoPage.prototype.chooseTechno = function() {
    localStorage.setItem('PH-tech', event.target.dataset.tech);
    this.destroyTechnoChoosing();
    this.dispatchEvent({ type: 'changePage', newPage: 'MatchmakingPage' });
};

module.exports = TechnoPage;