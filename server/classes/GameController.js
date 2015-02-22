/**
 * Created by jerek0 on 12/02/2015.
 */
var PlayerDialer = require('./PlayerDialer');
    
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
        scope.bindRequests();
        scope.io.sockets.in(scope.gameID).emit('launchGame');
    }, 1000);
};

GameController.prototype.bindRequests = function() {
    var scope = this;
    
    // ##### FROM HOST TO CLIENT
    this.clientDialer = new PlayerDialer(this.client.socket);
    
    // Function called when a socket from host to client is received
    this.transmitMessageClientHandler = function(data) {
        scope.clientDialer.transmitMessage(data.event, data);
    }
    
    this.host.socket.on('addBall', this.transmitMessageClientHandler);
    this.host.socket.on('removeBall', this.transmitMessageClientHandler);
    this.host.socket.on('updateBall', this.transmitMessageClientHandler);
    this.host.socket.on('addPlayer', this.transmitMessageClientHandler);
    this.host.socket.on('updatePlayer', this.transmitMessageClientHandler);
    this.host.socket.on('scored', this.transmitMessageClientHandler);

    // ##### FROM CLIENT TO HOST
    this.hostDialer = new PlayerDialer(this.host.socket);

    // Function called when a socket from client to host is received
    this.transmitMessageHostHandler = function(data) {
        scope.hostDialer.transmitMessage(data.event, data);
    }

    this.client.socket.on('addBall', this.transmitMessageHostHandler);
    this.client.socket.on('addPlayer', this.transmitMessageHostHandler);
    this.client.socket.on('updatePlayer', this.transmitMessageHostHandler);
    this.client.socket.on('updateBall', this.transmitMessageHostHandler);
};

GameController.prototype.unbindRequests = function() {
    if(this.transmitMessageClientHandler && this.transmitMessageHostHandler) {
        this.host.socket.removeListener('addBall', this.transmitMessageClientHandler);
        this.host.socket.removeListener('removeBall', this.transmitMessageClientHandler);
        this.host.socket.removeListener('updateBall', this.transmitMessageClientHandler);
        this.host.socket.removeListener('addPlayer', this.transmitMessageClientHandler);
        this.host.socket.removeListener('updatePlayer', this.transmitMessageClientHandler);
        this.host.socket.removeListener('scored', this.transmitMessageClientHandler);

        this.client.socket.removeListener('addBall', this.transmitMessageHostHandler);
        this.client.socket.removeListener('addPlayer', this.transmitMessageHostHandler);
        this.client.socket.removeListener('updatePlayer', this.transmitMessageHostHandler);
        this.client.socket.removeListener('updateBall', this.transmitMessageHostHandler);
    }
};

GameController.prototype.expulse = function() {
    this.io.sockets.in(this.gameID).emit('expulsed');
};

GameController.prototype.close = function() {
    this.expulse();
    this.unbindRequests();
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