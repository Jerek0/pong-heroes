/**
 * Created by jerek0 on 15/02/2015.
 */

var GyroManager = function(racket) {
    this.racket = racket;
    
    window.addEventListener("deviceorientation", this.bindOrientation.bind(this), false);
    
    requestAnimationFrame(this.update.bind(this));
};

GyroManager.prototype.bindOrientation = function (e) {
    //var alpha = e.alpha;
    //var beta = e.beta;
    var gamma = e.gamma + 20; // -20 allows to play a little bended
    if(gamma < 2 && gamma > -2) gamma = 0;
    var percentage = 1 * gamma / -20;
    
    if(percentage > 1) percentage = 1;
    else if( percentage < -1) percentage = -1;
    
    console.log(percentage);
    
    this.racket.position.deltaY += this.racket.acceleration * 4 * percentage;
};

GyroManager.prototype.update = function () {

    requestAnimationFrame(this.update.bind(this));
};

module.exports = GyroManager;