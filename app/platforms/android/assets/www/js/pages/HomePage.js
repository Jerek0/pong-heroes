/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

/**
 * HOME PAGE *
 * @constructor
 */
var HomePage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/home.html');
};
// Héritage de Page
HomePage.prototype = new Page();
HomePage.prototype.constructor = HomePage;

/**
 * Function called when the markup has been loaded and displayed *
 */
HomePage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);
    
    // TODO Show btn only when connected to server
    // TODO Watch Memory Here
    var scope = this;
    var btnPlay = document.getElementById("btn-play");
    btnPlay.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'TechnoPage' });
    });
    
    // Show the user's current highscore
    var highscores = document.getElementById("highscore");
    highscores.innerHTML = localStorage.getItem('PH-highscore') ? localStorage.getItem('PH-highscore') : 0;
};

module.exports = HomePage;