/**
 * Created by jerek0 on 15/02/2015.
 */

/**
 * BASIC RACKET
 * 
 * Class to inherit *
 *
 * @param position
 * @constructor
 */
var Racket = function (position) {
    PIXI.DisplayObjectContainer.call( this );
    PIXI.EventTarget.call(this);
    
    // Position
    this.position.x = position.x;
    this.position.y = position.y;
    
    // Basic specs
    this.position.deltaY = 0;
    this.friction = 0.9;
    this.acceleration = 2;
    
    // Basic graphics
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0x4A3637);
    this.graphics.drawRect(0,0,40,160);
    this.addChild(this.graphics);
};
// Inherit from DisplayObjectContainer
Racket.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Racket.prototype.constructor = Racket;

/**
 * Changes the deltaY *
 * @param delta
 */
Racket.prototype.move = function(delta) {
    this.position.deltaY += delta;
};

/**
 * Apply friction to the racket *
 */
Racket.prototype.applyFriction = function () {
    this.position.deltaY *= this.friction;
}

/**
 * Moves the racket according to it's delta * 
 * (Only moving on the Y axis, cause it's a racket) *
 */
Racket.prototype.physics = function() {
    this.position.y += this.position.deltaY;
}

/**
 * Check for boundaries collisions *
 */
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

/**
 * Orients the racket in the right way, according to it's position on the scene *
 */
Racket.prototype.faceTheRightWay = function () {
    if(this.position.x < 640) {
        this.graphics.anchor.y = 1;
    } else {
        this.graphics.anchor.x = 1;
    }
    this.graphics.rotation = Math.PI * ((this.position.x > 640 ? -1 : 1) * 90) / 180;
};

/**
 * Launch it's first power *
 */
Racket.prototype.firstPower = function () {
    this.dispatchEvent(this.powerName);
};

module.exports = Racket;