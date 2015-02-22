/**
 * Created by jerek0 on 15/02/2015.
 * 
 * This class allows to make clients and hosts communicate directly
 */

var PlayerDialer = function(socket) {
    this.socket = socket;
};

PlayerDialer.prototype.transmitMessage = function (event, data) {
    this.socket.emit(event, data);
};

module.exports = PlayerDialer;