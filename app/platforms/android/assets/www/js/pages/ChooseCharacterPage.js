/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

var ChooseCharacter = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/choose_character.html');
};

// Héritage de Page
ChooseCharacter.prototype = new Page();
ChooseCharacter.prototype.constructor = ChooseCharacter;

ChooseCharacter.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);

    // TODO Show btn only when connected to server
    // TODO Watch Memory Here
    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'MatchmakingPage' });
        global.serverDialer.leaveRoom();
    });
};

module.exports = ChooseCharacter;