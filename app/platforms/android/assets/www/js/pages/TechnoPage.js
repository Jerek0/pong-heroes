/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

/**
 * TECHNO PAGE *
 * 
 * Here the user decides of the technology he will use to play *
 * We store that information in the localStorage to use it later *
 * @constructor
 */
var TechnoPage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    
    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/techno.html');
};

// Héritage de Page
TechnoPage.prototype = new Page();
TechnoPage.prototype.constructor = TechnoPage;

/**
 * Function called when the markup has been loaded and displayed *
 */
TechnoPage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);
    
    this.bindUiEvents();
};

/**
 * Event listeners management *
 */
TechnoPage.prototype.bindUiEvents = function() {
    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'HomePage' });
    });
    
    this.registerTechnoChoosing();
};

/**
 * Here we listen for all the tech buttons in the markup *
 */
TechnoPage.prototype.registerTechnoChoosing = function() {
    this.chooseTechnoHandler = this.chooseTechno.bind(this);
    
    // Listen to every technoChooser
    this.technoChoosers = document.querySelectorAll('.enabled .techno-chooser');
    var numberOfTechnos = this.technoChoosers.length;
    var i;
    for(i = 0; i < numberOfTechnos; i++) {
        this.technoChoosers[i].addEventListener('click', this.chooseTechnoHandler);
    }
};

/**
 * Destroy the tech button's listeners * 
 */
TechnoPage.prototype.destroyTechnoChoosing = function() {
    var numberOfTechnos = this.technoChoosers.length;
    var i;
    for(i = 0; i < numberOfTechnos; i++) {
        this.technoChoosers[i].removeEventListener('click', this.chooseTechnoHandler);
    }
};

/**
 * Function called when a tech is choosed by clicking on it's button *
 * Lead to the ChooseCharacterPage *
 * @param e
 */
TechnoPage.prototype.chooseTechno = function(e) {
    console.log(e);
    localStorage.setItem('PH-tech', e.target.dataset.tech);
    this.destroyTechnoChoosing();
    this.dispatchEvent({ type: 'changePage', newPage: 'ChooseCharacterPage' });
};

module.exports = TechnoPage;