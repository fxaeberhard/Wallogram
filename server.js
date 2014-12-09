var io, socket;

usedSprites = [] // Only used to know wich colors are already used on the platform
/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket) {
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', {message: "You are connected!"});

    // Host Events
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('heartBeat', hostHeartbeat);
    gameSocket.on('addScore', addScore);
    gameSocket.on('colorSelected', colorSelected);
    gameSocket.on('roomFull', roomFull);

    // Player Events
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('restart', restart);
    gameSocket.on('padEvent', padEvent);
};

/* *******************************
 *                             *
 *       HOST FUNCTIONS        *
 *                             *
 ******************************* */

/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 */
function hostCreateNewGame() {
    var thisGameId = (Math.random() * 100000) | 0;                              // Create a unique Socket.IO Room
    thisGameId = 100;

    console.log("hostCreateNewGame(): " + thisGameId);
    this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});     // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client

    this.join(thisGameId.toString());                                           // Join the global room and wait for the players
    this.join("host-" + thisGameId.toString());                                 // Join the host's room and wait for the players
}

function hostHeartbeat(data) {
    console.log("hostHeartbeat()", data);
    var keys = [];
    for (var k in io.sockets.connected) {
        keys.push(k);
    }
    io.sockets.in(data.socketId).emit('heartBeat', keys);                       // gameSocket.nsp.connected
}

function addScore(player) {
	console.log("player?",player)
	console.log("socketttt",player.id)
	io.to(player.id).emit("addScoreToController", player.score)
}

function colorSelected(data) {
	if(data.colorIndex != undefined){
		console.log(data)
		// Emit an event notifying the clients that the player has joined the room.
	    io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
	    
	    // Emit the player's color to the pad.
        io.to(data.mySocketId).emit('colorAssigned',data.colorCode)
	} else {
        //All the colors are used
        io.to(data.mySocketId).emit('complete','Sorry! All the colors are already assigned. Try to reload the page!')
    }
}
/* *****************************
 *                           *
 *     PLAYER FUNCTIONS      *
 *                           *
 ***************************** */
/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
    //console.log('Player ' + data.playerName + 'attempting to join game: ' + data.gameId );
    // A reference to the player's Socket.IO socket object
    var sock = this;

    // Look up the room ID in the Socket.IO manager object.
    var room = gameSocket.adapter.rooms[data.gameId];

    // If the room exists...
    if (room != undefined) {
	    
	    data.mySocketId = sock.id;
	    
        // attach the socket id to the data object.
        // Join the room
        sock.join(data.gameId);
        console.log('Player ' + data.playerName + ' joining game: ' + data.gameId);
        // Emit an event notifying the clients that the player has joined the room.
		io.sockets.in(data.gameId).emit('playerSelectColor', data)
		
    } else {
        // Otherwise, send an error message back to the player.
         io.sockets.in(data.gameId).emit('error', {message: "This room does not exist."});
    }
}
function roomFull() {
	console.log("room full")
}
/**
 * 
 * @param {type} data
 */
function padEvent(data) {
    //console.log("padEvent", data, data.gameId);
    io.sockets.in("host-" + data.gameId).emit('padEvent', data);
}

/**
 * The game is over, and a player has clicked a button to restart the game.
 * @param data
 */
function restart(data) {
    // console.log('Player: ' + data.playerName + ' ready for new game.');

    // Emit the player's data back to the clients in the game room
    io.sockets.in(data.gameId).emit('restart', data);
}
