/**
 * Created by jerek0 on 15/02/2015.
 */

/**
 * GYROSCOPIC MANAGER
 * 
 * Allows to control a racket with a gyroscopic sensor *
 *  
 * @param racket
 * @constructor
 */
var GyroManager = function(racket) {
    this.racket = racket;

    this.lastPowerLaunch = Date.now();
    
    // HANDLERS 
    this.bindOrientationHandler = this.bindOrientation.bind(this);
    this.bindMotionHandler = this.bindMotion.bind(this);
    
    // Listeners
    window.addEventListener("deviceorientation", this.bindOrientationHandler);
    window.addEventListener("devicemotion", this.bindMotionHandler);

    requestAnimationFrame(this.update.bind(this));
};

/**
 * Managing the orientation of the device* 
 * @param e
 */
GyroManager.prototype.bindOrientation = function (e) {
    
    var gamma = e.gamma + 20; // -20 allows to play a little bended towards the player
    var percentage = 1 * gamma / -20; // Get the percentage of bending (max: -20, min: 20)
    
    if(percentage > 1) percentage = 1; // Can't go over 100%
    else if( percentage < -1) percentage = -1; // Can't go under -100%
    
    // Move the racket
    this.racket.position.deltaY += this.racket.acceleration * 4 * percentage;
};

/**
 * Managing the acceleration of the device *
 * @param e
 */
GyroManager.prototype.bindMotion = function (e) {
    if(((Date.now() - this.lastPowerLaunch) > 3000) && (e.acceleration.z > 5 || e.acceleration.z < -5)) {
        this.racket.firstPower();
        this.lastPowerLaunch = Date.now();
    }
};

/**
 * Main loop*
 */
GyroManager.prototype.update = function () {
    // TODO - See if it's usefull ?
    requestAnimationFrame(this.update.bind(this));
};

/**
 * Allowing to avoid listeners duplications issues *
 */
GyroManager.prototype.onDestroy = function () {
    window.removeEventListener("deviceorientation", this.bindOrientationHandler);
    window.removeEventListener("devicemotion", this.bindMotionHandler);
};

module.exports = GyroManager;