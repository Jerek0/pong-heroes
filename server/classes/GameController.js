/**
 * Created by jerek0 on 12/02/2015.
 */
    
// Une instance par paire desktop / mobile
var GameController = function(io) {
    this.io = io;
    
    // TODO Manage character choosing and game launch
    
    this.init = function(gameID) {
        this.gameID = gameID;
    };

    this.setHost = function(socket) {
        this.host = socket;
    };

    this.setClient = function(socket) {
        if(!this.client) {
            this.client = socket;

            // Inform everyone in the room that there is a new connection between them
            this.io.sockets.in(this.gameID).emit('newBridge');

            this.client.emit('connected', { gameID: this.gameID });
            
            return true;
        } else {
            return false;
        }
    };
    
    this.removeClient = function() {
        this.client = null;
    };
    
    this.expulse = function() {
        this.io.sockets.in(this.gameID).emit('expulsed');
    }
    
    this.getHost = function() {
        return this.host;
    }
    this.getClient = function() {
        return this.client;
    }
};

module.exports = GameController;