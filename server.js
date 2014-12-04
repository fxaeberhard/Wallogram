var io, socket;
//Define all the colors and their sprites for players
green = {'colorCode':'91cc70','sprites':'MannequinSpriteGreen'};
orange = {'colorCode':'db953b','sprites':'MannequinSpriteOrange'};
pink = {'colorCode':'dd6eaf','sprites':'MannequinSpritePink'};
red = {'colorCode':'e75d58','sprites':'MannequinSpriteRed'};
violet = {'colorCode':'bf60e3','sprites':'MannequinSpriteViolet'};
cyan = {'colorCode':'64dec3','sprites':'MannequinSpriteCyan'};
blue = {'colorCode':'608ce6','sprites':'MannequinSpriteBlue'};
yellow = {'colorCode':'decb21','sprites':'MannequinSpriteYellow'};

playersColors = [green,orange,pink,red,violet,cyan,blue,yellow]

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
    gameSocket.on('addScore', addScore)

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
    
    sock.on('disconnect', function(){
        //When a player disconnect, we should "release" his color
        var index = usedSprites.indexOf(data.playerSpritesColorIndex);
        if (index > -1) {
            usedSprites.splice(index, 1);
        }
    });

    // Look up the room ID in the Socket.IO manager object.
    var room = gameSocket.adapter.rooms[data.gameId];

    // If the room exists...
    if (room != undefined) {
        // attach the socket id to the data object.
        data.mySocketId = sock.id;

        // Choose random color
        var randomColor = Math.floor(Math.random() * playersColors.length); 
        // Check if the random color is already assigned
        while (usedSprites.indexOf(randomColor)> -1 && usedSprites.length < playersColors.length) {
            randomColor = Math.floor(Math.random() * playersColors.length)
        }

        // Join the room
        sock.join(data.gameId);

        console.log('Player ' + data.playerName + ' joining game: ' + data.gameId);

        if(usedSprites.length < playersColors.length){
            data.playerSprites = playersColors[randomColor].sprites
            data.playerSpritesColorIndex = randomColor; // This property is used to manage colors
            console.log(data)
            // Emit an event notifying the clients that the player has joined the room.
            io.sockets.in("host-" + data.gameId).emit('playerJoinedRoom', data);
            // Emit the player's color to the pad.
            console.log("socketttt",data.mySocketId)
            io.to(data.mySocketId).emit('colorAssigned',playersColors[randomColor].colorCode)

            usedSprites.push(randomColor);
        }else{
            //All the colors are used
            io.to(data.mySocketId).emit('complete','Sorry! All the colors are already assigned. Try to reload the page!')
        }

    } else {
        // Otherwise, send an error message back to the player.
        this.emit('error', {message: "This room does not exist."});
    }
}

/**
 * 
 * @param {type} data
 */
function padEvent(data) {
    console.log("padEvent", data, data.gameId);
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
