/**
 * Created by jerek0 on 22/02/2015.
 */
var Racket = require('./Racket');

/**
 * Red racket *
 * @param position
 * @constructor
 */
var RedFury = function(position) {
    Racket.call(this, position);
    
    // Specs
    this.acceleration = 3;
    
    // Power(s)
    this.powerName = 'duplicateBall';

    // Graphics
    this.removeChild(this.graphics);
    this.graphics = new PIXI.Sprite.fromImage('img/hero1.png');
    this.graphics.width = this.graphics.width / 2;
    this.graphics.height = this.graphics.height / 2;
    this.faceTheRightWay();
    this.addChild(this.graphics);
};
RedFury.prototype = Object.create(Racket.prototype);
RedFury.prototype.constructor = RedFury;


module.exports = RedFury;