;
jQuery(function($){  
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
    var IO = {

        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
            IO.socket.on('beginNewGame', IO.beginNewGame );
            IO.socket.on('newWordData', IO.onNewWordData);
            IO.socket.on('hostAction', IO.hostAction);
            //IO.socket.on('hostAddPlayer',
            IO.socket.on('error', IO.error );
            IO.socket.on('timer', IO.heartbeat);
        },

        /**
         * The client is successfully connected!
         */
        onConnected : function() {
            // Cache a copy of the client's socket.IO session ID on the App
            console.log("IDDDDDDD:   "+IO.socket.io.engine.id)
            App.mySocketId = IO.socket.io.engine.id;
            // console.log(data.message);
        },

        /**
         * A new game has been created and a random game ID has been generated.
         * @param data {{ gameId: int, mySocketId: * }}
         */
        onNewGameCreated : function(data) {
        	console.log("new game created: "+ data.gameId);
            App.Host.gameInit(data);
        },

        /**
         * A player has successfully joined the game.
         * @param data {{playerName: string, gameId: int, mySocketId: int}}
         */
        playerJoinedRoom : function(data) {
            // When a player joins a room, do the updateWaitingScreen funciton.
            // There are two versions of this function: one for the 'host' and
            // another for the 'player'.
            //
            // So on the 'host' browser window, the App.Host.updateWiatingScreen function is called.
            // And on the player's browser, App.Player.updateWaitingScreen is called.
            console.log("player" + data.mySocketId + "joined")
            App[App.myRole].playerJoined(data);
        },

        /**
         * Both players have joined the game.
         * @param data
         */
        gameCountdown : function(data) {
            App[App.myRole].gameCountdown(data);
        },

        /**
         * A new set of words for the round is returned from the server.
         * @param data
         */
        onNewWordData : function(data) {
            // Update the current round
            App.currentRound = data.round;
			console.log("new world")
            // Change the word for the Host and Player
            App[App.myRole].newWord(data);
        },
        
        hostAction: function(data){
        	if(App.myRole === 'Host') {
        		App.Host.goAction(data);
	        }
        },
         
        heartbeat: function(data){
	        App[App.myRole].htbeat(data);
        },
        
        /**
         * An error has occurred.
         * @param data
         */
        error : function(data) {
            alert(data.message);
        }

    };

    var App = {

        /**
         * Keep track of the gameId, which is identical to the ID
         * of the Socket.IO Room used for the players and host to communicate
         *
         */
        gameId: 0,

        /**
         * This is used to differentiate between 'Host' and 'Player' browsers.
         */
        myRole: '',   // 'Player' or 'Host'

        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',

        /**
         * Identifies the current round. Starts at 0 because it corresponds
         * to the array of word data stored on the server.
         */
        currentRound: 0,

        /* *************************************
         *                Setup                *
         * *********************************** */

        /**
         * This runs when the page initially loads.
         */
        init: function () {
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();

            // Initialize the fastclick library
            FastClick.attach(document.body);
            
        },

        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: function () {
            App.$doc = $(document);
			// host
			App.$joinInfo = $('#create-game-template').html();
            // Templates$
            App.$gameArea = $('#content-template');
            App.$game = $('#game-template');
            App.$templateMenu = $('#menu-template').html();
            App.$templateCharacterSelect = $('#character-Select-template').html();
            App.$templateJoinGame = $('#join-game-template').html();
            App.$templateController = $('#controller-template').html();
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            // Host
            App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
            App.$doc.on('click', '#startLevel', App.Host.onHostStart)

            // Player
            App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
            App.$doc.on('touchstart touchend mousedown mouseup', '.ctrl', App.Player.onAction);
            
        },

        /* *************************************
         *             Game Logic              *
         * *********************************** */

        /**
         * Show the initial Anagrammatix Title Screen
         * (with Start and Join buttons)
         */
        showInitScreen: function() {
            App.$gameArea.html(App.$templateMenu);
			console.log("init")
        },


        /* *******************************
           *         HOST CODE           *
           ******************************* */
        Host : {

            /**
             * Contains references to player data connected to host
             */
            players : [],

            /**
             * Keep track of the number of players that have joined the game.
             */
            numPlayersInRoom: 0,

            /**
             * Handler for the "Start" button on the Title Screen.
             */
            onCreateClick: function () {
                console.log('Clicked "Create A Game"');
                IO.socket.emit('hostCreateNewGame');
            },

            /**
             * The Host screen is displayed
             * @param data{{ gameId: int, mySocketId: * }}
             */
            gameInit: function (data) {
                App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;
                App.Host.displayNewGameScreen();
                console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
                
                 setInterval(function() {
					data = {
						'hostSocket' : App.mySocketId,
					}
					IO.socket.emit('hostHeartbeat', data);
				}, 10000);
            },

            /**
             * Show the Host screen containing the game URL and unique game ID
             * Could also add character selection and more.
             */
            displayNewGameScreen : function() {
                // Fill the game screen with the appropriate HTML
                App.$gameArea.html(App.$joinInfo);

                // Display the URL on screen
                $('#gameURL').text(window.location.href);
                //App.doTextFit('#gameURL');
				
				
                // Show the gameId / room id on screen
                $('#spanNewGameCode').text(App.gameId);
            },
            
            /**
             * Host gets notification that player has joined
             */
            playerJoined : function(data) {
				App.Host.players.push(data);
            },
            
            /**
             * Show the Host screen containing the actual game
             */
            onHostStart : function() {
	            App.$gameArea.html(App.$game);
            },
            
            goAction : function(data) {
            	console.log(data)
            	
            	/**
            	 *data{
            	 *		gameId,			:game session it was sent from
            	 *		action,			:Button that was pressed (jump, right, left)
            	 *		status,			:Button up or down "mousedown" "mouseup" for keyboard and "touchstart" "touchend" for touch
            	 *		playerId,		:Player socket ID
            	 *		}
            	**/
            	
	            if(data.status == "mousedown" || data.status == "touchstart"){
	            	// add link to game controle for the specific action found in data.action
	            	// When the button is released
	            }else if(data.status == "mouseup" || data.status == "touchend"){
		            // add link to game controle for the specific action found in data.action
		            // When button is pressed down
	            }

            },
            
            htbeat: function(data) {
	        	// checking for each players on host and each player received from server if they still exist
	        	$.each(App.Host.players, function(index, player){
	        		var idBool = false
	        		$.each(data, function(index, socketId){
			        	if(player.mySocketId == socketId){
				        	idBool = true;
			        	}else{
				        	
			        	}
			        })
			        // if boolean is false delete this client from the players array
			        // TODO: delete player in game
			        if(idBool == false){
						App.Host.players = jQuery.grep(App.Host.players, function(value) {
							return value != App.Host.players[index];
						});
			        }
	        	})
	        	console.log(App.Host.players)
	        }
        },


        /* *****************************
           *        PLAYER CODE        *
           ***************************** */

        Player : {

            /**
             * A reference to the socket ID of the Host
             */
            hostSocketId: '',

            /**
             * The player's name entered on the 'Join' screen.
             */
            myName: '',

            /**
             * Click handler for the 'JOIN' button
             */
            onJoinClick: function () {
                // console.log('Clicked "Join A Game"');

                // Display the Join Game HTML on the player's screen.
                App.$gameArea.html(App.$templateJoinGame);
            },

            /**
             * The player entered their name and gameId (hopefully)
             * and clicked Start.
             */
            onPlayerStartClick: function() {
                // console.log('Player clicked "Start"');

                // collect data to send to the server
                var data = {
                    gameId : +($('#inputGameId').val()),
                    playerName : $('#inputPlayerName').val() || 'anon'
                };

                // Send the gameId and playerName to the server
                IO.socket.emit('playerJoinGame', data);

                // Set the appropriate properties for the current player.
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
            },
            
            /**
             *  Click handler for the Player hitting a word in the word list.
             */
            onPlayerAnswerClick: function() {
                // console.log('Clicked Answer Button');
                var $btn = $(this);      // the tapped button
                var answer = $btn.val(); // The tapped word

                // Send the player info and tapped word to the server so
                // the host can check the answer.
                var data = {
                    gameId: App.gameId,
                    playerId: App.mySocketId,
                    answer: answer,
                    round: App.currentRound
                }
                IO.socket.emit('playerAnswer',data);
            },

            /**
             *  Click handler for the "Start Again" button that appears
             *  when a game is over.
             */
            onPlayerRestart : function() {
                var data = {
                    gameId : App.gameId,
                    playerName : App.Player.myName
                }
                IO.socket.emit('playerRestart',data);
                App.currentRound = 0;
                $('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
            },

            /**
             * Display the waiting screen for player 1
             * @param data
             */
            playerJoined : function(data) {
                if(IO.socket.io.engine.id === data.mySocketId){
                    App.myRole = 'Player';
                    App.gameId = data.gameId;
					App.mySocketId = data.mySocketId
					
                    $('#playerWaitingMessage')
                        .append('<p/>')
                        .text('Joined Game ' + data.gameId + '. Please wait for game to begin.');
                        
                }
                App.$gameArea.html(App.$templateController);
            },
            
            //When a button with .ctrl class is pressed this function is called
            onAction: function(event) {
            	event.preventDefault();
            	// retrieve action
            	var action = $(this).attr("name");
                // Send the player info and tapped action to the server so
                // the host can check the answer.
                var data = {
                    gameId: App.gameId,
                    action: action,
                    status: event.type,
                    playerId: App.mySocketId
                }
                
				console.log('Clicked '+ data.action +' id: '+ App.gameId);
				
                IO.socket.emit('playerAction',data);
            },
                        
            htbeat: function(data) {
		        console.log("clientside")
	        }
        },

    };

    IO.init();
    App.init();

}($));
