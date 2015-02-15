/**
 * Created by jerek0 on 15/02/2015.
 */

var PlayerDialer = function(socket) {
    this.socket = socket;
};

PlayerDialer.prototype.transmitMessage = function (event, data) {
    this.socket.emit(event, data);
};

module.exports = PlayerDialer;