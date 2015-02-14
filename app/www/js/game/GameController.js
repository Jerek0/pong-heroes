/**
 * Created by jerek0 on 14/02/2015.
 */
var StateController = require('./StateController');
var Scene = require('./zones/Scene');

var GameController = function () {
    this.stage = new PIXI.Stage(0x4A3637);
    
    this.scene = new Scene(1280,1024);
    this.stage.addChild(this.scene);
    this.onResize();
    
    window.onresize = this.onResize.bind(this);

    var ball = new PIXI.Sprite.fromImage('img/ball.png');
    ball.pivot.x = 0.5;
    ball.pivot.y = 0.5;
    ball.x = this.scene.baseWidth / 2;
    ball.y = this.scene.baseHeight / 2;
    this.scene.addChild(ball);
};
GameController.prototype = new StateController();
GameController.prototype.constructor = GameController;

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
    
    console.log(ratio);

    this.scene.scale = new PIXI.Point( ratio, ratio );
    this.scene.x = dec.x;
    this.scene.y = dec.y;
};

module.exports = GameController;