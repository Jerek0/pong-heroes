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