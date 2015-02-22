/**
 * Created by jerek0 on 15/02/2015.
 */

var KeysManager = function(racket) {
    this.racket = racket;
    
    this.keyMap = {
        up: false,
        down: false
    };

    this.lastPowerLaunch = Date.now();
    
    // HANDLERS
    this.bindKeyDownHandler = this.bindKeyDown.bind(this);
    this.bindKeyUpHandler = this.bindKeyUp.bind(this);
    
    window.addEventListener('keydown', this.bindKeyDownHandler);
    window.addEventListener('keyup', this.bindKeyUpHandler);

    requestAnimationFrame(this.update.bind(this));
};

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

KeysManager.prototype.update = function () {
    if(this.keyMap.up) this.racket.position.deltaY += -this.racket.acceleration;
    if(this.keyMap.down) this.racket.position.deltaY += this.racket.acceleration;
    
    if(this.keyMap.firstPower && !this.launchingPower && ((Date.now() - this.lastPowerLaunch) > 3000)) {
        this.racket.firstPower();
        this.keyMap.firstPower = false;
        this.launchingPower = true;
        this.lastPowerLaunch = Date.now();
    } else {
        this.keyMap.firstPower = false;
    }
    
    requestAnimationFrame(this.update.bind(this));
};

KeysManager.prototype.onDestroy = function () {
    window.removeEventListener('keydown', this.bindKeyDownHandler);
    window.removeEventListener('keyup', this.bindKeyUpHandler);
};

module.exports = KeysManager;