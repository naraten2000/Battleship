'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var GameSchema = new Schema({
    status: {
        type: String,
        enum: ['started', 'ended'],
        required: 'Kindly enter the status of the game'
    },
    start_at: {
        type: Date,
        default: Date.now
    },
    end_at: {
        type: Date
    },
    total_shots: {
        type: Number,
        default: 0
    },
    missed_shots: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Games', GameSchema);