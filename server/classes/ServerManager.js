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

        socket.on('hostRoom', function(data) {
            scope.hostRoom(socket, data);
        });

        socket.on('joinRoom', function(data) {
            scope.joinRoom(socket, data)
        });

        socket.on('getRooms', function() {
            scope.getRooms(socket);
        });

        socket.on('leaveRoom', function() {
            if(socket.gameID)
                scope.deleteRoom(socket.gameID);
        })

        socket.on('disconnect', function() {
            scope.log('Someone disconnected');

            if(socket.gameID)
                scope.deleteRoom(socket.gameID);
        });
    },

    /**
     * Method allowing to delete a room from the list and expulse participants of it *
     * @param gameID
     */
    deleteRoom: function(gameID) {
        for(var i=0; i<this.playableRooms.length; i++) { // We search for the room
            if(this.playableRooms[i]==gameID) { // Got the room !
                
                // WE STORE THE GAME PARTICIPANTS
                var client = this.gameControllers[gameID].getClient();
                var host = this.gameControllers[gameID].getHost();
                
                // WE CLOSE THE GAME CONTROLLER AND REMOVE THE ROOM FROM THE PLAYABLE ROOMS
                this.playableRooms.splice(i,1); // We remove the room from the available rooms list
                this.gameControllers[gameID].close(); // We stop the gameController and expulse it's members
                
                // WE MAKE EVERYONE LEAVE THE ROOM AND REMOVE THE GAME CONTROLLER
                // This is done after game controller closing because they're notified of the expulsion via the server room
                this.leaveRoom(client);
                this.leaveRoom(host);
                this.gameControllers[gameID] = null; // We remove the room controller definitely
                this.log("Deleted room "+gameID); // We log the server
            }
        }
    },

    /**
     * Method allowing the socket to leave it's current server room *
     * @param socket
     */
    leaveRoom: function(socket) {
        if(socket) {
            socket.leave(socket.gameID); // We cut off the link w/ the room
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
    hostRoom: function(socket, data) {
        this.log('Host attempt');
        
        // Generate a random gameID
        socket.gameID = Math.round((Math.random() * 1000));

        // Checks if the room already exists
        if(this.io.sockets.adapter.rooms[socket.gameID]==undefined) {
            this.log("Room created with ID "+socket.gameID+" - Character: "+data.character);
            this.playableRooms.push(socket.gameID);

            // Inform client of the room ID and Join this room
            socket.emit('newGameID', {gameID: socket.gameID});
            socket.join(socket.gameID);

            // New instance of game
            this.gameControllers[socket.gameID] = new GameController(this.io);
            this.gameControllers[socket.gameID].init(socket.gameID);
            this.gameControllers[socket.gameID].setHost(socket, data.character);
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
        if(socket.room!=undefined && this.gameControllers[socket.gameID]) {
            socket.join(socket.gameID);
            if(this.gameControllers[socket.gameID].setClient(socket, data.character)) {
                this.log('Join attempt on game '+data.gameID+' is a success - Character : '+data.character);
            } else {
                socket.emit('roomFull');
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