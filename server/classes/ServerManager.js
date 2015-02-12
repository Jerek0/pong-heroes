/**
 * Created by jerek0 on 12/02/2015.
 */
var GameController = require('./GameController');

var ServerManager = {

    /**
     * Array containing every game controller we have to manage *
     * Each game controller key is it's gameID *
     */
    gameControllers: [],

    /**
     * Array containing all the available rooms' IDs *
     */
    playableRooms: [],

    /**
     * Connection w/ the server *
     */
    io: null,

    /**
     * Allows to launch the ServerManager *
     */
    init: function(io) {
        
        this.io = io;

        // Check for connection
        this.io.sockets.on('connection', this.onNewConnection.bind(this));

        // Log the launch
        this.log('Inited ServerManager');
    },

    /**
     * Manage every new connection and its requests *
     * @param socket - The new connection's socket
     */
    onNewConnection: function(socket) {
        var scope = this;
        this.log('Connection attempt');

        socket.on('hostRoom', function() {
            scope.hostRoom(socket);
        });

        socket.on('joinRoom', function(data) {
            scope.joinRoom(socket, data)
        });

        socket.on('getRooms', function() {
            scope.getRooms(socket);
        });

        socket.on('leaveRoom', function() {
            if(socket.gameID)
                scope.leaveRoom(socket);
        })

        socket.on('disconnect', function() {
            scope.log('Someone disconnected');

            if(socket.gameID)
                scope.leaveRoom(socket);
        });
    },

    /**
     * Method allowing to delete a room from the list *
     * @param gameID
     */
    deleteRoom: function(gameID) {
        for(var i=0; i<this.playableRooms.length; i++) { // We search for the room
            if(this.playableRooms[i]==gameID) { // Got the room !
                this.playableRooms.splice(i,1); // We remove the room from the available rooms list
                this.leaveRoom(this.gameControllers[gameID].getClient()); // We remove the clients links w/ the room
                this.gameControllers[gameID].expulse(); // We expulse the clients and notify them
                this.gameControllers[gameID] = null; // We remove the room controller definitely
                this.log("Deleted room "+gameID); // We log the server
            }
        }
    },

    /**
     * Method allowing the socket to leave it's current room *
     * @param socket
     */
    leaveRoom: function(socket) {
        if(socket && this.gameControllers[socket.gameID]) {
            socket.leave(socket.gameID); // We cut off the link w/ the room
            this.gameControllers[socket.gameID].removeClient(); // It's either the host, either the client that quits, in any case, the client is removed from the gameController
            if (this.io.sockets.adapter.rooms[socket.gameID] == undefined || socket == this.gameControllers[socket.gameID].getHost()) {
                this.deleteRoom(socket.gameID); // We remove the room
            }
            this.log("Leaving room " + socket.gameID); // We log the server
            socket.gameID = null; // The socket no longer has a room ID
        }
    },

    /**
     * Returns all available rooms to the given socket *
     * @param socket
     */
    getRooms: function(socket) {
        this.log('Rooms asked');

        socket.emit('rooms', {rooms: this.playableRooms});
    },

    /**
     * Set the given socket as a new host *
     * @param socket
     */
    hostRoom: function(socket) {
        this.log('Host attempt');
        
        // Generate a random gameID
        socket.gameID = Math.round((Math.random() * 1000));

        // Checks if the room already exists
        if(this.io.sockets.adapter.rooms[socket.gameID]==undefined) {
            console.log("Room created with ID "+socket.gameID);
            this.playableRooms.push(socket.gameID);

            // Inform client of the room ID and Join this room
            socket.emit('newGameID', {gameID: socket.gameID});
            socket.join(socket.gameID);

            // New instance of game
            this.gameControllers[socket.gameID] = new GameController(this.io);
            this.gameControllers[socket.gameID].init(socket.gameID);
            this.gameControllers[socket.gameID].setHost(socket);
        } else { // If so, try another one
            this.log("Room "+socket.gameID+" already set, trying another one");
            this.hostRoom(socket);
        }

    },

    /**
     * Link the given socket to a game *
     * @param socket
     * @param data - Parameters like gameID
     */
    joinRoom: function(socket, data) {
        socket.gameID = data.gameID;
        // Get the room
        socket.room = this.io.sockets.adapter.rooms[socket.gameID];

        // Check if the room exists
        if(socket.room!=undefined) {
            socket.join(socket.gameID);
            if(this.gameControllers[socket.gameID].setClient(socket)) {
                this.log('Join attempt on game '+data.gameID+' is a success');
            } else {
                socket.leave(socket.gameID);
                this.log('Join attempt on game '+data.gameID+' is a fail - Client already set');
            }
        } else {
            this.log('Join attempt on game '+data.gameID+' is a fail - Room doesnt exists');
        }
    },

    /**
     * Allows the server to log a given message (data) *
     * @param data
     */
    log: function(data) {
        console.log("["+Date()+"] "+data);
    }
}

module.exports = ServerManager;