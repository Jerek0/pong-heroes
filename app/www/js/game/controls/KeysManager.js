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