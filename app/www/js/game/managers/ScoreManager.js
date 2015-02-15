/**
 * Created by jerek0 on 15/02/2015.
 */
    
var ScoreManager = function() {
    this.scores = [];
};

ScoreManager.prototype.addPlayer = function (id) {
    this.scores[id] = 0;
};

ScoreManager.prototype.getScoreByPlayer = function (id) {
    return this.scores[id];
};

ScoreManager.prototype.incrementScore = function (id) {
    this.scores[id]++;
};

module.exports = ScoreManager;