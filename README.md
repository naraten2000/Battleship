## Task: Implement the API endpoints for Battleship



#### Pre-requisite software needed

1. Node JS for running node app

2. Mocha for running unit tests, to install, run the command below:

   > ```
   > $ npm install --global mocha
   > ```



#### Node Packages Required in the Project

1. chai for creating an API request in unit test 
2. chai-http is used with chai to create HTTP request to the API endpoints
3. express, an MVC framework for Node JS that we can create routing and controller on top of it
4. mongoose, a MongoDB ODM
5. nconfig, it allows us to load data from a configuration file (we have config.json in the project) to dictionary that we can use it in the code


#### Source code location

Please get from the link below:

> https://github.com/naraten2000/Battleship.git



#### Running Battleship API Server

1. Go to the directory we clone the Battleship project
2. Run command below:

> ```
> node server
> ```

3. Start game from reset as below:

> ```
> http://localhost:1337/reset
> ```

4. Get debug info from link below:

> ```
> http://localhost:1337/
> ```

5. Start placing ship in format ship/:ship_type-:xPos-:yPos-:direction such as an example below:

> ```
> http://localhost:1337/ship/battleship-1-1-horizontal
> ```

6. After the fleet is empty, we can start attacking in format attack/:xPos-:yPos such as below:

> ```
> http://localhost:1337/attack/1-1
> ```



#### Running Battleship Unit Tests

1. Go to the directory we clone the Battleship project
2. Run command below:

> ```
> mocha battleshipTest
> ```

3. The test will start and we can see test results




#### Note
- There is an issue found with the unit test that we cannot control a sequence of API requests in a unit test so I use setTimeout to define the execution time for each request instead.

  Anyway, this is not good but we will find a better solution.
