/**
 * Created by jerek0 on 22/02/2015.
 */

/**
 * Created by jerek0 on 22/02/2015.
 */
var Racket = require('./Racket');

var BlueFury = function(position) {
    Racket.call(this, position);

    this.acceleration = 1;
    this.friction = 0.95;

    this.removeChild(this.graphics);

    this.graphics = new PIXI.Sprite.fromImage('img/hero2.png');
    this.graphics.width = this.graphics.width / 2;
    this.graphics.height = this.graphics.height / 2;
    this.faceTheRightWay();
    this.addChild(this.graphics);
};
BlueFury.prototype = Object.create(Racket.prototype);
BlueFury.prototype.constructor = BlueFury;

BlueFury.prototype.firstPower = function () {
    this.dispatchEvent('reverseBallsAngles');
};

module.exports = BlueFury;