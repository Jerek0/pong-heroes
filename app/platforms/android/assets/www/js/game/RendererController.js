/**
 * Created by jerek0 on 14/02/2015.
 */
var GameController = require('./GameController');
var IdleController = require('./IdleController');
    
var RendererController = function (wrapperId) {
    this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, { view: document.getElementById(wrapperId) });

    this.setState('idle');
    
    var scope = this;
    global.assetsLoader = new PIXI.AssetLoader([
        "img/ball.png",
        "img/background.png"
    ]).on('onComplete', function() {
        requestAnimationFrame(scope.update.bind(scope));
    });
    global.assetsLoader.load();
};

RendererController.prototype.setState = function(state) {
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

RendererController.prototype.update = function () {
    this.state.update();
    
    this.renderer.render(this.state.stage);
    requestAnimationFrame(this.update.bind(this));
}

module.exports = RendererController;