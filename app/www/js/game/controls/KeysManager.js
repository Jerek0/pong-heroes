/**
 * Created by jerek0 on 15/02/2015.
 */

var KeysManager = function(racket) {
    this.racket = racket;
    
    this.keyMap = {
        up: false,
        down: false
    }
    
    window.addEventListener('keydown', this.bindKeyDown.bind(this), false);
    window.addEventListener('keyup', this.bindKeyUp.bind(this), false);

    requestAnimationFrame(this.update.bind(this));
};

KeysManager.prototype.bindKeyDown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    console.log(key);
    
    switch (key) {
        case 40:
            this.keyMap.down = true;
            break;
        case 38:
            this.keyMap.up = true;
            break;

        case 65: // A
        case 81: // Q
            this.keyMap.firstPower = true;
            break;

        case 90: // Z
        case 87: // W
            this.keyMap.secondPower = true;
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
            
        case 65:
        case 81:
        case 90:
        case 87:
            this.launchingPower = false;
            break;
    }
    
};

KeysManager.prototype.update = function () {
    if(this.keyMap.up) this.racket.position.deltaY += -this.racket.acceleration;
    if(this.keyMap.down) this.racket.position.deltaY += this.racket.acceleration;
    
    if(this.keyMap.firstPower && !this.launchingPower) {
        this.racket.firstPower();
        this.keyMap.firstPower = false;
        this.launchingPower = true;
    }
    if(this.keyMap.secondPower && !this.launchingPower) {
        this.racket.secondPower();
        this.keyMap.secondPower = false;
        this.launchingPower = true;
    }
    
    requestAnimationFrame(this.update.bind(this));
};

module.exports = KeysManager;