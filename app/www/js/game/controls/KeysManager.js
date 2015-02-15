/**
 * Created by jerek0 on 15/02/2015.
 */

var KeysManager = function(racket) {
    this.racket = racket;
    
    window.addEventListener('keydown', this.bindKeyDown.bind(this), false);
};

KeysManager.prototype.bindKeyDown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    
    switch (key) {
        case 40:
            this.racket.position.deltaY = 5;
            break;
        case 38:
            this.racket.position.deltaY = -5;
            break;
    }
    
    console.log(e);

};

module.exports = KeysManager;