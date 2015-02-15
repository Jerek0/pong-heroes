/**
 * Created by jerek0 on 14/02/2015.
 */
var StateController = require('./StateController');
var Scene = require('./zones/Scene');
var Ball = require('./entities/Ball');
var Racket = require('./entities/Racket');
var KeysManager = require('./controls/KeysManager');
var ServerGameUpdater = require('../network/ServerGameUpdater');

var GameController = function () {
    
    // STAGE AND SCENE SETTINGS
    this.stage = new PIXI.Stage(0x4A3637); // Tha background
    this.scene = new Scene(1280,1024); // The zone where we'll play with the default size
    this.stage.addChild(this.scene);
    this.onResize(); // Center and resize the scene according to it's ratio
    window.onresize = this.onResize.bind(this);
    this.boundaries = new PIXI.Rectangle(0,0,1280,1024); // Frame collisions

    // ENTITIES
    this.balls = [];
    this.players = [];
    this.player = 0;

    // NETWORK
    this.serverGameUpdater = new ServerGameUpdater(global.serverDialer.socket, this);
    this.role = localStorage.getItem('PH-role');
    if(this.role == 'host') {
        this.initHost();
    } else {
        this.initClient();
    }
    this.lastUpdate = Date.now();
};
GameController.prototype = new StateController();
GameController.prototype.constructor = GameController;

GameController.prototype.initHost = function () {
    this.player = 0;
    
    // BALLS INIT
    for(var i = 0; i < 2; i++) {
        this.addBall({
            x: (this.scene.baseWidth / 2),
            y: (this.scene.baseHeight / 2)
        }, true);
    }
    
    // PLAYER INIT
    this.addPlayer({
        id: this.player,
        x: 20,
        y: this.scene.baseHeight/2
    }, true);
    
    this.controlsManager = new KeysManager(this.players[this.player]);
};

GameController.prototype.initClient = function () {
    this.player = 1;
    
    // PLAYER INIT
    this.addPlayer({
        id: this.player,
        x: this.scene.baseWidth - 40,
        y: this.scene.baseHeight / 2
    }, true);

    this.controlsManager = new KeysManager(this.players[this.player]);
};

GameController.prototype.update = function () {
    // UPDATE ALL THE BALLS
    var i, numberOfBalls = this.balls.length;
    for(i = 0; i < numberOfBalls; i++) {
        this.balls[i].move();
        this.balls[i].checkBoundariesCollisions(this.boundaries);
        this.balls[i].accelerate();
    }
    
    var numberOfPlayers = this.players.length;
    for(i=0; i < numberOfPlayers; i++) {
        if(this.players[i]) {
            if(i == this.player) this.players[i].applyFriction();
            this.players[i].physics();
            this.players[i].checkBoundariesCollisions();
        }
    };
    
    if((Date.now() - this.lastUpdate) > (1000/25) ) {
        this.lastUpdate = Date.now();
        
        // SI ON EST LE HOST, ON UPDATE LES DELTA
        if(this.role == 'host') {
            for(i = 0; i < numberOfBalls; i++) {
                this.serverGameUpdater.updateBall({
                    index: i,
                    deltaX: this.balls[i].position.deltaX,
                    deltaY: this.balls[i].position.deltaY,
                    x: this.balls[i].x,
                    y: this.balls[i].y
                });
            }

            if(this.players[0]) {
                this.serverGameUpdater.updatePlayer({
                    index: 0,
                    deltaY: this.players[0].position.deltaY,
                    y: this.players[0].y
                });
            }
        } else {
            if(this.players[1]){
                this.serverGameUpdater.updatePlayer({
                    index: 1,
                    deltaY: this.players[1].position.deltaY,
                    y: this.players[1].y
                });
            }
        }
    }
};

GameController.prototype.addBall = function (data, sendToServer) {
    var ball = new Ball();
    ball.reset(new PIXI.Point(data.x, data.y));
    this.balls.push(ball);
    this.scene.addChild(this.balls[this.balls.length-1]);

    if(sendToServer){
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

GameController.prototype.addPlayer = function (data, sendToServer) {
    var player = new Racket(new PIXI.Point(data.x, data.y));
    this.players[data.id] = player;
    this.scene.addChild(this.players[data.id]);
    
    if(sendToServer)
        this.serverGameUpdater.addPlayer(data);
};

GameController.prototype.updatePlayer = function(data) {
    this.players[data.index].y = data.y;
    this.players[data.index].position.deltaY = data.deltaY;
}

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