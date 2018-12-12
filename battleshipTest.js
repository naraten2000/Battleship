//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Games = require('./api/models/gameModel');
let ShipPositions = require('./api/models/shipPositionModel');

//Require dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

//Our parent block
describe('Games', () => {
    before((done) => { //Before each test we reset the game
        
        chai.request(server)
            .get('/reset')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                done();
            });
    });

    /*
    * Test the /GET route
    */
    it('Place a ship out of grid', function (done) {
        this.timeout(10000);
        
        chai.request(server)
            .get('/ship/submarine-11-1-vertical')
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.message.should.be.eql('Invalid coordinate');
                done();
            });
    });

    /*
      * Test the /GET route
      */
    it('Place invalid ship type', function (done) {
        this.timeout(10000);

        var invalidShipType = "invalidship";
        chai.request(server)
            .get('/ship/' + invalidShipType + '-11-1-vertical')
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.message.should.be.eql('Invalid ship type: ' + invalidShipType);
                done();
            });
    })

    /*
    * Test the /GET route
    */
    it('Place too many ships more than allowed limit', function (done) {
        this.timeout(15000);
        setTimeout(() => {
            chai.request(server)
                .get('/ship/battleship-1-1-vertical')
                .end(function (err, res) { });
        }, 1000);

        setTimeout(() => {
            chai.request(server)
                .get('/ship/battleship-3-1-vertical')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('Cannot have more than 1 of battleship');
                    done();
                 });
        }, 5000);
    });

    /*
    * Test the /GET route
    */
    it('Place overlapped position', function (done) {
        this.timeout(15000);

        setTimeout(() => {
            chai.request(server)
            .get('/ship/submarine-1-1-vertical')
            .end(function (err, res) { });
        }, 1000);

        setTimeout(() => {
            chai.request(server)
                .get('/ship/submarine-2-1-vertical')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('Overlapped position or close to another ship');
                    done();
                });
        }, 2000);
    });

    /*
    * Test the /GET route
    */
    it('Place all ships', function (done) {
        this.timeout(15000);
        // Reset
        setTimeout(() => {
            chai.request(server)
                .get('/reset')
                .end(function (err, res) { });
        }, 1000);


        setTimeout(() => {
            // Place battleship
            chai.request(server)
                .get('/ship/battleship-1-1-vertical')
                .end(function (error, response) { });
        }, 2000);

        // Place cruiser 1
        setTimeout(() => {
            chai.request(server)
                .get('/ship/cruiser-3-1-vertical')
                .end(function (error, response) { });
        }, 2500);

        // Place cruiser 2
        setTimeout(() => {
            chai.request(server)
                .get('/ship/cruiser-5-1-vertical')
                .end(function (error, response) { });
        }, 3000);

        // Place destroye 1
        setTimeout(() => {
            chai.request(server)
                .get('/ship/destroyer-7-1-vertical')
                .end(function (error, response) { });
        }, 3500);

        // Place destroye 2
        setTimeout(() => {
            chai.request(server)
                .get('/ship/destroyer-9-1-vertical')
                .end(function (error, response) { });
        }, 4000);

        // Place destroye 3
        setTimeout(() => {
            chai.request(server)
                .get('/ship/destroyer-1-6-vertical')
                .end(function (error, response) { });
        }, 4500);

        // Place submarine 1
        setTimeout(() => {
            chai.request(server)
                .get('/ship/submarine-1-9-vertical')
                .end(function (error, response) { });
        }, 5000);

        // Place submarine 2
        setTimeout(() => {
            chai.request(server)
                .get('/ship/submarine-3-9-vertical')
                .end(function (error, response) { });
        }, 5500);

        // Place submarine 3
        setTimeout(() => {
            chai.request(server)
                .get('/ship/submarine-5-9-vertical')
                .end(function (error, response) { });
        }, 6000);

        // Place submarine 4
        setTimeout(() => {
            chai.request(server)
                .get('/ship/submarine-7-9-vertical')
                .end(function (error, response) { });
        }, 6500);

        setTimeout(() => {
            done();
        }, 7000);
    });

    /*
    * Test the /GET route
    */
    it('Attack empty square', function (done) {
        chai.request(server)
            .get('/attack/2-1-vertical')
            .end(function (error, response) {
                response.should.have.status(200);
                response.body.message.should.be.eql('Miss');
                done();
                });
    });

    /*
    * Test the /GET route
    */
    it('Attack a ship position', function (done) {
        chai.request(server)
            .get('/attack/1-1-vertical')
            .end(function (error, response) {
                response.should.have.status(200);
                response.body.message.should.be.eql('Hit');
                done();
            });
    });

    /*
    * Test the /GET route
    */
    it('Attack until a battleship sunk', function (done) {
        this.timeout(15000);

        // Attack battleship
        setTimeout(() => {
            chai.request(server)
                .get('/attack/1-1')
                .end(function (error, response) { });
        }, 1000);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/1-2')
                .end(function (error, response) { });
        }, 1500);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/1-3')
                .end(function (error, response) { });
        }, 2000);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/1-4')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('You just sank battleship');
                    done();
                });
        }, 2500);
    });

    /*
    * Test the /GET route
    */
    it('Attack until all cruisers sunk', function (done) {
        this.timeout(15000);

        // Attack cruiser 1
        setTimeout(() => {
            chai.request(server)
                .get('/attack/3-1')
                .end(function (error, response) { });
        }, 1000);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/3-2')
                .end(function (error, response) { });
        }, 1500);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/3-3')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('You just sank cruiser');
                });
        }, 2000);


        // Attack cruiser 2
        setTimeout(() => {
            chai.request(server)
                .get('/attack/5-1')
                .end(function (error, response) { });
        }, 2500);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/5-2')
                .end(function (error, response) { });
        }, 3000);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/5-3')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('You just sank cruiser');
                    done();
                });
        }, 3500);
    });

    /*
    * Test the /GET route
    */
    it('Attack until all destroyers sunk', function (done) {
        this.timeout(15000);

        // Attack destroyer 1
        setTimeout(() => {
            chai.request(server)
                .get('/attack/7-1')
                .end(function (error, response) { });
        }, 1000);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/7-2')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('You just sank destroyer');
                });
        }, 2000);

        // Attack destroyer 2
        setTimeout(() => {
            chai.request(server)
                .get('/attack/9-1')
                .end(function (error, response) { });
        }, 2500);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/9-2')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('You just sank destroyer');
                });
        }, 3000);

        // Attack destroyer 3
        setTimeout(() => {
            chai.request(server)
                .get('/attack/1-6')
                .end(function (error, response) { });
        }, 3500);

        setTimeout(() => {
            chai.request(server)
                .get('/attack/1-7')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('You just sank destroyer');
                    done();
                });
        }, 4000);
    });

    /*
    * Test the /GET route
    */
    it('Attack until all ships sunk and game over', function (done) {
        this.timeout(15000);

        // Attack submarine 1
        setTimeout(() => {
            chai.request(server)
                .get('/attack/1-9')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('You just sank submarine');
                });
        }, 1000);

        // Attack submarine 2
        setTimeout(() => {
            chai.request(server)
                .get('/attack/3-9')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('You just sank submarine');
                });
        }, 1500);

        // Attack submarine 3
        setTimeout(() => {
            chai.request(server)
                .get('/attack/5-9')
                .end(function (error, response) {
                    response.should.have.status(200);
                    response.body.message.should.be.eql('You just sank submarine');
                });
        }, 2000);

        // Attack submarine 4
        setTimeout(() => {
            chai.request(server)
                .get('/attack/7-9')
                .end(function (error, response) {
                    response.should.have.status(200);
                    expect(response.body.message).to.include('Game over');
                    done();
                });
        }, 2500);
    });
});