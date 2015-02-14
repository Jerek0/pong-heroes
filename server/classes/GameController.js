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

GameController.prototype.setHost = function(socket) {
    var scope = this;
    
    this.host = {
        socket: socket
    };
};

GameController.prototype.setClient = function(socket) {
    var scope = this;
    
    if(!this.client.socket) {
        this.client = {
            socket: socket,
            character: null
        };

        // Inform everyone in the room that there is a new connection between them
        this.io.sockets.in(this.gameID).emit('newBridge');

        this.client.socket.emit('connected', { gameID: this.gameID });

        return true;
    } else {
        return false;
    }
};

GameController.prototype.removeClient = function() {
    this.client.socket = null;
};

GameController.prototype.expulse = function() {
    this.io.sockets.in(this.gameID).emit('expulsed');
};

GameController.prototype.getHost = function() {
    return this.host.socket;
};

GameController.prototype.getClient = function() {
    return this.client.socket;
};

module.exports = GameController;