/**
 * Created by jerek0 on 10/02/2015.
 */
    
var CustomEventDispatcher = require('../events/CustomEventDispatcher');
var serverConfig = require('./serverConfig');

var ServerDialer = function() {
    this.init();
}
// Héritage de CustomEventDispatcher
ServerDialer.prototype = new CustomEventDispatcher();
ServerDialer.prototype.constructor = ServerDialer;

ServerDialer.prototype.init =  function() {
    this.socket = io.connect('http://'+serverConfig.url+':'+serverConfig.port);
    
    var scope = this;
    this.socket
        .on('connect', function() {
            console.log('connectedToServer');
            scope.dispatchEvent({ type: 'connectedToServer'});
        })
        .on('connect_error', function(data) {
            alert(JSON.stringify(data));
            console.log(data);
        });
    
    this.bindServerEvents();
};

ServerDialer.prototype.askForRooms = function() {
    var scope = this;
    this.socket.emit('getRooms');
    this.socket.on('rooms', function(data) {
       scope.dispatchEvent({ type: 'receivedRooms', data: data.rooms});
    });
};

ServerDialer.prototype.newHost = function() {
    this.socket.emit('newHosting');
};

ServerDialer.prototype.newJoin = function(id) {
    this.socket.emit('joinHosting', { gameID: id});
    console.log('Joining '+id);
    this.gameID = id;
};

ServerDialer.prototype.onNewGameID = function(data) {
    console.log('Received game id '+data.gameID);
    this.gameID = data.gameID;
};

ServerDialer.prototype.onNewBridge = function() {
    console.log('connection established');
};

ServerDialer.prototype.bindServerEvents = function() {
    var scope = this;
    this.socket.on('newGameID', function(data) {
        scope.onNewGameID(data);
    });
    this.socket.on('newBridge', function() {
        console.log('newBridge');
        scope.onNewBridge();
    });
};

module.exports = ServerDialer;