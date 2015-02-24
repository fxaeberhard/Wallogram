/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
jQuery(function($) {
    'use strict';

    var PADURL = "/pad",
        IO = $.IO, App;

    App = {
        /* *************************************
         *                Setup                *
         * *********************************** */
        cfg: {
            //player: {x: 10, y: 5, z: 150},
            width: 600,
            height: 400,
            countdownDuration: 1,
            entities: []
        },
        spawn: {
        	x: 100,
	        y: 100
        },
        /**
         * This runs when the page initially loads.
         */
        init: function() {
            App.players = {};

            IO.init();                                                          // Init socket.io

            var levelUri;
            if ($.urlParam('level')) {
                levelUri = "/levels/getLevel?level=" + $.urlParam('level');
            } else if ($.urlParam('levelUri')) {
                levelUri = "levels/" + $.urlParam('levelUri');
            } else {
                levelUri = "levels/lab.json";
            }
            $.getJSON(levelUri, function(cfg) {                           	// Retrieve current level
                
                App.bindEvents();                                               // Bind game events
                
                App.setCfg(cfg);                                                // Update game cfg

                App.debug = !!$.urlParam('edit');

                App.initCrafty();                                               // Init crafty

                App.SetB2dListener();

                IO.emit('hostCreateNewGame');                                   // Join a game

                $.Edit.init();

                App.toggleDebug(App.debug);
            });
        },
        bindEvents: function() {
	        
            IO.on('newGameCreated', function(data) {                            // When the game is created
                console.log("Screen.newGameCreated(id: " + data.gameId + ', host:' + data.socketId + ")");

                IO.gameId = data.gameId;                                        // setup game id
				App.qr.sync()
                setInterval(function() {
                    IO.emit('heartBeat');
                }, 5000);

                $(document).trigger("newGameCreated", [data]);                  // Trigger a global event (listened by editor)
            });

            IO.on('heartBeat', function(data) {
                $.each(App.players, function(id, player) {                      // checking for each players on host and each player received from server if they still exist
                    if (id.indexOf("DEBUG") === -1 &&
                        $.inArray(id, data) === -1) {                           // if the player doews not exist in the returned value 
                        console.log("Screen.heartBeat(): idle player removed: " + player);
                        player.destroy();                                       // Destroy the player entity
                        delete App.players[id];                                 // and delete this client from the players array
                    }
                });
            });
            IO.on('playerJoinedRoom', function(data) {
                var cfg = App.playerSetup(data);
                cfg && App.addPlayer(data, cfg);                                // If a config is available, add the player
            });
            IO.on('padEvent', function(data) {                                  // Forward pad events to the target crafty entity
                //console.log("Screen.padEvent", data);
                if (!App.players[data.socketId]) {
                    //App.addPlayer(data);                                      // @fixme this wont work anymore with color selection
                } else {
                    App.players[data.socketId].onPadEvent(data);
                }
            });

            $(".button-reset").click(function() {
                App.setState("countdown");
            });
            $(".button-fullscreen").click($.toggleFullscreen);                  // Toggle fullscreen button

            $("body").keydown(function(e) {                                     // Keyboard events
                //console.log("Key pressed event(keycode:" + e.keyCode + ")", e);
                switch (e.keyCode) {
                    case 191:
                    case 192:                                                   // ยง: Debug
                        App.toggleDebug();
                        break;

                    case 82:                                                    // r: Restart game
                    case 51:							// 3: "
                        App.setState("countdown");
                        break;

                    case 49:                                                    // 1: Add a debug player w/ keyboard
                    case 80:                                                    // p: ""
                        App.addDebugPlayer();
                        break;

                    case 70:                                                    // f: full screen
                        $.toggleFullscreen();
                        break

                    case 50:
                        var wnd = window.open("about:blank", "", "_blank");     // 2: Open current cfg in a blank frame
                        wnd.document.write(JSON.stringify(App.cfg));
                        break;
                }
            });

            $(".wallo-play").scroll(App.updateCanvasPosition);
        },
        SetB2dListener: function() {											// Initiate contact listener
	        var contactListener = new b2ContactListener
			
			
			/*
			 * Begin Contact Listener
			 */
			 
			contactListener.BeginContact = function(contact){
				var fixtures = [];												// create array of the two Entity in contact
				fixtures.push(contact.GetFixtureA())
				fixtures.push(contact.GetFixtureB())
				
				$.each(fixtures, function(i, f){
					if(f.GetBody().GetUserData().name == "player"){				// If one of the entity starting Contact is Player
						var player = f.GetBody().GetUserData()
						player.BeginContact(fixtures, i);
					} else if (f.GetBody().GetUserData().name == "enemy"){		// If one of the entity starting Contact is Enemy
						var enemy = f.GetBody().GetUserData();					// Get relevent enemy
						enemy.BeginContact(fixtures, i);						// Send both fixtures
					} else if (f.GetBody().GetUserData().components == "OutOfBounds") {
						var platform = f.GetBody().GetUserData();
						platform.BeginContact(fixtures, i);
					} else if(f.GetBody().GetUserData().name == "falling") {
						var platform = f.GetBody().GetUserData();
						platform.BeginContact(fixtures, i);
					} else if(f.GetBody().GetUserData().name == "teleport") {
						var teleport = f.GetBody().GetUserData();
						teleport.BeginContact(fixtures, i);
					}
					
				})
			}
			
			
			
			
			/*
			 * End contact listener
			 */
			contactListener.EndContact = function(contact){
				var fixtures = [];
				fixtures.push(contact.GetFixtureA())
				fixtures.push(contact.GetFixtureB())
				
				$.each(fixtures, function(i, f){
					if(f.GetBody().GetUserData().name == "player"){				// If one of the entity ending Contact is Player
						var player = f.GetBody().GetUserData()
						player.EndContact(fixtures, i);
					} else if(f.GetBody().GetUserData().name == "enemy"){				// If one of the entity ending Contact is Enemy
						var enemy = f.GetBody().GetUserData()
						enemy.EndContact(fixtures, i);
					} else if(f.GetBody().GetUserData().name == "falling") {
						var platform = f.GetBody().GetUserData();
						platform.EndContact(fixtures, i);
					}
				})
			}
			
			Crafty.box2D.world.SetContactListener(contactListener);
        },
        win: function(player) {
            App.setState("win");
            player.score++;
            IO.emit('addScore', {"id": player.mySocketId, "score": player.score});
        },
        setState: function(newState) {
            if (App.state === newState)
                return;

            $(document).trigger("stateChange", [newState, App.state]);

            console.log("Screen.setState(" + newState + ")");

            switch (App.state) {                                                // Exit previous state
                case "countdown":
                	if(App.spawn.boxedIn != true){
	                    $.each(App.gate, function(i, ent) {
	                        ent.destroy();
	                    });
	                }
                    clearTimeout(App.countdownHandler);
                    break;

                case "win":
                    clearTimeout(App.restartHandler);
                    break;
            }

            switch (newState) {                                                 // Enter new state
                case "countdown":                                               // Show countdown before play
                    //IO.emit('restart');                                       // Notify pads
                    App.showCountdown();
                    break;

                case "run":                                                     // Play
                    App.startTime = new Date().getTime();
                    App.playing = true;
                    break;

                case "win":                                                     // Somebody reach the goal
                    App.restartHandler = setTimeout(function() {
                        App.setState("countdown");
                    }, 5000);
                    App.playing = false;
                    break;
            }
            App.state = newState;
        },
        /* *************************************
         *                Crafty               *
         * *********************************** */
        initCrafty: function() {
            Crafty.init(App.cfg.width, App.cfg.height, $(".wallo-crafty").get(0));// Init crafty
            Crafty.canvas.init();
            Crafty.box2D.init(0, 20, 16, true);                                 // Init the box2d world, gx = 0, gy = 10, pixeltometer = 32
            Crafty.box2D.showDebugInfo();                                       // Start the Box2D debugger
            Crafty.box2D.ShowBox2DDebug = false;

            App.initEntities(App.cfg.entities);
            App.setOutOfBound();											// Add OutOfBound box

            //App.addDebugPlayer();
        },
        initEntities: function(entities) {
            var ret = _.map(entities, function(cfg) {                           // Add entities from config file
                var entity = Crafty.e(cfg.components).attr(cfg);
                entity.cfg = cfg;
                if (entity.name == "spawner") {								// set spawner
                    App.spawn = entity
                } else if (entity.name == "QR") {
	                App.qr = entity;
                }
                if (!App.spawn) {
	                App.spawn.x = 100;
	                App.spawn.y = 100;
                }
                return entity;
            });
            return ret;
        },
        setOutOfBound: function() {
	        var entities = [{
                        "components": "Platform", // top
                        "x": - 10,
                        "y": - 30,
                        "w": App.cfg.width + 20,
                        "h": 30
                    }, {
                        "components": "Platform", // right
                        "x": App.cfg.width,
                        "y":  - 10,
                        "w": 30,
                        "h": App.cfg.height
                    }, {
                        "components": "OutOfBounds", // bottom
                        "x": - 30,
                        "y": App.cfg.height + 10,
                        "w": App.cfg.width + 20,
                        "h": 20
                    }, {
                        "components": "Platform", // left
                        "x": - 30,
                        "y": - 30,
                        "w": 30,
                        "h": App.cfg.height + 60
                    }];
                    
			App.outOfBound = App.initEntities(entities);
        },
        updateEntityCfg: function(entity, newCfg) {
            var cfg = entity.cfg;
            $.extend(cfg, newCfg);
            entity.destroy();
            var e = Crafty.e(cfg.components).attr(cfg);
            e.cfg = cfg;
        },
        resetCrafty: function() {
            Crafty.stop();                                                      // Destroy crafty
            Crafty("*").destroy();
            $(".wallo-crafty").empty();
            
            App.players = {};
			
            App.initCrafty();   												// Render entities
            App.SetB2dListener();
			$.Edit.initOverlay();                                              
            App.toggleDebug(App.debug);                                         // to force refresh
        },
        playerSetup: function(data) {
            App.usedSprites = [];
            // Choose random color
            var randomColor = Math.floor(Math.random() * App.cfg.player.length);
            // Check if the random color is already assigned
            while (App.usedSprites.indexOf(randomColor) > -1 && App.usedSprites.length < App.cfg.player.length) {
                randomColor = Math.floor(Math.random() * App.cfg.player.length);
            }
            if (App.usedSprites.length < App.cfg.player.length) {
                data.colorIndex = randomColor;                                  // This property is used to manage colors
                data.colorCode = App.cfg.player[randomColor].colorCode;

                App.usedSprites.push(randomColor);
                IO.emit('colorSelected', data);
				//console.log("cfg", App.cfg.player[randomColor])
                return App.cfg.player[randomColor];
            } else {
                IO.emit('roomFull');
            }
        },
        addPlayer: function(data, cfg) {
            cfg.z = 150;                                                        // Player is on top
			cfg.x = App.spawn.x;
			cfg.y = App.spawn.y;
			cfg.mySocketId = data.mySocketId;
			// console.log("mysocketid",data.mySocketId)
			// console.log("components", cfg)
            App.players[data.mySocketId] = Crafty.e(cfg.component + ", WebsocketController")
                .attr(cfg);
            App.players[data.mySocketId].extend(cfg);				// add player specific data

			console.log("the player",App.players[data.mySocketId])
            if ($.size(App.players) === 1) {
                this.setState("countdown");
                this.playing = false;
            }
        },
        addDebugPlayer: function() {
            if (!App.players.DEBUG) {
                var cfg = App.cfg.player[0];
                cfg.z = 150;
                cfg.x = App.spawn.x;
				cfg.y = App.spawn.y;
                App.players.DEBUG = Crafty.e(cfg.components + ",  Keyboard")
                    .attr(cfg);
            } else {
                App.players.DEBUG.destroy();
                delete App.players.DEBUG;
            }
        },
        killEnemy: function(enemy) {
            enemy.destroy();
        },
        showCountdown: function() {
        	console.log("spwner", App.spawn)
            if(App.spawn.boxedIn != true){
	            var w = 200, h = 200, x = App.spawn.x, y = App.spawn.y, thick = 10, // Append a box to limit players moves

                entities = [{
                        "components": "ColoredPlatform",
                        "color": "pink",
                        "x": x - (w / 2) + thick,
                        "y": y - (h / 2),
                        "w": w - thick,
                        "h": thick
                    }, {
                        "components": "ColoredPlatform",
                        "color": "pink",
                        "x": x + (w / 2),
                        "y": y - (h / 2),
                        "w": thick,
                        "h": h
                    }, {
                        "components": "ColoredPlatform",
                        "color": "pink",
                        "x": x - (w / 2) + thick,
                        "y": y + (h / 2) - thick,
                        "w": w - thick,
                        "h": thick
                    }, {
                        "components": "ColoredPlatform",
                        "color": "pink",
                        "x": x - (w / 2),
                        "y": y - (h / 2),
                        "w": thick,
                        "h": h
                    }];


				App.gate = App.initEntities(entities);      			// Add a box to limit players moves until they can move
            }
            console.log("All players", App.players)
            _.each(App.players, function(p) {                                   // Bring all players to starting position
	            	console.log("player", p)
	                p.reset();
            });

            var countDown = App.cfg.countdownDuration,
                step = function() {
                    $(".wallo-crafty .Timer").text(countDown);
                    if (countDown === 0) {
                        App.setState("run");
                    } else {
                        App.countdownHandler = setTimeout(step, 1000);
                    }
                    countDown--;
                };
            App.countdownHandler = setTimeout(step, 1000);                      // Show countdown
        },
        setCfg: function(cfg) {
            $.extend(App.cfg, cfg);
            $.extend($.Edit.TOOLBAR, cfg.toolbar);
        },
        toggleDebug: function(val) {
            if (val === undefined) {
                App.debug = !App.debug;
            }
			if($.Edit.position == "left"){
            $("body").toggleClass("wallo-debugmode", App.debug)
                .toggleClass("wallo-stdmode", !App.debug);
            } else {
	            $("body").toggleClass("wallo-debugmode-right", App.debug)
                .toggleClass("wallo-stdmode", !App.debug);
            }

            if (this.debug) {
                App.updateCanvasPosition();
                App.restartHandler = setTimeout(App.updateCanvasPosition, 1000);// do it later cause of css animation
            }
        },
        toggleDebugCanvas: function() {
            Crafty.box2D.ShowBox2DDebug = !Crafty.box2D.ShowBox2DDebug;
            Crafty.box2D.debugCanvas.getContext('2d')
                .clearRect(0, 0, Crafty.box2D.debugCanvas.width, Crafty.box2D.debugCanvas.height);
        },
        getPadUrl: function() {
	        console.log("GETPADURL", IO.gameId)
            var port = window.location.port ? ":" + window.location.port : "";
            return  window.location.protocol + "//" + window.location.hostname + port + PADURL + "?gameId=" + IO.gameId;
        },
        updateCanvasPosition: function() {
            Crafty.stage.x = $("#tab-play").position().left - $(".wallo-play").scrollLeft();
            Crafty.stage.y = $("#tab-play").position().top - $(".wallo-play").scrollTop();
        }
    };
    $.App = App;                                                                // Set up global reference

    App.init();                                                                 // Init

}($));

var oldAttr = Crafty.prototype.attr;
Crafty.prototype.attr = function(key) {
    if (arguments.length === 1 && typeof key === "object") {
        if (key.url && (this.has("WalloImage") || this.has("Image"))) {
            this.url(key.url);
        }
        if (key.color && this.has("Color")) {
            this.color(key.color);
        }
        if (key.text && this.has("Text")) {
            this.text(key.text);
        }
        if (key.background && this.has("QR")) {
            this.background(key.background);
        }
        if (key.foreground && this.has("QR")) {
            this.foreground(key.foreground);
        }
        if (key.url && this.has("Video")) {
            this.url(key.url);
        }
    }
    return oldAttr.apply(this, arguments);
};
