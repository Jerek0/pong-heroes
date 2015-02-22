/**
 * Created by jerek0 on 14/02/2015.
 */
var StateController = require('./StateController');
var Scene = require('./zones/Scene');
var Ball = require('./entities/Ball');
var Racket = require('./entities/rackets/Racket');
var RedFury = require('./entities/rackets/RedFury');
var BlueFury = require('./entities/rackets/BlueFury');
var Score = require('./entities/Score');
var PowersBar = require('./zones/powers/PowersBar');
var KeysManager = require('./controls/KeysManager');
var GyroManager = require('./controls/GyroManager');
var ServerGameUpdater = require('../network/ServerGameUpdater');
var ScoreManager = require('./managers/ScoreManager');

var GameController = function () {
    
    // STAGE AND SCENE SETTINGS
    this.stage = new PIXI.Stage(0x4A3637); // Tha background
    this.scene = new Scene(1280,1024); // The zone where we'll play with the default size
    this.stage.addChild(this.scene);
    this.onResize(); // Center and resize the scene according to it's ratio
    window.onresize = this.onResize.bind(this);
    this.boundaries = new PIXI.Rectangle(0,0,1280,1024); // Frame collisions

    var background = new PIXI.Sprite.fromImage('img/background.png');
    background.width = 1280;
    background.height = 1024;
    this.scene.addChild(background);

    this.powersBar = new PowersBar(new PIXI.Point(window.innerWidth - 20,window.innerHeight - 48 - 20));
    this.stage.addChild(this.powersBar);

    // ENTITIES
    this.balls = [];
    this.players = [];
    this.player = 0;
    this.scoreManager = new ScoreManager();
    this.scores = []; //these are the views, not the model

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
    for(var i = 0; i < 1; i++) {
        this.addBall({
            x: (this.scene.baseWidth / 2),
            y: (this.scene.baseHeight / 2)
        }, true);
    }
    
    // PLAYER INIT
    this.addPlayer({
        id: this.player,
        type: localStorage.getItem('PH-character'),
        x: 20,
        y: this.scene.baseHeight/2
    }, true);
    
    this.powersBar.addPower(this.players[this.player].powerName);
    
    this.initControls();
};

GameController.prototype.initClient = function () {
    this.player = 1;

    // PLAYER INIT
    this.addPlayer({
        id: this.player,
        type: localStorage.getItem('PH-character'),
        x: this.scene.baseWidth - 100,
        y: this.scene.baseHeight / 2
    }, true);

    this.powersBar.addPower(this.players[this.player].powerName);

    this.initControls();
};

GameController.prototype.initControls = function () {
    if(localStorage.getItem('PH-tech') == 'gyro') {
        this.controlsManager = new GyroManager(this.players[this.player]);
    } else {
        this.controlsManager = new KeysManager(this.players[this.player]);
    }
};

GameController.prototype.update = function () {
    
    var numberOfBalls = this.balls.length,
        numberOfPlayers = this.players.length,
        i, collision, j;

    // UPDATE ALL THE BALLS
    for(i = 0; i < numberOfBalls; i++) {
        // Physics
        this.balls[i].move();
        this.balls[i].accelerate();
        
        // Collisions
        if(this.role == "host"){
            for(j=0;j<numberOfPlayers;j++) {
                this.balls[i].checkPlayersCollisions(this.players[j], j);
            }
            
            collision = this.balls[i].checkBoundariesCollisions(this.boundaries);
            if(collision) {
                this.onScore({ id: parseInt(collision)}, true);
                
                if(this.balls.length > 1) {
                    this.removeBall({id: i}, true);
                } else{
                    this.balls[i].reset(new PIXI.Point(this.scene.baseWidth/2, this.scene.baseHeight/2));
                    this.balls[i].launch();
                }
                numberOfBalls = this.balls.length;
            }
        }
    }
    
    for(i=0; i < numberOfPlayers; i++) {
        if(this.players[i]) {
            // If it's our player, apply friction
            if(i == this.player) this.players[i].applyFriction();
            
            // Physics
            this.players[i].physics();
            this.players[i].checkBoundariesCollisions();
        }
    };
    
    // NETWORK UPDATES EVERY 1/25s
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
    this.balls[this.balls.length-1].launch(data.deltaX, data.deltaY);

    if(sendToServer){
        this.serverGameUpdater.addBall({
            x: this.balls[this.balls.length-1].position.x,
            y: this.balls[this.balls.length-1].position.y,
            deltaX: this.balls[this.balls.length-1].position.deltaX,
            deltaY: this.balls[this.balls.length-1].position.deltaY
        });
    }
};

GameController.prototype.removeBall = function (data, sendToServer) {
    this.scene.removeChild(this.balls[data.id]);
    this.balls.splice(data.id, 1);
    
    if(sendToServer)
        this.serverGameUpdater.removeBall(data);
};

GameController.prototype.updateBall = function (data) {
    this.balls[data.index].x = data.x;
    this.balls[data.index].y = data.y;
    this.balls[data.index].position.deltaX = data.deltaX;
    console.log('updating ball '+data.index+ ' with value '+data.deltaY);
    console.log(this.balls[data.index].position.deltaY);
    this.balls[data.index].position.deltaY = data.deltaY;
    console.log(this.balls[data.index].position.deltaY);
};

GameController.prototype.addPlayer = function (data, sendToServer) {
    // Add the actual player in the scene
    var player;
    
    switch (data.type) {
        case "1":
            player = new RedFury(new PIXI.Point(data.x, data.y));
            break;
        case "2":
            player = new BlueFury(new PIXI.Point(data.x, data.y));
            break;
        default:
            player = new Racket(new PIXI.Point(data.x, data.y));
            break;
    }
    
    
    this.players[data.id] = player;
    this.scene.addChild(this.players[data.id]);
    this.listenForPlayerPowers(data.id);
    
    // Add it's scores
    this.scoreManager.addPlayer(data.id);
    this.scores[data.id] = new Score(
        new PIXI.Point(
            ((this.scene.baseWidth / 2 > data.x) ? data.x + 250 : data.x - 350),
            data.y),
        '0');
    this.scene.addChild(this.scores[data.id]);
    
    if(sendToServer)
        this.serverGameUpdater.addPlayer(data);
};

GameController.prototype.listenForPlayerPowers = function (index) {
    this.players[index].addEventListener('duplicateBall', this.addBallFromPlayer.bind(this, index));
    this.players[index].addEventListener('reverseBallsAngles', this.reverseBallsAngles.bind(this));
};

GameController.prototype.destroyPlayersListeners = function () {
    for(var i = 0; i < this.players.length; i++) {
        this.players[i].removeAllListeners('duplicateBall');
        this.players[i].removeAllListeners('reverseBallsAngles');
    }  
};

GameController.prototype.addBallFromPlayer = function(index) {
    this.powersBar.powers[0].coolDown();
    
    this.addBall({
        x: (this.players[index].position.x < 640) ? this.players[index].position.x + this.players[index].width : this.players[index].position.x,
        y: this.players[index].position.y + (this.players[index].height / 2),
        deltaX: (this.players[index].position.x < 640 ? 5 : -5)
    }, true);
};

GameController.prototype.reverseBallsAngles = function () {
    var i, numberOfBalls = this.balls.length;

    this.powersBar.powers[0].coolDown();
    
    for(i = 0; i < numberOfBalls; i++) {
        this.balls[i].position.deltaY *= -1;
        
        this.serverGameUpdater.updateBall({
            index: i,
            deltaX: this.balls[i].position.deltaX,
            deltaY: this.balls[i].position.deltaY,
            x: this.balls[i].x,
            y: this.balls[i].y
        });
    }
};

GameController.prototype.updatePlayer = function(data) {
    this.players[data.index].y = data.y;
    this.players[data.index].position.deltaY = data.deltaY;
};

GameController.prototype.onScore = function (data, sendToServer) {
    this.scoreManager.incrementScore(data.id);
    this.scores[data.id].updateValue(this.scoreManager.getScoreByPlayer(data.id));
    
    if(data.id == this.player && this.scoreManager.getScoreByPlayer(data.id) > localStorage.getItem('PH-highscore'))
    localStorage.setItem('PH-highscore', this.scoreManager.getScoreByPlayer(data.id));
    
    if(sendToServer)
        this.serverGameUpdater.scored({ id: data.id});
};

GameController.prototype.onDestroy = function () {
    this.controlsManager.onDestroy();
    this.destroyPlayersListeners();
    this.serverGameUpdater.unbindServerEvents();
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