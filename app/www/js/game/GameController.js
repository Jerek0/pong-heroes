/**
 * Created by jerek0 on 14/02/2015.
 */
var StateController = require('./StateController');
var Scene = require('./zones/Scene');
var Ball = require('./entities/Ball');
var ServerGameUpdater = require('../network/ServerGameUpdater');

var GameController = function () {
    
    // NETWORK
    this.serverGameUpdater = new ServerGameUpdater(global.serverDialer.socket, this);
    this.role = localStorage.getItem('PH-role');
    
    // FRONT
    this.stage = new PIXI.Stage(0x4A3637);
    
    this.scene = new Scene(1280,1024);
    this.stage.addChild(this.scene);
    this.onResize();
    window.onresize = this.onResize.bind(this);
    
    this.boundaries = new PIXI.Rectangle(0,0,1280,1024);

    this.balls = [];
    
    if(this.role == 'host') this.initHost();
    
    this.lastUpdate = Date.now();
};
GameController.prototype = new StateController();
GameController.prototype.constructor = GameController;

GameController.prototype.initHost = function () {
    for(var i = 0; i < 2; i++) {
        var scope = this;
        this.addBall({
            x: (scope.scene.baseWidth / 2),
            y: (scope.scene.baseHeight / 2)
        });
    }
};

GameController.prototype.update = function () {
    // UPDATE ALL THE BALLS
    var i, numberOfBalls = this.balls.length;
    for(i = 0; i < numberOfBalls; i++) {
        this.balls[i].move();
        this.balls[i].checkBoundariesCollisions(this.boundaries);
        this.balls[i].accelerate();
    }
    
    if(this.role == 'host' && (Date.now() - this.lastUpdate) > (1000/10) ) {
        this.lastUpdate = Date.now();

        for(i = 0; i < numberOfBalls; i++) {
            this.serverGameUpdater.updateBall({
                index: i,
                deltaX: this.balls[i].position.deltaX,
                deltaY: this.balls[i].position.deltaY,
                x: this.balls[i].x,
                y: this.balls[i].y
            });
        }
    }
};

GameController.prototype.addBall = function (data) {
    var ball = new Ball();
    ball.reset(new PIXI.Point(data.x, data.y));
    this.balls.push(ball);
    this.scene.addChild(this.balls[this.balls.length-1]);

    if(this.role == 'host'){
        this.serverGameUpdater.addBall(data);
        this.balls[this.balls.length-1].launch();
    }
};

GameController.prototype.updateBall = function (data) {
    this.balls[data.index].x = data.x;
    this.balls[data.index].y = data.y;
    this.balls[data.index].position.deltaX = data.deltaX;
    this.balls[data.index].position.deltaY = data.deltaY;
};

GameController.prototype.onResize = function () {
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;

    global.gameEngine.rendererController.renderer.resize(newWidth, newHeight);
    
    var ratioW = newWidth / this.scene.baseWidth;
    var ratioH = newHeight / this.scene.baseHeight;
    var dec = {};
    var ratio;

    if ( ratioW < ratioH ) {
        ratio = ratioW;
        dec.x = 0;
        dec.y = ( newHeight - this.scene.baseHeight * ratio ) / 2;
    } 
    else {
        ratio = ratioH;
        dec.x = ( newWidth - this.scene.baseWidth * ratio ) / 2;
        dec.y = 0;
    }
    
    this.scene.scale = new PIXI.Point( ratio, ratio );
    this.scene.x = dec.x;
    this.scene.y = dec.y;
};

module.exports = GameController;