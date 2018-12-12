/**
 * @file 
 * Provides exported functions for battleship controller.
 *
 */
'use strict';

var nconf = require('nconf');
var battleshipInternal = require('./battleshipInternal');

var mongoose = require('mongoose'),
    Games = mongoose.model('Games'),
    ShipPositions = mongoose.model('ShipPositions');

/**
 * Debug a game.
 * 
 * Provides the ability to debug a game and see game details and ship position details.
 * 
 * @constructor
 *
 * @param request
 *   HTTP request object.
 * @param response
 *   HTTP response object.
 */
exports.debug = function (req, res) {
    // Aggregate ship positions with games
    Games.aggregate([{
        $lookup: {
            from: 'shippositions',
            localField: '_id',
            foreignField: 'game_id',
            as: 'Position'
        }}]).exec(
        function (err, game) {
            if (game != null) {
                res.send(game);
            }
        }
    );
}

/**
 * Reset a game.
 * 
 * Provides the ability to reset game to initial stage, clear all data, total shots, missed shots and ship placements.
 * 
 * @constructor
 *
 * @param request
 *   HTTP request object.
 * @param response
 *   HTTP response object.
 */
exports.reset = function (req, res) {
    // Set status of previous game to end
    Games.findOne().sort('-start_at').exec(
        battleshipInternal.endGame
    );

    // Create new game
    battleshipInternal.createNewGame(res);
    res.json({ message: "reset successfully" });
}

/**
 * Place a ship on grid.
 * 
 * Provides the ability to place a ship with ship type, x-y coordinate and placement direction (vertical or horizontal).
 * 
 * @constructor
 *
 * @param request
 *   HTTP request object.
 * @param response
 *   HTTP response object.
 */
exports.ship = function (req, res) {
    // Prepare variables
    var shipType = req.params.shipType;
    var xPos = parseInt(req.params.xPos);
    var yPos = parseInt(req.params.yPos);
    var direction = req.params.direction;
    var grid_size = nconf.get('grid_size');
    var ship_size = nconf.get(shipType + '_size');

    // Pre-calculate values
    var isHorizontalDirection = direction == 'horizontal';
    var xTargetMaxPosition = xPos + (isHorizontalDirection ? ship_size : 0);
    var yTargetMaxPosition = yPos + (!isHorizontalDirection ? ship_size : 0);

    // Validate ship type;
    if (ship_size == undefined) {
        res.json({ message: 'Invalid ship type: ' + shipType });
    } // Validate if it's out of grid area
    else if (xTargetMaxPosition > grid_size || yTargetMaxPosition > grid_size) {
        res.json({ message: 'Invalid coordinate' });
    } else {
        // Get latest game
        Games.findOne().sort('-start_at').exec(
            function (err, game) {
                if (game == null) // Ask to reset if game is not started
                    res.json({ message: 'Please reset the game for the first time play' });
                else {
                    // Find existing ships with the same ship type
                    ShipPositions.find({ 'game_id': game._id, 'ship_type': shipType }).distinct('ship_number', function (error, ids) {
                        // Validate max ships
                        var maxShipNumber = nconf.get(shipType + '_max_number');
                        var numberOfCurrentShips = ids.length;

                        // Show validation error if number of existing ships is greater than or equal the max number
                        if (numberOfCurrentShips >= maxShipNumber)
                            res.json({ message: 'Cannot have more than ' + maxShipNumber + ' of ' + shipType });
                        else {
                            // Validate position to place
                            // X-Position coverage
                            var xMin = xPos - 1;
                            var xMax = xPos + (isHorizontalDirection ? ship_size : 1);

                            // Y-Position coverage
                            var yMin = yPos - 1;
                            var yMax = yPos + (!isHorizontalDirection ? ship_size : 1);

                            // Find if the input x-y coordinate is overlapped with existing ships
                            ShipPositions.find({ 'game_id': game._id }).
                                where('x_pos').gte(xMin).lte(xMax).
                                where('y_pos').gte(yMin).lte(yMax).
                                exec(function (err, positions) {
                                    // Show illegal message if overlap found
                                    if (positions.length > 0)
                                        res.json({ message: 'Overlapped position or close to another ship' });
                                    else {
                                        // Save position to database
                                        for (var i = 0; i < ship_size; i++) {
                                            var new_pos = new ShipPositions({
                                                game_id: game._id,
                                                ship_type: shipType,
                                                ship_number: shipType.charAt(0) + numberOfCurrentShips,
                                                x_pos: xPos + (isHorizontalDirection ? i : 0),
                                                y_pos: yPos + (!isHorizontalDirection ? i : 0)
                                            });

                                            new_pos.save(function (err, game) {
                                                if (err)
                                                    res.send(err);
                                            });
                                        }
                                        // Confirm the ship placement
                                        res.json({ message: 'Placed ' + shipType });
                                    }
                            });

                        }
                    });
                }
            });
    }   
}

/**
 * Attack a ship on grid.
 * 
 * Provides the ability to attack a ship on grid with x-y coordinate specified.
 * 
 * @constructor
 *
 * @param request
 *   HTTP request object.
 * @param response
 *   HTTP response object.
 */
exports.attack = function (req, res) {
    // Prepare variables
    var xPos = parseInt(req.params.xPos);
    var yPos = parseInt(req.params.yPos);

    // Get latest game
    Games.findOne().sort('-start_at').exec(
        function (err, game) {
            if (game == null) // Ask to reset if game is not started
                res.json({ message: 'Please reset the game for the first time play' });
            else {
                // All ships need to be placed before the player can attack
                var totalShipNumber = nconf.get('total_ship_number');
                ShipPositions.find({ 'game_id': game._id }).distinct('ship_number', function (error, ships) {
                    if (ships.length < totalShipNumber)
                        res.json({ message: 'Unauthorized as the fleet is not empty' });
                    else {
                        // Find if the x-y coordinate hits a ship
                        ShipPositions.find({ 'game_id': game._id, 'x_pos': xPos, 'y_pos': yPos }).exec(function (error, positions) {
                            if (positions.length > 0) {

                                // Increment total shots
                                battleshipInternal.incrementShots(game, true, false);

                                var position = positions[0];

                                // Check if the coordinate is already hit
                                if (position.is_hit == 'yes')
                                    res.json({ message: 'Bad request as player attempt to attack any attacked coordinates' });
                                else {
                                    // Update hit to database
                                    ShipPositions.updateOne({ game_id: game._id, x_pos: xPos, y_pos: yPos }, { $set: { is_hit: 'yes' } },
                                        function (error, positions) {
                                            if (err)
                                                res.send(err);
                                            else {
                                                // Check if the attacked ship is sunk
                                                ShipPositions.find({ 'game_id': game._id, 'ship_number': position.ship_number, 'is_hit': 'no' }).exec(function (error2, positions2) {
                                                    if (positions2.length == 0) {

                                                        // Check if game is over
                                                        ShipPositions.find({ 'game_id': game._id, 'is_hit': 'no' }).exec(function (error3, positions3) {
                                                            if (positions3.length == 0) {
                                                                res.json({ message: 'Game over, number of shots is ' + (game.total_shots + 1) + ' and missed shots is ' + game.missed_shots });

                                                            }
                                                            else
                                                                res.json({ message: 'You just sank ' + position.ship_type });
                                                        });
                                                    }
                                                    else
                                                        res.json({ message: 'Hit' });
                                                });
                                            }
                                        });
                                }
                            }
                            else {
                                // Increment total shots
                                battleshipInternal.incrementShots(game, true, true);
                                res.json({ message: 'Miss' });
                            }
                        });
                    }
                });
            }
        });
}