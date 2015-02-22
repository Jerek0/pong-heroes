/**
 * Created by jerek0 on 22/02/2015.
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

PowersBar.prototype.addPower = function (powerName) {
    var power = new PowerButton(powerName);
    this.powers.push(power);
    this.powers[this.powers.length - 1].x = this.powers.length * this.powers[this.powers.length - 1].width;
    this.powers[this.powers.length - 1].x *= -1;
    this.powers[this.powers.length - 1].coolDown();
    this.addChild(this.powers[this.powers.length - 1]);
};

module.exports = PowersBar;