/**
 * Created by jerek0 on 10/02/2015.
 */
// CONFIG
var jsonConfig = require('./config.json'),
    url = jsonConfig.url,
    port = jsonConfig.port;

// LOADING DEPENDENCIES
var http = require('http');
var server = http.createServer();
var io = require('socket.io')(server);

// AND LAUNCHING SERVER
server.listen(port, url, function() {
    console.log('Server launched on '+url+':'+port);
    ServerManager.init();
});


// CLASSES & CONNECTIONS

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
     * Allows to launch the ServerManager *
     */
    init: function() {

        // Check for connection
        io.sockets.on('connection', this.onNewConnection.bind(this));

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

        socket.on('newHosting', function() {
            scope.newHost(socket);
        });
        
        socket.on('joinHosting', function(data) {
            scope.newJoin(socket, data)
        });

        socket.on('getRooms', function() {
            scope.getRooms(socket);
        });

        socket.on('disconnect', function() {
            scope.log('Someone disconnected');
        });
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
    newHost: function(socket) {
        this.log('Host attempt');
        socket.gameID = Math.round((Math.random() * 1000));
        
        // Get the room
        socket.room = io.sockets.adapter.rooms[socket.gameID];

        // Checks if the room already exists
        if(socket.room==undefined) {
            console.log("Room created with ID "+socket.gameID);
            this.playableRooms.push(socket.gameID);

            // Inform client of the room ID and Join this room
            socket.emit('newGameID', {gameID: socket.gameID});
            socket.join(socket.gameID);

            // New instance of game
            this.gameControllers[socket.gameID] = new GameController();
            this.gameControllers[socket.gameID].init(socket.gameID);
            this.gameControllers[socket.gameID].setComputer(socket);
        } else { // If so, try another one
            this.log("Room "+socket.gameID+" already set, trying another one");
            this.newHost(socket);
        }

    },

    /**
     * Link the given socket to a game *
     * @param socket
     * @param data - Parameters like gameID
     */
    newJoin: function(socket, data) {
        this.log('Join attempt on game '+data.gameID);

        socket.gameID = data.gameID;
        // Get the room
        socket.room = io.sockets.adapter.rooms[socket.gameID];

        // Check if the room exists
        if(socket.room!=undefined) {
            socket.join(socket.gameID);
            this.gameControllers[socket.gameID].setMobile(socket);
        } else {
            this.log('Personne dans la room');
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

// Une instance par paire desktop / mobile
function GameController() {
    this.init = function(gameID) {
        this.gameID = gameID;
    },

    this.setComputer = function(socket) {
        this.computer = socket;
    },

    this.setMobile = function(socket) {
        var self = this;

        this.mobile = socket;

        // Inform everyone in the room that there is a new connection between them
        io.sockets.in(this.gameID).emit('newBridge');
    }
}