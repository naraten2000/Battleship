'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PositionSchema = new Schema({
    game_id: {
        type: Schema.ObjectId,
        required: 'Kindly enter the game ID of the position'
    },
    ship_type: {
        type: String,
        enum: ['battleship', 'cruiser', 'destroyer', 'submarine'],
        required: 'Kindly enter the ship type'
    },
    ship_number: {
        type: String,
        required: 'Kindly enter the ship number'
    },
    x_pos: {
        type: Number,
        required: 'Kindly enter the X-position'
    },
    y_pos: {
        type: Number,
        required: 'Kindly enter the Y-position'
    },
    is_hit: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    }
});

module.exports = mongoose.model('ShipPositions', PositionSchema);