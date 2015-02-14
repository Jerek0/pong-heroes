/**
 * Created by jerek0 on 14/02/2015.
 */
var StateController = require('./StateController');
var Ball = require('./entities/Ball');
    
var IdleController = function () {
    this.stage = new PIXI.Stage(0xF3BD0B);
    
    this.balls = [];
    for(var i = 0; i < 4; i++){
        this.balls[i] = new Ball();

        this.balls[i].position.x = window.innerWidth/2;
        this.balls[i].position.y = window.innerHeight/2;
        this.balls[i].position.deltaX = Math.floor((Math.random()*2-1)*10);
        this.balls[i].position.deltaY = Math.floor((Math.random()*2-1)*10);
        this.balls[i].alpha = 0.5;

        this.stage.addChild(this.balls[i]);
    }
    
    var background = new PIXI.Sprite.fromImage('img/background.png');
    background.width = window.innerWidth;
    background.height = window.innerHeight;
    this.stage.addChild(background);
};
IdleController.prototype = new StateController();
IdleController.prototype.constructor = IdleController;

IdleController.prototype.update = function() {
    var i, numberOfBalls = this.balls.length;
    for(i = 0; i < numberOfBalls; i++) {
        this.balls[i].position.x += this.balls[i].position.deltaX;
        this.balls[i].position.y += this.balls[i].position.deltaY;

        if(this.balls[i].position.x > window.innerWidth || this.balls[i].position.x < 0) this.balls[i].position.deltaX = - this.balls[i].position.deltaX;
        if(this.balls[i].position.y > window.innerHeight || this.balls[i].position.y < 0 ) this.balls[i].position.deltaY = - this.balls[i].position.deltaY;
    }
};

module.exports = IdleController;