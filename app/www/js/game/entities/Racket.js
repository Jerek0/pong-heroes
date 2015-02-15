/**
 * Created by jerek0 on 15/02/2015.
 */

var Racket = function (position) {
    PIXI.DisplayObjectContainer.call( this );
    
    this.position.x = position.x;
    this.position.y = position.y;
    
    this.position.deltaY = 0;
    
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0x4A3637);
    this.graphics.drawRect(0,0,20,80);
    this.addChild(this.graphics);
    
};
Racket.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Racket.prototype.constructor = Racket;

Racket.prototype.move = function() {
    this.position.y += this.position.deltaY;
};

module.exports = Racket;