/**
 * Created by jerek0 on 14/02/2015.
 */

/**
 * BALL *
 * 
 * The main element of the game *
 *
 * @constructor
 */
var Ball = function () {
    PIXI.DisplayObjectContainer.call( this );
    
    this.position.deltaX = 0;
    this.position.deltaY = 0;
    
    this.colliding = [];

    this.graphics = new PIXI.Sprite.fromImage('./img/ball.png');
    //this.graphics.anchor.x = 0.5;
    //this.graphics.anchor.y = 0.5;
    this.graphics.scale = new PIXI.Point(0.5, 0.5);
    this.addChild(this.graphics);
};

Ball.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Ball.prototype.constructor = Ball;

/**
 * Function allowing to reset the ball to a certain point without any inerty *
 * @param point
 */
Ball.prototype.reset = function (point) {
    this.position.deltaX = 0;
    this.position.deltaY = 0;
    
    this.position.x = point.x;
    this.position.y = point.y;
};

/**
 * Function allowing to launch the ball in a given inerty *
 * @param deltaX
 * @param deltaY
 */
Ball.prototype.launch = function (deltaX, deltaY) {
    this.position.deltaX = deltaX  ? deltaX : (Math.round(Math.random()) * 2 - 1) * 5;
    this.position.deltaY = deltaY ? deltaY : (Math.random()*2 - 1) * 5;
};

/**
 * Move the ball according to it's deltas *
 */
Ball.prototype.move = function() {
    this.position.x += this.position.deltaX;
    this.position.y += this.position.deltaY;
};

/**
 * Accelerates the ball a little *
 */
Ball.prototype.accelerate = function() {
    this.position.deltaX *= 1.0005;
    this.position.deltaY *= 1.0005;
};

/**
 * Check for player collisions with the ball and bounces it if needed *
 * 
 * See /app/docs/collisions.png for more infos *
 * @param player
 * @param index
 */
Ball.prototype.checkPlayersCollisions = function (player, index) {
    // We get the ball's hitbox
    var hitBox = new PIXI.Rectangle(this.position.x, this.position.y, this.width, this.height);
    
    // We check for a collision with the player
    if(!(player.position.x > (hitBox.x + hitBox.width)    ||
        (player.position.x + player.width) < hitBox.x   ||
         player.position.y > (hitBox.y + hitBox.height)   ||
        (player.position.y + player.height) < hitBox.y))
    {
        // TODO - Watch memory on collisions
        if(this.colliding[index] == false) {
            // CAS 1 - Rebond sur X uniquement
            if(hitBox.y + hitBox.height > player.position.y && (hitBox.y + hitBox.height) < (player.position.y + player.height) )
            {
                this.position.deltaX = -this.position.deltaX;
            }
            
            // CAS 2 - Rebond sur X & Y
            if( ( // EN BAS à GAUCHE DU JOUEUR
                    hitBox.y < (player.position.y + player.height) &&
                    (hitBox.y + hitBox.height / 2) > (player.position.y + player.height) &&
                    hitBox.x < player.position.x &&
                    this.position.deltaX > 0
                ) 
                || 
                ( // EN HAUT A GAUCHE DU JOUEUR
                    ((hitBox.y + hitBox.height) > player.position.y) &&
                    ((hitBox.y + hitBox.height / 2) < player.position.y) &&
                    (hitBox.x + hitBox.width / 2) < player.position.x &&
                    this.position.deltaX > 0
                )
                ||
                ( // EN BAS A DROITE DU JOUEUR
                    hitBox.y < (player.position.y + player.height) &&
                    (hitBox.y + hitBox.height / 2) > (player.position.y + player.height) &&
                    hitBox.x > player.position.x + player.width &&
                    this.position.deltaX < 0
                )
                ||
                ( // EN HAUT A DROITE DU JOUEUR
                    ((hitBox.y + hitBox.height) > player.position.y) &&
                    ((hitBox.y + hitBox.height / 2) < player.position.y) &&
                    (hitBox.x) < player.position.x + player.width &&
                    this.position.deltaX < 0
                )
            )
            {
                this.position.deltaX = -this.position.deltaX;
                this.position.deltaY = -this.position.deltaY;
            }
            
            // CAS 3 - Rebond sur Y uniquement
            if (hitBox.y < (player.position.y + player.height) &&
                hitBox.x > player.position.x)
            {
                this.position.deltaY = -this.position.deltaY;
            }

            // Le déplacement du joueur influera forcément sur la puissance du rebond, verticalement parlant
            this.position.deltaY += player.position.deltaY/4;
            this.colliding[index] = true;
        }
    } else {
        if(this.colliding[index]) console.log('no collision anymore');
        this.colliding[index] = false;
    }
}

/**
 * Check for boundaries collisions *
 * @param Rectangle
 * @returns {*}
 */
Ball.prototype.checkBoundariesCollisions = function (Rectangle) {
    if(this.position.x + this.width > Rectangle.width || this.position.x < 0) {
        this.position.deltaX = - this.position.deltaX;
        
        // If there is a collision, we return the player that won
        if(this.position.x + this.width > Rectangle.width) return '0';
        else return '1';
    }
    if(this.position.y + this.height> Rectangle.height || this.position.y < 0 ) {
        this.position.deltaY = - this.position.deltaY;
    }
    return false;
};

module.exports = Ball;