/**
 * Created by jerek0 on 14/02/2015.
 */
var StateController = require('./StateController');
    
var IdleController = function () {
    this.stage = new PIXI.Stage(0xFFFF00);
};
IdleController.prototype = StateController;
IdleController.prototype.constructor = IdleController;

module.exports = IdleController;