/**
 * Created by jerek0 on 14/02/2015.
 */
var StateController = require('./StateController');
var Ball = require('./entities/Ball');

/**
 * IDLE CONTROLLER
 * 
 * Basic state with some balls moving around behing pages *
 *
 * @constructor
 */
var IdleController = function () {
    
    // Yellow background
    this.stage = new PIXI.Stage(0xF3BD0B);
    
    // Set the boundaries which will be used for collisions
    this.boundaries = new PIXI.Rectangle(0,0,window.innerWidth, window.innerHeight);
    
    // Populate with some balls moving in random directions
    this.balls = [];
    for(var i = 0; i < 4; i++){
        this.balls[i] = new Ball();

        this.balls[i].reset(new PIXI.Point(window.innerWidth / 2 , window.innerHeight / 2));
        this.balls[i].launch(Math.round((Math.random()*2-1)*10), Math.round((Math.random()*2-1)*10));
        this.balls[i].alpha = 0.5;

        this.stage.addChild(this.balls[i]);
    }
    
    // Background texture
    var background = new PIXI.Sprite.fromImage('img/background.png');
    background.width = window.innerWidth;
    background.height = window.innerHeight;
    this.stage.addChild(background);
};
IdleController.prototype = new StateController();
IdleController.prototype.constructor = IdleController;

/**
 * Main loop of this state *
 */
IdleController.prototype.update = function() {
    
    // UPDATE ALL THE BALLS
    var i, numberOfBalls = this.balls.length;
    for(i = 0; i < numberOfBalls; i++) {
        this.balls[i].move();
        this.balls[i].checkBoundariesCollisions(this.boundaries);
    }
};

module.exports = IdleController;