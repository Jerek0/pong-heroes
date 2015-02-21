/**
 * Created by jerek0 on 15/02/2015.
 */

var Racket = function (position) {
    PIXI.DisplayObjectContainer.call( this );
    
    this.position.x = position.x;
    this.position.y = position.y;
    
    this.position.deltaY = 0;
    this.friction = 0.9;
    this.acceleration = 2;
    
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0x4A3637);
    this.graphics.drawRect(0,0,40,160);
    this.addChild(this.graphics);
    
};
Racket.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Racket.prototype.constructor = Racket;

Racket.prototype.move = function(delta) {
    this.position.deltaY += delta;
};

Racket.prototype.applyFriction = function () {
    this.position.deltaY *= this.friction;
}

Racket.prototype.physics = function() {
    this.position.y += this.position.deltaY;
}

Racket.prototype.checkBoundariesCollisions = function () {
    if(this.position.y >= (this.parent.baseHeight - this.height) || this.position.y <= 0) {
        if(this.position.y >= (this.parent.baseHeight - this.height)) {
            this.position.y = this.parent.baseHeight - this.height;
        } else {
            this.position.y = 0;
        }
        
        this.position.deltaY = -this.position.deltaY;
    }
};

module.exports = Racket;