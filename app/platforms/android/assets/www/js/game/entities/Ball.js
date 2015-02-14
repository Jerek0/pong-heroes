/**
 * Created by jerek0 on 14/02/2015.
 */

var Ball = function () {
    PIXI.DisplayObjectContainer.call( this );

    this.graphics = new PIXI.Sprite.fromImage('./img/ball.png');
    this.graphics.anchor.x = 0.5;
    this.graphics.anchor.y = 0.5;
    this.graphics.scale = new PIXI.Point(0.5, 0.5);
    this.addChild(this.graphics);
};

Ball.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Ball.prototype.constructor = Ball;

module.exports = Ball;