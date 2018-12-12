/**
 * @file 
 * Provides exported functions for battleship controller.
 *
 */
'use strict';

var mongoose = require('mongoose'),
    Games = mongoose.model('Games');

/**
 * Create a new game.
 * 
 * Provides the ability to create a new game.
 * 
 * @constructor
 *
 * @param request
 *   HTTP request object.
 */
exports.createNewGame = function (res) {
    var new_game = new Games({
        status: 'started'
    });
    new_game.save(function (err, game) {
        if (err)
            res.send(err);
        return game;
    });
}

/**
 * End a game.
 * 
 * Provides the ability to end a game by setting status to 'ended' with end_at = current time.
 * 
 * @constructor
 *
 * @param error
 *   Error object.
 * @param game
 *   Game object.
 */
exports.endGame = function (err, game) {
    if (game != null) {
        game.status = 'ended';
        game.end_at = new Date();

        game.save(function (err2, game2) {
            if (err2)
                res.send(err2);
        });
    }
}

/**
 * Increment total shots.
 * 
 * Provides the ability to increase total shots.
 * 
 * @constructor
 *
 * @param game
 *   Current game.
 *
 * @param increaseTotal
 *   boolean idicate to increase total shots.
 *
 * @param increaseMiss
 *   boolean idicate to increase missed shots.
 */
exports.incrementShots = function (game, increaseTotal, increaseMiss) {
    if (increaseTotal)
        game.total_shots++;

    if (increaseMiss)
        game.missed_shots++;

    game.save(function (err, game) {
        if (err)
            console.log(err);
        return game;
    });
}