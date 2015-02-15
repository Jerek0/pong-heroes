/**
 * Created by jerek0 on 15/02/2015.
 */

var ClientDialer = function(socket) {
    this.socket = socket;
};

ClientDialer.prototype.addBall = function (data) {
    this.socket.emit('addBall', data);
};

ClientDialer.prototype.updateBall = function (data) {
    this.socket.emit('updateBall', data);
};

module.exports = ClientDialer;