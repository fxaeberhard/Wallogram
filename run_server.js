// Import the Express module
var express = require('express');

// Import the 'path' module (packaged with Node.js)
var path = require('path');

var routes = require('./routes/index');

// Create a new instance of Express
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// Import the Anagrammatix game file.
var game = require('./server');

app.use(express.static(path.join(__dirname,'public')));

app.use('/', routes);

// Create a Node.js based http server on port 8080
var server = require('http').Server(app).listen(8080, function(){
  console.log('listening on *:8080');
});

// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
    console.log('client connected');
    game.initGame(io, socket);
});


