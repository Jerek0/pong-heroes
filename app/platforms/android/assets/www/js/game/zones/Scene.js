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