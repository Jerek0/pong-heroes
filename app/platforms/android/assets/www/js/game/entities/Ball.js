/**
 * Created by jerek0 on 14/02/2015.
 */

var Ball = function () {
    PIXI.DisplayObjectContainer.call( this );
    
    this.position.deltaX = 0;
    this.position.deltaY = 0;

    this.graphics = new PIXI.Sprite.fromImage('./img/ball.png');
    //this.graphics.anchor.x = 0.5;
    //this.graphics.anchor.y = 0.5;
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

Ball.prototype.launch = function (deltaX, deltaY) {
    this.position.deltaX = deltaX  ? deltaX : (Math.round(Math.random()) * 2 - 1) * 5;
    this.position.deltaY = deltaY ? deltaY : (Math.random()*2 - 1) * 5;
};

Ball.prototype.move = function() {
    this.position.x += this.position.deltaX;
    this.position.y += this.position.deltaY;
};

Ball.prototype.accelerate = function() {
    this.position.deltaX *= 1.0005;
    this.position.deltaY *= 1.0005;
};

Ball.prototype.checkPlayersCollisions = function (player) {
    //var hitBox = new PIXI.Rectangle(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
    var hitBox = new PIXI.Rectangle(this.position.x, this.position.y, this.width, this.height);
    
    // COLLISION DETECTEE
    if(!(player.position.x > (hitBox.x + hitBox.width)    ||
        (player.position.x + player.width) < hitBox.x   ||
         player.position.y > (hitBox.y + hitBox.height)   ||
        (player.position.y + player.height) < hitBox.y))
    {
        // SECURITE POUR NE PAS COLLISIONNER EN BOUCLE (oui j'aime le français)
        if(this.colliding == false) {
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

            this.colliding = true;
        }
    } else {
        if(this.colliding) console.log('no collision anymore');
        this.colliding = false;
    }
}

Ball.prototype.checkBoundariesCollisions = function (Rectangle) {
    if(this.position.x > Rectangle.width || this.position.x < 0) {
        this.position.deltaX = - this.position.deltaX;
        
        // If there is a collision, we return the player that won
        if(this.position.x > Rectangle.width) return '0';
        else return '1';
    }
    if(this.position.y > Rectangle.height || this.position.y < 0 ) {
        this.position.deltaY = - this.position.deltaY;
    }
    return false;
};

module.exports = Ball;