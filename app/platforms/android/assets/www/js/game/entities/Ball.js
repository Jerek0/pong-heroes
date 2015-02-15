/**
 * Created by jerek0 on 14/02/2015.
 */

var Ball = function () {
    PIXI.DisplayObjectContainer.call( this );
    
    this.position.deltaX = 0;
    this.position.deltaY = 0;

    this.graphics = new PIXI.Sprite.fromImage('./img/ball.png');
    this.graphics.anchor.x = 0.5;
    this.graphics.anchor.y = 0.5;
    this.graphics.scale = new PIXI.Point(0.5, 0.5);
    this.addChild(this.graphics);
};

Ball.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Ball.prototype.constructor = Ball;

Ball.prototype.reset = function (point) {
    this.position.deltaX = 0;
    this.position.deltaY = 0;
    
    this.position.x = point.x;
    this.position.y = point.y;
};

Ball.prototype.launch = function () {
    this.position.deltaX = Math.floor((Math.random()*2-1)*10);
    this.position.deltaY = Math.floor((Math.random()*2-1)*10);
};

Ball.prototype.move = function() {
    this.position.x += this.position.deltaX;
    this.position.y += this.position.deltaY;
};

Ball.prototype.accelerate = function() {
    this.position.deltaX *= 1.0005;
    this.position.deltaY *= 1.0005;
};

Ball.prototype.checkBoundariesCollisions = function (Rectangle) {
    if(this.position.x > Rectangle.width || this.position.x < 0) this.position.deltaX = - this.position.deltaX;
    if(this.position.y > Rectangle.height || this.position.y < 0 ) this.position.deltaY = - this.position.deltaY;
};

module.exports = Ball;