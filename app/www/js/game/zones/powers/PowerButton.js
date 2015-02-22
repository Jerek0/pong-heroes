/**
 * Created by jerek0 on 22/02/2015.
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

PowerButton.prototype.coolDown = function() {
    this.powerVisual.alpha = 0.2;
    
    var scope = this;
    setTimeout(function() {
        scope.powerVisual.alpha = 1;
    }, 3000);
}

module.exports = PowerButton;