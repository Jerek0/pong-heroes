(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var PageManager = require('./pages/PageManager');
var ServerDialer = require('./network/ServerDialer');
var RendererController = require('./game/RendererController');

var app = {
    initialize: function() {
        //this.bindEvents();
        this.onDeviceReady();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.add('desktop');
        }

        app.connectToServer();
        app.pageManager = new PageManager(document.getElementById('ui'));
        app.launchGameEngine();
    },
    
    connectToServer: function() {
        if(!global.serverDialer) {
            global.serverDialer = new ServerDialer();
        }
    },
    
    launchGameEngine: function() {
        global.gameEngine = {
            rendererController: new RendererController('game')
        };
    }
};

app.initialize();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./game/RendererController":5,"./network/ServerDialer":18,"./pages/PageManager":26}],2:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */

/**
 * CUSTOM EVENT DISPATCHER *
 * 
 * This is a custom events managing system allowing to use events
 * with JS Objects and not only with DOM elements
 * 
 * It works with classical 'addEventListeners', 'removeEventListeners', etc. 
 *
 * @constructor
 */
function CustomEventDispatcher() { this._init(); }

CustomEventDispatcher.prototype._init= function() {
    this._registrations= {};
};

/**
 * Get all the listeners of a certain type *
 * @param type - The event name
 * @param useCapture
 * @returns {*}
 * @private
 */
CustomEventDispatcher.prototype._getListeners= function(type, useCapture) {
    var captype= (useCapture? '1' : '0')+type;
    if (!(captype in this._registrations))
        this._registrations[captype]= [];
    return this._registrations[captype];
};

/**
 * Add a listener of a certain type with a callback function *
 * @param type - The event name
 * @param listener - The callback function
 * @param useCapture
 */
CustomEventDispatcher.prototype.addEventListener= function(type, listener, useCapture) {
    var listeners= this._getListeners(type, useCapture);
    var ix= listeners.indexOf(listener);
    if (ix===-1)
        listeners.push(listener);
};

/**
 * Removes a listener of a certain type and with a certain callback function *
 * @param type - The event name
 * @param listener - The callback function
 * @param useCapture
 */
CustomEventDispatcher.prototype.removeEventListener= function(type, listener, useCapture) {
    var listeners= this._getListeners(type, useCapture);
    var ix= listeners.indexOf(listener);
    if (ix!==-1)
        listeners.splice(ix, 1);
};

/**
 * Dispatch an event which will be receivable by all the object's listeners *
 * @param evt
 * @returns {boolean}
 */
CustomEventDispatcher.prototype.dispatchEvent= function(evt) {
    var listeners= this._getListeners(evt.type, false).slice();
    for (var i= 0; i<listeners.length; i++)
        listeners[i].call(this, evt);
    return !evt.defaultPrevented;
};

module.exports = CustomEventDispatcher;
},{}],3:[function(require,module,exports){
(function (global){
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

/**
 * GAME CONTROLLER *
 * 
 * Yup, that's a big one ! *
 * 
 * Main manager of the game *
 * @constructor
 */
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

/**
 * Initialize the game as a host *
 */
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

/**
 * Initialize the game as a client *
 */
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

/**
 * Initialize the controls * 
 */
GameController.prototype.initControls = function () {
    if(localStorage.getItem('PH-tech') == 'gyro') {
        this.controlsManager = new GyroManager(this.players[this.player]);
    } else {
        this.controlsManager = new KeysManager(this.players[this.player]);
    }
};

/**
 * MAIN LOOP of this state *
 */
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
    
    // Update the user's player only
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
        
        // IF WE'RE THE HOST
        if(this.role == 'host') {

            // WE UPDATE THE BALLS DELTAS
            for(i = 0; i < numberOfBalls; i++) {
                this.serverGameUpdater.updateBall({
                    index: i,
                    deltaX: this.balls[i].position.deltaX,
                    deltaY: this.balls[i].position.deltaY,
                    x: this.balls[i].x,
                    y: this.balls[i].y
                });
            }
            
            // WE UPDATE THE HOST POSITION AND DELTAS
            if(this.players[0]) {
                this.serverGameUpdater.updatePlayer({
                    index: 0,
                    deltaY: this.players[0].position.deltaY,
                    y: this.players[0].y
                });
            }
        } else { // IF WE'RE THE CLIENT
            if(this.players[1]){
                
                // WE UPDATE THE CLIENT POSITION AND DELTAS
                this.serverGameUpdater.updatePlayer({
                    index: 1,
                    deltaY: this.players[1].position.deltaY,
                    y: this.players[1].y
                });
            }
        }
    }
};

/*
    ##################################
    ###### BALLS MANAGEMENT ##########
    ##################################
 */

/**
 * Add a ball to the scene and launch it *
 * @param data - Parameters (x, y, deltaX, deltaY), deltas are not required
 * @param sendToServer - Do we need to notify the server ?
 */
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

/**
 * Removes a ball from the scene * 
 * @param data - Parameters (id)
 * @param sendToServer - Do we need to notify the server ?
 */
GameController.prototype.removeBall = function (data, sendToServer) {
    this.scene.removeChild(this.balls[data.id]);
    this.balls.splice(data.id, 1);
    
    if(sendToServer)
        this.serverGameUpdater.removeBall(data);
};

/**
 * Updates a ball of the scene *
 * @param data - Parameters (index, x, y, deltaX, deltaY), each is required
 */
GameController.prototype.updateBall = function (data) {
    this.balls[data.index].x = data.x;
    this.balls[data.index].y = data.y;
    this.balls[data.index].position.deltaX = data.deltaX;
    this.balls[data.index].position.deltaY = data.deltaY;
};

/*
     ##################################
     ###### PLAYERS MANAGEMENT ########
     ##################################
 */

/**
 * Adds a player to the scene * 
 * @param data - Parameters (type,x,y), all required
 * @param sendToServer - Do we need to notify the server ?
 */
GameController.prototype.addPlayer = function (data, sendToServer) {
    // Add the actual player in the scene
    var player;
    
    // Instanciate the corresponding racket
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
    
    // Adds the new player to the list and to the scene
    this.players[data.id] = player;
    this.scene.addChild(this.players[data.id]);
    
    // Listen for the new player's powers
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

/**
 * Allows to update the position of a player *
 * @param data - Parameters (index,y,deltaY) all required
 */
GameController.prototype.updatePlayer = function(data) {
    this.players[data.index].y = data.y;
    this.players[data.index].position.deltaY = data.deltaY;
};

/**
 * Player's power listeners *
 * Launches the effect from here *
 * @param index - The player's index of the list we want to listen
 */
GameController.prototype.listenForPlayerPowers = function (index) {
    this.players[index].addEventListener('duplicateBall', this.addBallFromPlayer.bind(this, index));
    this.players[index].addEventListener('reverseBallsAngles', this.reverseBallsAngles.bind(this));
};

/**
 * Destroy the players listeners in order to avoid duplication of listeners issues *
 */
GameController.prototype.destroyPlayersListeners = function () {
    for(var i = 0; i < this.players.length; i++) {
        this.players[i].removeAllListeners('duplicateBall');
        this.players[i].removeAllListeners('reverseBallsAngles');
    }  
};

/* ######## PLAYERS POWERS #########

/**
 * Power allowing to add a ball from the current position of a player, in the right direction *
 * @param index - The player index in the list
 */
GameController.prototype.addBallFromPlayer = function(index) {
    this.powersBar.powers[0].coolDown();
    
    this.addBall({
        x: (this.players[index].position.x < 640) ? this.players[index].position.x + this.players[index].width : this.players[index].position.x,
        y: this.players[index].position.y + (this.players[index].height / 2),
        deltaX: (this.players[index].position.x < 640 ? 5 : -5)
    }, true);
};

/**
 * Power allowing to reverse the deltaY of each balls in the scene *
 */
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

/*
 ##########################################
 ###### GAME CONTROLLER MANAGEMENT ########
 ##########################################
 */

/**
 * Function called when there's a goal ! *
 * @param data - Parameters (id), all required
 * @param sendToServer - Do we need to notify the server ?
 */
GameController.prototype.onScore = function (data, sendToServer) {
    this.scoreManager.incrementScore(data.id);
    this.scores[data.id].updateValue(this.scoreManager.getScoreByPlayer(data.id));
    
    if(data.id == this.player && this.scoreManager.getScoreByPlayer(data.id) > localStorage.getItem('PH-highscore'))
    localStorage.setItem('PH-highscore', this.scoreManager.getScoreByPlayer(data.id));
    
    if(sendToServer)
        this.serverGameUpdater.scored({ id: data.id});
};

/**
 * Function called when changin state, allowing to avoid listeners duplications issues *
 */
GameController.prototype.onDestroy = function () {
    this.controlsManager.onDestroy();
    this.destroyPlayersListeners();
    this.serverGameUpdater.unbindServerEvents();
};

/**
 * Function called on window resize, allowing to resize the scene to the same ratio and centering it *
 */
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../network/ServerGameUpdater":19,"./StateController":6,"./controls/GyroManager":7,"./controls/KeysManager":8,"./entities/Ball":9,"./entities/Score":10,"./entities/rackets/BlueFury":11,"./entities/rackets/Racket":12,"./entities/rackets/RedFury":13,"./managers/ScoreManager":14,"./zones/Scene":15,"./zones/powers/PowersBar":17}],4:[function(require,module,exports){
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
},{"./StateController":6,"./entities/Ball":9}],5:[function(require,module,exports){
(function (global){
/**
 * Created by jerek0 on 14/02/2015.
 */
var GameController = require('./GameController');
var IdleController = require('./IdleController');

/**
 * RENDERER CONTROLLER
 *
 * This is the main manager of the canvas *
 * Launches PIXI, manage the assets, etc. *
 *  
 * @param wrapperId
 * @constructor
 */
var RendererController = function (wrapperId) {
    // Launch PIXI
    this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, { view: document.getElementById(wrapperId), resolution: 2 }, false, true);

    // Set the state to idle by default
    this.setState('idle');
    
    // ASSETS MANAGEMENT
    var scope = this;
    global.assetsLoader = new PIXI.AssetLoader([
        "img/ball.png",
        "img/background.png",
        "img/hero1.png",
        "img/hero2.png"
    ]).on('onComplete', function() {
        requestAnimationFrame(scope.update.bind(scope));
    });
    global.assetsLoader.load();
};

/**
 * Allows to change the current state of the canvas *
 * @param state
 */
RendererController.prototype.setState = function(state) {
    if(this.state) this.state.onDestroy();

    switch (state) {
        case 'game':
            this.state = new GameController();
            break;
        
        case 'idle':
        default:
            this.state = new IdleController();
            break;
    }
    
};

/**
 * Main loop, calling the current state update function *
 */
RendererController.prototype.update = function () {
    this.state.update();
    
    this.renderer.render(this.state.stage);
    requestAnimationFrame(this.update.bind(this));
}

module.exports = RendererController;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./GameController":3,"./IdleController":4}],6:[function(require,module,exports){
/**
 * Created by jerek0 on 14/02/2015.
 */

/**
 * STATE CONTROLLER
 * 
 * Each state controller must inherit this class * 
 * @* constructor
 */
var StateController = function () {
    // We put a red background by default
    this.stage = new PIXI.Stage(0x333333);
};

/**
 * Main loop of the state, to override *
 */
StateController.prototype.update = function() {
    //console.log('updating'); // This lags a lot !
};

/**
 * Function called when changing the state to prevent listeners duplication issues *
 * To override *
 */
StateController.prototype.onDestroy = function () {

};

module.exports = StateController;
},{}],7:[function(require,module,exports){
/**
 * Created by jerek0 on 15/02/2015.
 */

/**
 * GYROSCOPIC MANAGER
 * 
 * Allows to control a racket with a gyroscopic sensor *
 *  
 * @param racket
 * @constructor
 */
var GyroManager = function(racket) {
    this.racket = racket;

    this.lastPowerLaunch = Date.now();
    
    // HANDLERS 
    this.bindOrientationHandler = this.bindOrientation.bind(this);
    this.bindMotionHandler = this.bindMotion.bind(this);
    
    // Listeners
    window.addEventListener("deviceorientation", this.bindOrientationHandler);
    window.addEventListener("devicemotion", this.bindMotionHandler);

    requestAnimationFrame(this.update.bind(this));
};

/**
 * Managing the orientation of the device* 
 * @param e
 */
GyroManager.prototype.bindOrientation = function (e) {
    
    var gamma = e.gamma + 20; // -20 allows to play a little bended towards the player
    var percentage = 1 * gamma / -20; // Get the percentage of bending (max: -20, min: 20)
    
    if(percentage > 1) percentage = 1; // Can't go over 100%
    else if( percentage < -1) percentage = -1; // Can't go under -100%
    
    // Move the racket
    this.racket.position.deltaY += this.racket.acceleration * 4 * percentage;
};

/**
 * Managing the acceleration of the device *
 * @param e
 */
GyroManager.prototype.bindMotion = function (e) {
    if(((Date.now() - this.lastPowerLaunch) > 3000) && (e.acceleration.z > 5 || e.acceleration.z < -5)) {
        this.racket.firstPower();
        this.lastPowerLaunch = Date.now();
    }
};

/**
 * Main loop*
 */
GyroManager.prototype.update = function () {
    // TODO - See if it's usefull ?
    requestAnimationFrame(this.update.bind(this));
};

/**
 * Allowing to avoid listeners duplications issues *
 */
GyroManager.prototype.onDestroy = function () {
    window.removeEventListener("deviceorientation", this.bindOrientationHandler);
    window.removeEventListener("devicemotion", this.bindMotionHandler);
};

module.exports = GyroManager;
},{}],8:[function(require,module,exports){
/**
 * Created by jerek0 on 15/02/2015.
 */

/**
 * KEYS MANAGER
 * 
 * Allows to controller a racket with a keyboard *
 *
 * @param racket
 * @constructor
 */
var KeysManager = function(racket) {
    this.racket = racket;
    
    this.keyMap = {
        up: false,
        down: false,
        firstPower: false
    };

    this.lastPowerLaunch = Date.now();
    
    // HANDLERS
    this.bindKeyDownHandler = this.bindKeyDown.bind(this);
    this.bindKeyUpHandler = this.bindKeyUp.bind(this);
    
    // Listeners
    window.addEventListener('keydown', this.bindKeyDownHandler);
    window.addEventListener('keyup', this.bindKeyUpHandler);

    requestAnimationFrame(this.update.bind(this));
};

/**
 * On key down *
 * @param e
 */
KeysManager.prototype.bindKeyDown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    
    switch (key) {
        case 40:
            this.keyMap.down = true;
            break;
        case 38:
            this.keyMap.up = true;
            break;

        case 32: // SPACE BAR
            this.keyMap.firstPower = true;
            break;
    }
};

/**
 * On key up *
 * @param e
 */
KeysManager.prototype.bindKeyUp = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    
    switch (key) {
        case 40:
            this.keyMap.down = false;
            break;
        case 38: 
            this.keyMap.up = false;
            break;
            
        case 32: // SPACE BAR
            this.launchingPower = false;
            break;
    }
    
};

/**
 * Main loop *
 */
KeysManager.prototype.update = function () {
    
    // If a moving key is toggled, me move the racket
    if(this.keyMap.up) this.racket.position.deltaY += -this.racket.acceleration;
    if(this.keyMap.down) this.racket.position.deltaY += this.racket.acceleration;
    
    // If a power is toggled for the first time since at least 3000ms, we launch it
    if(this.keyMap.firstPower && !this.launchingPower && ((Date.now() - this.lastPowerLaunch) > 3000)) {
        this.racket.firstPower();
        this.keyMap.firstPower = false;
        this.launchingPower = true;
        this.lastPowerLaunch = Date.now();
    } else { // Else we cancel it
        this.keyMap.firstPower = false;
    }
    
    requestAnimationFrame(this.update.bind(this));
};

/**
 * Allows to avoid listeners duplications issues *
 */
KeysManager.prototype.onDestroy = function () {
    window.removeEventListener('keydown', this.bindKeyDownHandler);
    window.removeEventListener('keyup', this.bindKeyUpHandler);
};

module.exports = KeysManager;
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
/**
 * Created by jerek0 on 15/02/2015.
 */

/**
 * SCORE VIEW
 * @param position
 * @param value
 * @constructor
 */
var Score = function(position, value) {
    PIXI.DisplayObjectContainer.call( this );
    
    this.x = position.x;
    this.y = position.y;
    
    this.text = new PIXI.Text(value, { font: "bold 256px Slash", fill: "#4A3637", align: "center" });
    this.text.alpha = 0.5;
    this.addChild(this.text);
};
Score.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Score.prototype.constructor = Score;

/**
 * Function allowing to update the Score's value *
 * @param value
 */
Score.prototype.updateValue = function (value) {
    this.text.setText(value);
}

module.exports = Score;
},{}],11:[function(require,module,exports){
/**
 * Created by jerek0 on 22/02/2015.
 */

/**
 * Created by jerek0 on 22/02/2015.
 */
var Racket = require('./Racket');

/**
 * Blue racket *
 * @param position
 * @constructor
 */
var BlueFury = function(position) {
    Racket.call(this, position);

    // Specs
    this.acceleration = 1;
    this.friction = 0.95;

    // Power(s)
    this.powerName = 'reverseBallsAngles';

    // Graphics
    this.removeChild(this.graphics);
    this.graphics = new PIXI.Sprite.fromImage('img/hero2.png');
    this.graphics.width = this.graphics.width / 2;
    this.graphics.height = this.graphics.height / 2;
    this.faceTheRightWay();
    this.addChild(this.graphics);
};
BlueFury.prototype = Object.create(Racket.prototype);
BlueFury.prototype.constructor = BlueFury;

module.exports = BlueFury;
},{"./Racket":12}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
/**
 * Created by jerek0 on 22/02/2015.
 */
var Racket = require('./Racket');

/**
 * Red racket *
 * @param position
 * @constructor
 */
var RedFury = function(position) {
    Racket.call(this, position);
    
    // Specs
    this.acceleration = 3;
    
    // Power(s)
    this.powerName = 'duplicateBall';

    // Graphics
    this.removeChild(this.graphics);
    this.graphics = new PIXI.Sprite.fromImage('img/hero1.png');
    this.graphics.width = this.graphics.width / 2;
    this.graphics.height = this.graphics.height / 2;
    this.faceTheRightWay();
    this.addChild(this.graphics);
};
RedFury.prototype = Object.create(Racket.prototype);
RedFury.prototype.constructor = RedFury;


module.exports = RedFury;
},{"./Racket":12}],14:[function(require,module,exports){
/**
 * Created by jerek0 on 15/02/2015.
 */

/**
 * SCORE MANAGER
 * * @constructor
 */
var ScoreManager = function() {
    this.scores = [];
};

/**
 * Adds a player to the list of scores *
 * @param id
 */
ScoreManager.prototype.addPlayer = function (id) {
    this.scores[id] = 0;
};

/**
 * Get a player's score by it's ID *
 * @param id
 * @returns {*}
 */
ScoreManager.prototype.getScoreByPlayer = function (id) {
    return this.scores[id];
};

/**
 * Increment a player's score by it's ID *
 * @param id
 */
ScoreManager.prototype.incrementScore = function (id) {
    this.scores[id]++;
};

module.exports = ScoreManager;
},{}],15:[function(require,module,exports){
/**
 * Created by jerek0 on 14/02/2015.
 */

/**
 * SCENE
 * 
 * All the magic will happen in this DisplayObjectContainer *
 *
 * @param width
 * @param height
 * @constructor
 */
var Scene = function(width, height) {
    PIXI.DisplayObjectContainer.call( this );
    
    this.baseWidth = width;
    this.baseHeight = height;

    background = new PIXI.Graphics();
    background.beginFill(0xF3BD0B);
    background.drawRect(0, 0, this.baseWidth, this.baseHeight);
    this.addChild(background);
};

Scene.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Scene.prototype.constructor = Scene;

module.exports = Scene;
},{}],16:[function(require,module,exports){
/**
 * Created by jerek0 on 22/02/2015.
 */

/**
 * POWER BUTTON
 * 
 * Element of a PowersBar *
 * 
 * Allows to see if the power is ready to use or not * 
 * 
 * @param powerName
 * @constructor
 */
var PowerButton = function (powerName) {
    PIXI.DisplayObjectContainer.call( this );
    
    this.powerVisual = new PIXI.Sprite.fromImage('img/'+powerName+'.png');
    this.powerVisual.width = 48;
    this.powerVisual.height = 48;
    this.addChild(this.powerVisual);
};
PowerButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
PowerButton.prototype.constructor = PowerButton;

/**
 * Function called when the power is used, notifying the user that he can't use it for a moment *
 */
PowerButton.prototype.coolDown = function() {
    this.powerVisual.alpha = 0.2;
    
    var scope = this;
    setTimeout(function() {
        scope.powerVisual.alpha = 1;
    }, 3000);
}

module.exports = PowerButton;
},{}],17:[function(require,module,exports){
/**
 * Created by jerek0 on 22/02/2015.
 */

/**
 * Bar of available powers for the current player 
 * 
 * Only shows one for the moment but it may be useful for the future *
 * @type {exports}
 */
var PowerButton = require('./PowerButton');

var PowersBar = function (position) {
    PIXI.DisplayObjectContainer.call( this );
    
    this.position.x = position.x;
    this.position.y = position.y;
    
    this.powers = [];    
};
PowersBar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
PowersBar.prototype.constructor = PowersBar;

/**
 * Add a power visual to the list*
 * @param powerName
 */
PowersBar.prototype.addPower = function (powerName) {
    var power = new PowerButton(powerName);
    this.powers.push(power);
    this.powers[this.powers.length - 1].x = this.powers.length * this.powers[this.powers.length - 1].width;
    this.powers[this.powers.length - 1].x *= -1;
    this.powers[this.powers.length - 1].coolDown();
    this.addChild(this.powers[this.powers.length - 1]);
};

module.exports = PowersBar;
},{"./PowerButton":16}],18:[function(require,module,exports){
/**
 * Created by jerek0 on 10/02/2015.
 */
    
var CustomEventDispatcher = require('../events/CustomEventDispatcher');
var serverConfig = require('./serverConfig');


/**
 * SERVER DIALER *
 * 
 * This class is the main dialer with the server before the actual game state *
 * This class is accessible everywhere (set in global in the PageManager) * 
 * @constructor
 */
var ServerDialer = function() {
    this.init();
}
// Héritage de CustomEventDispatcher
ServerDialer.prototype = new CustomEventDispatcher();
ServerDialer.prototype.constructor = ServerDialer;

/**
 * Allows to connect to the game server and start listening for events *
 */
ServerDialer.prototype.init =  function() {
    this.socket = io.connect('http://'+serverConfig.url+':'+serverConfig.port);
    this.gameID = null;

    var scope = this;
    this.socket
        .on('connect', function() {
            console.log(Date() + ' - connectedToServer');
            scope.dispatchEvent({ type: 'connectedToServer'});
            scope.disconnected = false;
        })
        .on('connect_error', function(data) {
            if(!scope.disconnected) { // This condition allows to throw only one error
                scope.disconnected = true;
                alert(JSON.stringify(data));
            }
            console.log(Date()+' - Reconnect failed');
        });
    
    this.bindServerEvents();
};

/* ########################################### *
 * ############ SERVER LISTENERS ############# *
 * ########################################### *
 */

/**
 * Server events listener and manager *
 */
ServerDialer.prototype.bindServerEvents = function() {
    var scope = this;
    this.socket.on('newGameID', function(data) {
        scope.onNewGameID(data);
    });
    this.socket.on('newBridge', function() {
        scope.onNewBridge();
    });
    this.socket.on('connected', function(data) {
        scope.onConnected(data);
    });
    this.socket.on('rooms', function(data) {
        scope.dispatchEvent({ type: 'receivedRooms', data: data.rooms});
    });
    this.socket.on('expulsed', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'MatchmakingPage' });
        alert('A player has quit ! Leaving the room');
        scope.gameID=null;
    });
    this.socket.on('launchGame', function() {
        scope.dispatchEvent({ type: 'launchGame' });
    });
    this.socket.on('roomFull', function() {
        alert('This room is full, please try another one or host you own !');
    });
};

/**
 * Method called when the server answers positively to the room hosting request *
 * @param data
 */
ServerDialer.prototype.onNewGameID = function(data) {
    console.log('Received game id '+data.gameID);
    this.gameID = data.gameID;
    localStorage.setItem('PH-role', 'host');
};

/**
 * Method called when we've got a connection between a host and a client *
 */
ServerDialer.prototype.onNewBridge = function() {
    console.log('BRIDGE !');
    this.dispatchEvent({ type: 'bridge' });
};

/**
 * Method called when we've got a connection between a host and a client *
 */
ServerDialer.prototype.onConnected = function(data) {
    this.gameID = data.gameID;
    localStorage.setItem('PH-role', 'client');
    console.log('Connection with room '+this.gameID+' established');
    this.dispatchEvent({ type: 'changePage', newPage: 'GamePage' });
};

/* ########################################### *
 * ########### SERVER REQUESTS ############### *
 * ########################################### *
 * 
 * For each of these functions, the server's answer
 * will be catched in this.bindServerEvents()
 */

/**
 * Ask the server for the list of rooms *
 */
ServerDialer.prototype.askForRooms = function() {
    this.socket.emit('getRooms');
};

/**
 * Send the server a room hosting request *
 */
ServerDialer.prototype.hostRoom = function() {
    this.socket.emit('hostRoom', { character: localStorage.getItem('PH-character')});
};

/**
 * Ask the server to join an existing room *
 * @param id - The existing room id
 */
ServerDialer.prototype.joinRoom = function(id) {
    this.socket.emit('joinRoom', { gameID: id, character: localStorage.getItem('PH-character')});
    console.log('Asked to join room '+id);
};

/**
 * Ask the server to leave an existing room *
 */
ServerDialer.prototype.leaveRoom = function() {
    this.socket.emit('leaveRoom');
    this.gameID = null;
};

module.exports = ServerDialer;
},{"../events/CustomEventDispatcher":2,"./serverConfig":20}],19:[function(require,module,exports){
/**
 * Created by jerek0 on 14/02/2015.
 */
var CustomEventDispatcher = require('../events/CustomEventDispatcher');

/**
 * SERVER GAME UPDATER *
 * 
 * This is the second dialer with the server : in the actual game state *
 * This class sends requests to the host/client via the server and receives the host's/client's requests via the server *
 *  
 * @param socket
 * @param gameController
 * @constructor
 */
var ServerGameUpdater = function (socket, gameController) {
    this.socket = socket;
    this.gameController = gameController;
    
    this.bindServerEvents();
};
// Héritage de CustomEventDispatcher
ServerGameUpdater.prototype = new CustomEventDispatcher();
ServerGameUpdater.prototype.constructor = ServerGameUpdater;

/*
 #######################################
 ######### REQUESTS TO RECEIVE #########
 #######################################
 */

/**
 * Function managing every request that can be received *
 */
ServerGameUpdater.prototype.bindServerEvents = function () {
    var scope = this;
    
    // Handlers (necessary if we want to kill the listeners later ...)
    this.addBallHandler = function(data) { scope.gameController.addBall(data); };
    this.updateBallHandler = function(data) { scope.gameController.updateBall(data); };
    this.addPlayerHandler = function(data) { scope.gameController.addPlayer(data, false); }
    this.removeBallHandler = function(data) { scope.gameController.removeBall(data, false); };
    this.updatePlayerHandler = function(data) { scope.gameController.updatePlayer(data); };
    this.scoredHandler = function(data) { scope.gameController.onScore(data, false); };

    // Socket listeners, waiting for the other player's requests
    this.socket.on('addBall', this.addBallHandler);
    this.socket.on('updateBall', this.updateBallHandler);
    this.socket.on('addPlayer', this.addPlayerHandler);
    this.socket.on('removeBall', this.removeBallHandler);
    this.socket.on('updatePlayer', this.updatePlayerHandler);
    this.socket.on('scored', this.scoredHandler);
};

/**
 * Function allowing to kill the socket listeners, in order to avoid sockets duplications issues *
 */
ServerGameUpdater.prototype.unbindServerEvents = function () {
    this.socket.removeListener('addBall', this.addBallHandler);
    this.socket.removeListener('updateBall', this.updateBallHandler);
    this.socket.removeListener('addPlayer', this.addPlayerHandler);
    this.socket.removeListener('removeBall', this.removeBallHandler);
    this.socket.removeListener('updatePlayer', this.updatePlayerHandler);
    this.socket.removeListener('scored', this.scoredHandler);
};

/* 
   #######################################
   ######### REQUESTS TO SEND ############
   #######################################
   
   Every function below needs to specify the request name for the server to be able to
   treat every request the same way
 */

ServerGameUpdater.prototype.addBall= function(data) {
    data.event = 'addBall';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.removeBall= function(data) {
    data.event = 'removeBall';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.updateBall= function(data) {
    data.event = 'updateBall';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.addPlayer = function(data) {
    data.event = 'addPlayer';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.updatePlayer = function(data) {
    data.event = 'updatePlayer';
    this.socket.emit(data.event, data);
};

ServerGameUpdater.prototype.scored = function (data) {
    data.event = 'scored';
    this.socket.emit(data.event, data);
}

module.exports = ServerGameUpdater;
},{"../events/CustomEventDispatcher":2}],20:[function(require,module,exports){
/**
 * Created by jerek0 on 10/02/2015.
 */

var serverConfig = {
    url: "91.121.120.180",
    port: 9005
}

module.exports = serverConfig;
},{}],21:[function(require,module,exports){
(function (global){
/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

/**
 * CHOOSE CHARACTER PAGE * 
 * 
 * Here the user decides which character he want's to play by clicking on it's picture *
 * @constructor
 */
var ChooseCharacter = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    this.chooseCharacterHandler = this.chooseCharacter.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/choose_character.html');
};

// Héritage de Page
ChooseCharacter.prototype = new Page();
ChooseCharacter.prototype.constructor = ChooseCharacter;

/**
 *  Function called when the markup has been loaded and displayed *
 */
ChooseCharacter.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);

    // TODO Watch Memory Here
    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'TechnoPage' });
        global.serverDialer.leaveRoom();
    });
    
    this.bindUiActions();
};

/**
 * Bind User Interface Actions * 
 */
ChooseCharacter.prototype.bindUiActions = function() {
    this.registerCharacterChoosing();  
};

/**
 * Unbind User Interface Actions *
 */
ChooseCharacter.prototype.unbindUiActions = function() {
    this.destroyCharacterChoosing();
};

/**
 * Function listening for all the characters pictures, waiting for clicks *
 */
ChooseCharacter.prototype.registerCharacterChoosing = function() {
    this.characters = document.querySelectorAll('#characters-list .character');

    var i;
    for(i = 0; i < this.characters.length; i++) {
        this.characters[i].addEventListener('click', this.chooseCharacterHandler);
    }
};

/**
 * Removes the character's pictures listeners *
 */
ChooseCharacter.prototype.destroyCharacterChoosing = function() {
    var i;
    for(i = 0; i < this.characters.length; i++) {
        this.characters[i].removeEventListener('click', this.chooseCharacterHandler);
    }
};

/**
 * Function called when a character is choosed by a click on it's picture *
 * Leads to Matchmaking Page *
 * @param e
 */
ChooseCharacter.prototype.chooseCharacter = function(e) {
    console.log(e);
    localStorage.setItem('PH-character', e.target.dataset.character);
    this.dispatchEvent({ type: "changePage", newPage: "MatchmakingPage" });
};

module.exports = ChooseCharacter;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Page":25}],22:[function(require,module,exports){
(function (global){
/**
 * Created by jerek0 on 13/02/2015.
 */

var Page = require('./Page');

/**
 * GAME PAGE *
 * 
 * Here we first wait for the other player to be ready (if we're the host), then we jump straight into the game *
 * @constructor
 */
var GamePage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    this.onOtherPlayerReadyHandler = this.onOtherPlayerReady.bind(this);
    this.launchGameHandler = this.launchGame.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/game.html');
};

// Héritage de Page
GamePage.prototype = new Page();
GamePage.prototype.constructor = GamePage;

/**
 * Function called when the markup has been loaded and displayed *
 */
GamePage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);

    // TODO Watch Memory Here
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        global.serverDialer.leaveRoom();
    });
    
    var controls = document.getElementById("controls");
    controls.innerHTML = '<img src="img/'+localStorage.getItem('PH-tech')+'Controls.png" />';

    var roomNumber = document.getElementById("roomNumber");
    roomNumber.innerHTML = global.serverDialer.gameID;
    
    this.bindServerEvents();
};

/**
 * Listen for events coming from the server *
 */
GamePage.prototype.bindServerEvents = function () {
    global.serverDialer.addEventListener('bridge', this.onOtherPlayerReadyHandler);
    global.serverDialer.addEventListener('launchGame', this.launchGameHandler);
}

/**
 * When the players are ready, we notify the user and wait for the game launch *
 */
GamePage.prototype.onOtherPlayerReady = function() {
    global.serverDialer.removeEventListener('bridge', this.onOtherPlayerReadyHandler);
    document.getElementById("message").innerHTML = "Synced !";
};

/**
 * Here the fun begins ! Game launch *
 */
GamePage.prototype.launchGame = function () {
    global.serverDialer.removeEventListener('launchGame', this.launchGameHandler);
    document.getElementById("controls").innerHTML = "";
    document.getElementById("message").innerHTML = "";
    
    // We set the canvas to the game state : here we go !
    global.gameEngine.rendererController.setState('game');
};

/**
 * Override, called when page changes *
 */
GamePage.prototype.unbindUiActions = function() {
    global.serverDialer.removeEventListener('bridge', this.onOtherPlayerReadyHandler);
    global.serverDialer.removeEventListener('launchGame', this.launchGameHandler);
};

module.exports = GamePage;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Page":25}],23:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

/**
 * HOME PAGE *
 * @constructor
 */
var HomePage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/home.html');
};
// Héritage de Page
HomePage.prototype = new Page();
HomePage.prototype.constructor = HomePage;

/**
 * Function called when the markup has been loaded and displayed *
 */
HomePage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);
    
    // TODO Show btn only when connected to server
    // TODO Watch Memory Here
    var scope = this;
    var btnPlay = document.getElementById("btn-play");
    btnPlay.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'TechnoPage' });
    });
    
    // Show the user's current highscore
    var highscores = document.getElementById("highscore");
    highscores.innerHTML = localStorage.getItem('PH-highscore') ? localStorage.getItem('PH-highscore') : 0;
};

module.exports = HomePage;
},{"./Page":25}],24:[function(require,module,exports){
(function (global){
/**
 * Created by jerek0 on 09/02/2015.
 */

var Page = require('./Page');

/**
 * MATCHMAKING PAGE *
 * 
 * Here the users has the possibility to choose a gaming room or to host his own *
 * @constructor
 */
var MatchmakingPage = function() {
    
    // Functions handlers (necessary if we want to kill the listeners later ...)
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    this.populateRoomsHandler = this.populateRooms.bind(this);
    this.joinRoomHandler = this.joinRoom.bind(this);
    this.newHostHandler = this.hostRoom.bind(this);
    this.askForRoomsHandler = this.askForRooms.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/matchmaking.html');
};
// Héritage de Page
MatchmakingPage.prototype = new Page();
MatchmakingPage.prototype.constructor = MatchmakingPage;

/**
 * Function called when the markup has been loaded and displayed *
 */
MatchmakingPage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);

    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.innerHTML = localStorage.getItem('PH-tech');
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'TechnoPage' });
    });

    this.askForRooms();
    this.bindUiActions();
};

/**
 * Function managing UI actions *
 */
MatchmakingPage.prototype.bindUiActions = function () {
    this.btnHost = document.getElementById('btn-host');
    this.btnHost.addEventListener('click', this.newHostHandler);

    this.btnRefresh = document.getElementById('btn-refresh');
    this.btnRefresh.addEventListener('click', this.askForRoomsHandler);
};

/**
 * Unbind User Interface Actions*
 */
MatchmakingPage.prototype.unbindUiActions = function() {
    this.btnHost.removeEventListener('click', this.newHostHandler);
    this.btnRefresh.removeEventListener('click', this.askForRoomsHandler);
    this.destroyRoomChoosing();
};

/**
 * Generates the markup of each room available *
 * @param e - The event containing rooms
 */
MatchmakingPage.prototype.populateRooms = function(e) {
    global.serverDialer.removeEventListener('receivedRooms', this.populateRoomsHandler);
    
    // We have rooms available ! YAY !
    if(e.data.length) {
        var numberOfRooms = e.data.length,
            i;

        document.getElementById('rooms-list').innerHTML = '';
        for(i = 0; i < numberOfRooms; i++) {
            document.getElementById('rooms-list').innerHTML += '<li data-roomId="'+ e.data[i] +'">Room '+ e.data[i] +'</li>';
        }
        
    } 
    // We see no room ... :'(
    else {
        document.getElementById('rooms-list').innerHTML = '<li>No room available for now ...</li>';
    }

    // We listen now for a Room choosing
    this.registerRoomChoosing();
};

/**
 * Listen all the rooms for a click *
 */
MatchmakingPage.prototype.registerRoomChoosing = function() {
    this.rooms = document.querySelectorAll('#rooms-list li');
    
    var i;
    for(i = 0; i < this.rooms.length; i++) {
        this.rooms[i].addEventListener('click', this.joinRoomHandler);
    }
};

/**
 * Destroy the rooms listeners *
 */
MatchmakingPage.prototype.destroyRoomChoosing = function() {
    var i;
    for(i = 0; i < this.rooms.length; i++) {
        this.rooms[i].removeEventListener('click', this.joinRoomHandler);
    }
};

/* ########################################### *
 * ############# SERVER REQUESTS ############# *
 * ########################################### *
 */

MatchmakingPage.prototype.askForRooms = function() {
    // GET THE ROOMS
    global.serverDialer.askForRooms();
    global.serverDialer.addEventListener('receivedRooms', this.populateRoomsHandler);
};

/**
 * On click to a room, we try to join it *
 * @param e
 */
MatchmakingPage.prototype.joinRoom = function(e) {
    global.serverDialer.joinRoom(e.currentTarget.dataset.roomid);
};

/**
 * On click on the new host button, we notify the server *
 */
MatchmakingPage.prototype.hostRoom = function() {
    global.serverDialer.hostRoom();
    this.dispatchEvent({ type: 'changePage', newPage: 'GamePage' });
};

module.exports = MatchmakingPage;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Page":25}],25:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */
var CustomEventDispatcher = require('../events/CustomEventDispatcher');

/**
 * Page class *
 * 
 * Each of the pages will inherit from this *
 * Pages also need to inherit CustomEventDispatcher to allow them to dial with the PageManager *
 * @constructor
 */
var Page = function() {
    this.templateUrl = '';
}
// Héritage de CustomEventDispatcher
Page.prototype = new CustomEventDispatcher();
Page.prototype.constructor = Page;

/**
 * Change the HTML template file URL *
 * @param value
 */
Page.prototype.setTemplateUrl = function(value) {
    this.templateUrl = value;
    this.loadTemplate();
}

/**
 * Loads templateUrl with an XHR Ajax request and wait for it's response *
 */
Page.prototype.loadTemplate = function() {
    var scope = this;
    var xmlhttp;

    if(window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.open('GET', this.templateUrl, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                scope.dispatchEvent({ type: 'templateLoaded', data: xmlhttp.response });
            } else if(xmlhttp.status == 404) {
                alert('404 : Template not found');
            } else {
                alert('Error : '+xmlhttp.status);
            }
        }
    }
};

/**
 * This will be called on each page changement *
 * Need to be overriden when a page uses eventListeners *
 */
Page.prototype.unbindUiActions = function() {
    // Function to override !
};

module.exports = Page;
},{"../events/CustomEventDispatcher":2}],26:[function(require,module,exports){
(function (global){
/**
 * Created by jerek0 on 08/02/2015.
 */

var HomePage = require('./HomePage');
var TechnoPage = require('./TechnoPage');
var MatchmakingPage = require('./MatchmakingPage');
var ChooseCharacterPage = require('./ChooseCharacterPage');
var GamePage = require('./GamePage');

/**
 * This is the page manager *
 * Here we manage the pages, the transitions and the routing, manually *
 * @param pageContainer - We have to give the DOM element in which we are going to put our pages
 * @constructor
 */
var PageManager = function(pageContainer) {
    this.pageContainer = pageContainer;
    this.changePage('HomePage');

    // Start listening for any request to change the page
    global.serverDialer.addEventListener('changePage', this.onChangePageHandler);
};

/**
 * This one allows to go from one page to another *
 * 
 * This function also manage the transition between pages and the unbinding of the pages listeners *
 * In case of a GamePage, we change the canvas state (which is behind) *
 * @param newPage
 */
PageManager.prototype.changePage = function(newPage) {
    var scope = this;
    
    // Function handlers
    this.onTemplateLoadedHandler = this.onTemplateLoaded.bind(this);
    this.onChangePageHandler = this.onChangePage.bind(this);
    
    // If there was already a page before we wanted to change, we unbind every listener
    if(this.currentPage) {
        this.currentPage.unbindUiActions();

        // If the last page was a GamePage, we put the canvas in "Idle" state
        if(this.currentPage instanceof GamePage) global.gameEngine.rendererController.setState('idle');
    }

    // The actual page switching
    // We need to add any new pages here because of a browserify issue
    switch (newPage) {
        case "HomePage":
            this.currentPage = new HomePage();
            break;
        case "TechnoPage":
            this.currentPage = new TechnoPage();
            break;
        case "MatchmakingPage":
            this.currentPage = new MatchmakingPage();
            break;
        case "ChooseCharacterPage":
            this.currentPage = new ChooseCharacterPage();
            break;
        case "GamePage":
            this.currentPage = new GamePage();
            break;
        default:
            this.currentPage = new HomePage();
    }
    
    // Once we changed the page, we wait for it's template loading and for any request to change page again
    this.currentPage.addEventListener('templateLoaded', this.onTemplateLoadedHandler);
    this.currentPage.addEventListener('changePage', this.onChangePageHandler);
};

/**
 * Function called when a page changement is requested *
 * @param e
 */
PageManager.prototype.onChangePage = function (e) {
    this.changePage(e.newPage);
    //console.log('changingpage');
    this.currentPage.removeEventListener('changePage', this.onChangePageHandler);
};

/**
 * Function called when the XHR request loaded the HTML template and is ready to show *
 * @param e
 */
PageManager.prototype.onTemplateLoaded = function(e) {
    this.updateView(e.data);
    this.currentPage.removeEventListener('templateLoaded', this.onTemplateLoadedHandler);
};

/**
 * Modifies the current template to put the currentPage's one *
 * @param template
 */
PageManager.prototype.updateView = function(template) {
    this.pageContainer.classList.remove('bounceIn');
    
    var scope = this;
    setTimeout(function() {
        scope.pageContainer.innerHTML = template;
        scope.pageContainer.classList.add('bounceIn');
        scope.currentPage.dispatchEvent({ type: 'pageDisplayed' });
    }, 50);
};

module.exports = PageManager;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ChooseCharacterPage":21,"./GamePage":22,"./HomePage":23,"./MatchmakingPage":24,"./TechnoPage":27}],27:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

/**
 * TECHNO PAGE *
 * 
 * Here the user decides of the technology he will use to play *
 * We store that information in the localStorage to use it later *
 * @constructor
 */
var TechnoPage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    
    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/techno.html');
};

// Héritage de Page
TechnoPage.prototype = new Page();
TechnoPage.prototype.constructor = TechnoPage;

/**
 * Function called when the markup has been loaded and displayed *
 */
TechnoPage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);
    
    this.bindUiEvents();
};

/**
 * Event listeners management *
 */
TechnoPage.prototype.bindUiEvents = function() {
    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'HomePage' });
    });
    
    this.registerTechnoChoosing();
};

/**
 * Here we listen for all the tech buttons in the markup *
 */
TechnoPage.prototype.registerTechnoChoosing = function() {
    this.chooseTechnoHandler = this.chooseTechno.bind(this);
    
    // Listen to every technoChooser
    this.technoChoosers = document.querySelectorAll('.enabled .techno-chooser');
    var numberOfTechnos = this.technoChoosers.length;
    var i;
    for(i = 0; i < numberOfTechnos; i++) {
        this.technoChoosers[i].addEventListener('click', this.chooseTechnoHandler);
    }
};

/**
 * Destroy the tech button's listeners * 
 */
TechnoPage.prototype.destroyTechnoChoosing = function() {
    var numberOfTechnos = this.technoChoosers.length;
    var i;
    for(i = 0; i < numberOfTechnos; i++) {
        this.technoChoosers[i].removeEventListener('click', this.chooseTechnoHandler);
    }
};

/**
 * Function called when a tech is choosed by clicking on it's button *
 * Lead to the ChooseCharacterPage *
 * @param e
 */
TechnoPage.prototype.chooseTechno = function(e) {
    console.log(e);
    localStorage.setItem('PH-tech', e.target.dataset.tech);
    this.destroyTechnoChoosing();
    this.dispatchEvent({ type: 'changePage', newPage: 'ChooseCharacterPage' });
};

module.exports = TechnoPage;
},{"./Page":25}]},{},[1]);
