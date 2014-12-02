// Import the Express module
var express = require('express');
var bodyParser = require('body-parser');
// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');

 // Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
var flash = require('connect-flash');


// Import the 'path' module (packaged with Node.js)
var path = require('path');

//database
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/wallo", {native_parser:true});

var routes = require('./routes/index')(passport);
var levels = require('./routes/levels');

// Create a new instance of Express
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// Import the Anagrammatix game file.
var game = require('./server');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,'public')));
app.use(expressSession({secret: 'mySecretKey',resave: true,saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});
app.use('/', routes);
app.use('/levels',levels);

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

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);