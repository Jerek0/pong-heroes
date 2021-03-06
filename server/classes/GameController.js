/**
 * Created by jerek0 on 12/02/2015.
 */
var PlayerDialer = require('./PlayerDialer');

/**
 * Reroutage des requetes inGame
 * Une instance par paire desktop / mobile
 */
var GameController = function(io) {
    this.io = io;
}

/**
 * We initialize the GameController with it's gameID and empty client and host *
 * @param gameID
 */
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

/**
 * Method allowing to assign a socket and a character ID to the host *
 * @param socket
 * @param character
 */
GameController.prototype.setHost = function(socket, character) {
    this.host = {
        socket: socket,
        character: character
    };
};

/**
 * Method allowing to assign a socket and a characater ID to the client *
 * Also allows to notify the client that he's connected and every others aswell *
 * @param socket
 * @param character
 * @returns {boolean}
 */
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

/**
 * Method allowing to launch the game after a small delay of 1sec *
 */
GameController.prototype.launchGame = function () {
    var scope = this;
    
    setTimeout(function() {
        scope.bindRequests();
        scope.io.sockets.in(scope.gameID).emit('launchGame');
    }, 1000);
};

/**
 * Here, we receive all the current game requests, coming from the host and from the client *
 * We get the datas and transmit them from host to client and from client to host *
 */
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

/**
 * The method bindRequests above implies that we remove every existing socket listener *
 * This allows to prevent some sockets duplications issues *
 */
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

/**
 * This method notifies everyone in the game that they're out * 
 */
GameController.prototype.expulse = function() {
    this.io.sockets.in(this.gameID).emit('expulsed');
};

/**
 * Method called when the server decides to stop this game * 
 */
GameController.prototype.close = function() {
    this.expulse();
    this.unbindRequests();
    this.client.socket = null;
    this.host.socket = null;
}

/**
 * Returns this game's host * 
 * @returns {null}
 */
GameController.prototype.getHost = function() {
    return this.host.socket;
};

/**
 * Returns this game's client *
 * @returns {null}
 */
GameController.prototype.getClient = function() {
    return this.client.socket;
};

module.exports = GameController;