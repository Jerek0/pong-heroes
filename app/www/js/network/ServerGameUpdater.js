/**
 * Created by jerek0 on 14/02/2015.
 */
var CustomEventDispatcher = require('../events/CustomEventDispatcher');

var ServerGameUpdater = function (socket, gameController) {
    this.socket = socket;
    this.gameController = gameController;
    
    this.bindServerEvents();
};
// Héritage de CustomEventDispatcher
ServerGameUpdater.prototype = new CustomEventDispatcher();
ServerGameUpdater.prototype.constructor = ServerGameUpdater;

ServerGameUpdater.prototype.bindServerEvents = function () {
    var scope = this;
    
    this.addBallHandler = function(data) {
        scope.gameController.addBall(data);
    };
    
    this.updateBallHandler = function(data) {
        scope.gameController.updateBall(data);
    };

    this.addPlayerHandler = function(data) {
        scope.gameController.addPlayer(data, false);
    };
    
    this.removeBallHandler = function(data) {
        scope.gameController.removeBall(data, false);
    };
    
    this.updatePlayerHandler = function(data) {
        scope.gameController.updatePlayer(data);
    };
    
    this.scoredHandler = function(data) {
        scope.gameController.onScore(data, false);
    };

    this.socket.on('addBall', this.addBallHandler);
    this.socket.on('updateBall', this.updateBallHandler);
    this.socket.on('addPlayer', this.addPlayerHandler);
    this.socket.on('removeBall', this.removeBallHandler);
    this.socket.on('updatePlayer', this.updatePlayerHandler);
    this.socket.on('scored', this.scoredHandler);
};

ServerGameUpdater.prototype.unbindServerEvents = function () {
    this.socket.removeListener('addBall', this.addBallHandler);
    this.socket.removeListener('updateBall', this.updateBallHandler);
    this.socket.removeListener('addPlayer', this.addPlayerHandler);
    this.socket.removeListener('removeBall', this.removeBallHandler);
    this.socket.removeListener('updatePlayer', this.updatePlayerHandler);
    this.socket.removeListener('scored', this.scoredHandler);
};

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