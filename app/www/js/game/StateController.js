/**
 * Created by jerek0 on 14/02/2015.
 */

/**
 * STATE CONTROLLER
 * 
 * Each state controller must inherit this class * 
 * @* constructor
 */
var StateController = function () {
    // We put a red background by default
    this.stage = new PIXI.Stage(0x333333);
};

/**
 * Main loop of the state, to override *
 */
StateController.prototype.update = function() {
    //console.log('updating'); // This lags a lot !
};

/**
 * Function called when changing the state to prevent listeners duplication issues *
 * To override *
 */
StateController.prototype.onDestroy = function () {

};

module.exports = StateController;