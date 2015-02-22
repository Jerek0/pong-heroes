/**
 * Created by jerek0 on 15/02/2015.
 */

var GyroManager = function(racket) {
    this.racket = racket;

    this.lastPowerLaunch = Date.now();
    
    // HANDLERS 
    this.bindOrientationHandler = this.bindOrientation.bind(this);
    this.bindMotionHandler = this.bindMotion.bind(this);
    
    window.addEventListener("deviceorientation", this.bindOrientationHandler);
    window.addEventListener("devicemotion", this.bindMotionHandler);

        requestAnimationFrame(this.update.bind(this));
};

GyroManager.prototype.bindOrientation = function (e) {
    var gamma = e.gamma + 20; // -20 allows to play a little bended towards the player
    //if(gamma < 2 && gamma > -2) gamma = 0;
    var percentage = 1 * gamma / -20;
    
    if(percentage > 1) percentage = 1;
    else if( percentage < -1) percentage = -1;
    
    console.log(percentage);
    
    this.racket.position.deltaY += this.racket.acceleration * 4 * percentage;
};

GyroManager.prototype.bindMotion = function (e) {
    if(((Date.now() - this.lastPowerLaunch) > 3000) && (e.acceleration.z > 5 || e.acceleration.z < -5)) {
        this.racket.firstPower();
        this.lastPowerLaunch = Date.now();
    }
};

GyroManager.prototype.update = function () {

    requestAnimationFrame(this.update.bind(this));
};

GyroManager.prototype.onDestroy = function () {
    window.removeEventListener("deviceorientation", this.bindOrientationHandler);
    window.removeEventListener("devicemotion", this.bindMotionHandler);
};

module.exports = GyroManager;