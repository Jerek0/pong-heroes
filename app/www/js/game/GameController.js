/**
 * Created by jerek0 on 14/02/2015.
 */
var StateController = require('./StateController');

var GameController = function () {
    this.stage = new PIXI.Stage(0xFF0000);
};
GameController.prototype = StateController;
GameController.prototype.constructor = GameController;

module.exports = GameController;