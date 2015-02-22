/**
 * Created by jerek0 on 15/02/2015.
 */

/**
 * SCORE MANAGER
 * * @constructor
 */
var ScoreManager = function() {
    this.scores = [];
};

/**
 * Adds a player to the list of scores *
 * @param id
 */
ScoreManager.prototype.addPlayer = function (id) {
    this.scores[id] = 0;
};

/**
 * Get a player's score by it's ID *
 * @param id
 * @returns {*}
 */
ScoreManager.prototype.getScoreByPlayer = function (id) {
    return this.scores[id];
};

/**
 * Increment a player's score by it's ID *
 * @param id
 */
ScoreManager.prototype.incrementScore = function (id) {
    this.scores[id]++;
};

module.exports = ScoreManager;