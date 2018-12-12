'use strict';
module.exports = function (app) {
    var battleshipController = require('../controllers/battleshipController');

    // todoList Routes
    app.route('/')
        .get(battleshipController.debug);

    app.route('/reset')
        .get(battleshipController.reset);

    app.route('/ship/:shipType-:xPos-:yPos-:direction')
        .get(battleshipController.ship);

    app.route('/attack/:xPos-:yPos').get(battleshipController.attack);
};
