/**
 * Created by jerek0 on 12/02/2015.
 */
    
// Une instance par paire desktop / mobile
var GameController = function(io) {
    this.io = io;
}

GameController.prototype.init = function(gameID) {
    this.gameID = gameID;

    this.client = {
        socket: null,
        character: null
    };
    this.host = {
        socket: null,
        character: null
    };
};

GameController.prototype.setHost = function(socket, character) {
    this.host = {
        socket: socket,
        character: character
    };
};

GameController.prototype.setClient = function(socket, character) {
    if(!this.client.socket) {
        this.client = {
            socket: socket,
            character: character
        };

        this.client.socket.emit('connected', { gameID: this.gameID });

        // Inform everyone in the room that there is a new connection between them
        this.io.sockets.in(this.gameID).emit('newBridge');
        
        this.launchGame();

        return true;
    } else {
        return false;
    }
};

GameController.prototype.launchGame = function () {
    var scope = this;
    
    setTimeout(function() {
        scope.io.sockets.in(scope.gameID).emit('launchGame');
    }, 1000);
};

GameController.prototype.expulse = function() {
    this.io.sockets.in(this.gameID).emit('expulsed');
};

GameController.prototype.close = function() {
    this.expulse();
    this.client.socket = null;
    this.host.socket = null;
}

GameController.prototype.getHost = function() {
    return this.host.socket;
};

GameController.prototype.getClient = function() {
    return this.client.socket;
};

module.exports = GameController;