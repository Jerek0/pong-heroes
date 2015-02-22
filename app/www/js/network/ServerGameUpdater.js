/**
 * Created by jerek0 on 14/02/2015.
 */
var CustomEventDispatcher = require('../events/CustomEventDispatcher');

/**
 * SERVER GAME UPDATER *
 * 
 * This is the second dialer with the server : in the actual game state *
 * This class sends requests to the host/client via the server and receives the host's/client's requests via the server *
 *  
 * @param socket
 * @param gameController
 * @constructor
 */
var ServerGameUpdater = function (socket, gameController) {
    this.socket = socket;
    this.gameController = gameController;
    
    this.bindServerEvents();
};
// Héritage de CustomEventDispatcher
ServerGameUpdater.prototype = new CustomEventDispatcher();
ServerGameUpdater.prototype.constructor = ServerGameUpdater;

/*
 #######################################
 ######### REQUESTS TO RECEIVE #########
 #######################################
 */

/**
 * Function managing every request that can be received *
 */
ServerGameUpdater.prototype.bindServerEvents = function () {
    var scope = this;
    
    // Handlers (necessary if we want to kill the listeners later ...)
    this.addBallHandler = function(data) { scope.gameController.addBall(data); };
    this.updateBallHandler = function(data) { scope.gameController.updateBall(data); };
    this.addPlayerHandler = function(data) { scope.gameController.addPlayer(data, false); }
    this.removeBallHandler = function(data) { scope.gameController.removeBall(data, false); };
    this.updatePlayerHandler = function(data) { scope.gameController.updatePlayer(data); };
    this.scoredHandler = function(data) { scope.gameController.onScore(data, false); };

    // Socket listeners, waiting for the other player's requests
    this.socket.on('addBall', this.addBallHandler);
    this.socket.on('updateBall', this.updateBallHandler);
    this.socket.on('addPlayer', this.addPlayerHandler);
    this.socket.on('removeBall', this.removeBallHandler);
    this.socket.on('updatePlayer', this.updatePlayerHandler);
    this.socket.on('scored', this.scoredHandler);
};

/**
 * Function allowing to kill the socket listeners, in order to avoid sockets duplications issues *
 */
ServerGameUpdater.prototype.unbindServerEvents = function () {
    this.socket.removeListener('addBall', this.addBallHandler);
    this.socket.removeListener('updateBall', this.updateBallHandler);
    this.socket.removeListener('addPlayer', this.addPlayerHandler);
    this.socket.removeListener('removeBall', this.removeBallHandler);
    this.socket.removeListener('updatePlayer', this.updatePlayerHandler);
    this.socket.removeListener('scored', this.scoredHandler);
};

/* 
   #######################################
   ######### REQUESTS TO SEND ############
   #######################################
   
   Every function below needs to specify the request name for the server to be able to
   treat every request the same way
 */

ServerGameUpdater.prototype.addBall= function(data) {
    data.event = 'addBall';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.removeBall= function(data) {
    data.event = 'removeBall';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.updateBall= function(data) {
    data.event = 'updateBall';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.addPlayer = function(data) {
    data.event = 'addPlayer';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.updatePlayer = function(data) {
    data.event = 'updatePlayer';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.scored = function (data) {
    data.event = 'scored';
    this.socket.emit(data.event, data);
}

module.exports = ServerGameUpdater;