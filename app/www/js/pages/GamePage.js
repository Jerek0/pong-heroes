/**
 * Created by jerek0 on 13/02/2015.
 */

var Page = require('./Page');

var GamePage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    this.onOtherPlayerReadyHandler = this.onOtherPlayerReady.bind(this);
    this.launchGameHandler = this.launchGame.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/game.html');
};

// Héritage de Page
GamePage.prototype = new Page();
GamePage.prototype.constructor = GamePage;

GamePage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);

    // TODO Watch Memory Here
    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        //scope.dispatchEvent({ type: 'changePage', newPage: 'MatchmakingPage' });
        global.serverDialer.leaveRoom();
    });

    this.registerSync();
};

GamePage.prototype.registerSync = function() {
    if(!global.serverDialer.otherPlayerReady) {
        global.serverDialer.addEventListener('otherPlayerReady', this.onOtherPlayerReadyHandler);
    } else {
        this.onOtherPlayerReady();
    }
};

GamePage.prototype.onOtherPlayerReady = function() {
    global.serverDialer.removeEventListener('otherPlayerReady', this.onOtherPlayerReadyHandler);
    
    document.getElementById("message").innerHTML = "Synced !";
    global.serverDialer.addEventListener('launchGame', this.launchGameHandler);
};

GamePage.prototype.launchGame = function () {
    global.serverDialer.removeEventListener('launchGame', this.launchGameHandler);
    document.getElementById("message").innerHTML = "GO !";
};

GamePage.prototype.unbindUiActions = function() {
    global.serverDialer.removeEventListener('otherPlayerReady', this.onOtherPlayerReadyHandler);
    global.serverDialer.removeEventListener('launchGame', this.launchGameHandler);
};

module.exports = GamePage;
