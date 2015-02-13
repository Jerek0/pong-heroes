/**
 * Created by jerek0 on 12/02/2015.
 */
    
// Une instance par paire desktop / mobile
var GameController = function(io) {
    this.io = io;
    
    var scope = this;
    
    // TODO Manage character choosing and game launch
    
    this.init = function(gameID) {
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

    this.setHost = function(socket) {
        this.host = {
            socket: socket
        };
        
        // LISTEN FOR HOST CHOOSING CHARACTER
        this.host.socket.on('chooseCharacter', function(data) {
            scope.host.character = data.characterID;
            if(scope.client.socket) scope.client.socket.emit('otherPlayerReady');
        })
    };

    this.setClient = function(socket) {
        if(!this.client.socket) {
            this.client = {
                socket: socket,
                character: null
            };

            // Inform everyone in the room that there is a new connection between them
            this.io.sockets.in(this.gameID).emit('newBridge');

            this.client.socket.emit('connected', { gameID: this.gameID });

            // LISTEN FOR CLIENT CHOOSING CHARACTER
            this.client.socket.on('chooseCharacter', function(data) {
                scope.client.character = data.characterID;
                if(scope.host.socket) scope.host.socket.emit('otherPlayerReady');
            });
            
            return true;
        } else {
            return false;
        }
    };
    
    this.removeClient = function() {
        this.client.socket = null;
    };
    
    this.expulse = function() {
        this.io.sockets.in(this.gameID).emit('expulsed');
    }
    
    this.getHost = function() {
        return this.host.socket;
    }
    this.getClient = function() {
        return this.client.socket;
    }
};

module.exports = GameController;