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

    this.socket.on('addBall', function(data) {
        scope.gameController.addBall(data);
    });

    this.socket.on('updateBall', function(data) {
        scope.gameController.updateBall(data);
    });

    this.socket.on('addPlayer', function(data) {
        scope.gameController.addPlayer(data, false);
    });

    this.socket.on('removeBall', function(data) {
        scope.gameController.removeBall(data, false);
    });

    this.socket.on('updatePlayer', function(data) {
        scope.gameController.updatePlayer(data);
    });

    this.socket.on('scored', function(data) {
        scope.gameController.onScore(data, false);
    });
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