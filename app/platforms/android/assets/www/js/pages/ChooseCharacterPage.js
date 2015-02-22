/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

/**
 * CHOOSE CHARACTER PAGE * 
 * 
 * Here the user decides which character he want's to play by clicking on it's picture *
 * @constructor
 */
var ChooseCharacter = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    this.chooseCharacterHandler = this.chooseCharacter.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/choose_character.html');
};

// Héritage de Page
ChooseCharacter.prototype = new Page();
ChooseCharacter.prototype.constructor = ChooseCharacter;

/**
 *  Function called when the markup has been loaded and displayed *
 */
ChooseCharacter.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);

    // TODO Watch Memory Here
    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'TechnoPage' });
        global.serverDialer.leaveRoom();
    });
    
    this.bindUiActions();
};

/**
 * Bind User Interface Actions * 
 */
ChooseCharacter.prototype.bindUiActions = function() {
    this.registerCharacterChoosing();  
};

/**
 * Unbind User Interface Actions *
 */
ChooseCharacter.prototype.unbindUiActions = function() {
    this.destroyCharacterChoosing();
};

/**
 * Function listening for all the characters pictures, waiting for clicks *
 */
ChooseCharacter.prototype.registerCharacterChoosing = function() {
    this.characters = document.querySelectorAll('#characters-list .character');

    var i;
    for(i = 0; i < this.characters.length; i++) {
        this.characters[i].addEventListener('click', this.chooseCharacterHandler);
    }
};

/**
 * Removes the character's pictures listeners *
 */
ChooseCharacter.prototype.destroyCharacterChoosing = function() {
    var i;
    for(i = 0; i < this.characters.length; i++) {
        this.characters[i].removeEventListener('click', this.chooseCharacterHandler);
    }
};

/**
 * Function called when a character is choosed by a click on it's picture *
 * Leads to Matchmaking Page *
 * @param e
 */
ChooseCharacter.prototype.chooseCharacter = function(e) {
    console.log(e);
    localStorage.setItem('PH-character', e.target.dataset.character);
    this.dispatchEvent({ type: "changePage", newPage: "MatchmakingPage" });
};

module.exports = ChooseCharacter;