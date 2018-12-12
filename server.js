'use strict';
var nconf = require('nconf');
nconf.file({ file: './config.json' });

var express = require('express'),
    app = express(),
    port = nconf.get('httpPort'),
    mongoose = require('mongoose'),
    Games = require('./api/models/gameModel'), //created model loading here
    ShipPositions = require('./api/models/shipPositionModel'),
    bodyParser = require('body-parser');

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/' + nconf.get('DatabaseName'), { useNewUrlParser: true });


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/battleshipRoutes'); //importing route
routes(app); //register the route


app.listen(port);

module.exports = app;
console.log('Battleship API server started on: ' + port);
