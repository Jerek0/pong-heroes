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

    this.socket.on('updatePlayer', function(data) {
        scope.gameController.updatePlayer(data);
    });
};

ServerGameUpdater.prototype.addBall= function(data) {
    this.socket.emit('addBall', data);
};

ServerGameUpdater.prototype.updateBall= function(data) {
    this.socket.emit('updateBall', data);
};

ServerGameUpdater.prototype.updatePlayer = function(data) {
    this.socket.emit('updatePlayer', data);
};

module.exports = ServerGameUpdater;