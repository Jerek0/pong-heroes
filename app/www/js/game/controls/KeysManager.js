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
    
    switch (key) {
        case 40:
            this.keyMap.down = true;
            break;
        case 38:
            this.keyMap.up = true;
            break;
    }
};

KeysManager.prototype.bindKeyUp = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    
    switch (key) {
        case 40:
            this.keyMap.down = false;
        case 38: 
            this.keyMap.up = false;
    }
    
}

KeysManager.prototype.update = function () {
    if(this.keyMap.up) this.racket.position.deltaY += -this.racket.acceleration;
    if(this.keyMap.down) this.racket.position.deltaY += this.racket.acceleration;
    
    requestAnimationFrame(this.update.bind(this));
};

module.exports = KeysManager;