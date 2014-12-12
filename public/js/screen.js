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
            player: {x: 10, y: 5},
            width: 600,
            height: 400,
            countdownDuration: 1,
            entities: []
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
            } else {
                levelUri = "levels/demo.json";
            }
            $.getJSON(levelUri, function(cfg) {                                 // Retrieve current level
                App.setCfg(cfg);                                                // Update game cfg

                App.initCrafty();                                               // Init crafty

                App.bindEvents();                                               // Bind game events

                App.SetB2dListener();

                IO.emit('hostCreateNewGame');                                   // Join a game

                $.Edit.init();

                App.toggleDebug(true);
            });

            // Set sprite color based on sprite of level   
        },
        bindEvents: function() {
            IO.on('newGameCreated', function(data) {                            // When the game is created
                console.log("Screen.newGameCreated(id: " + data.gameId + ', host:' + data.socketId + ")");

                IO.gameId = data.gameId;                                        // setup game id

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
            IO.on('playerSelectColor', function(data) {
                App.playerSetup(data);
            });
            IO.on('playerJoinedRoom', function(data) {
                //console.log("Screen.playerJoinedRoom()", data);
                App.addPlayer(data);

            });
            IO.on('padEvent', function(data) {                                  // Forward pad events to the target crafty entity
                //console.log("Screen.padEvent", data);
                if (!App.players[data.socketId]) {
                    App.addPlayer(data);
                }
                App.players[data.socketId].onPadEvent(data);
            });

            $(".button-reset").click(function() {
                App.setState("countdown");
            });
            $(".button-fullscreen").click($.toggleFullscreen);            // Toggle fullscreen button

            $("body").keydown(function(e) {                                     // Keyboard events
                //console.log("Key pressed event(keycode:" + e.keyCode + ")", e);
                switch (e.keyCode) {
                    case 191:
                    case 192:                                                   // §: Debug
                        App.toggleDebug();
                        break;

                    case 82:                                                    // r: Restart game
                    case 51:							// 3: "
                        App.setState("countdown");
                        break;

                    case 49:                                                    // 1: Add a debug player w/ keyboard
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
        },
        SetB2dListener: function() {						// Initiate contact listener
            var contactListener = new b2ContactListener;

            /*
             * Begin Contact Listener
             */
            contactListener.BeginContact = function(contact) {
                var fixtures = [];												// create array of the two Entity in contact

                fixtures.push(contact.GetFixtureA());
                fixtures.push(contact.GetFixtureB());

                $.each(fixtures, function(i, f) {
                    if (f.GetBody().GetUserData().name == "player") {				// If one of the entity ending Contact is Player
                        var player = f.GetBody().GetUserData();
                        player.BeginContact(fixtures, i);
                    }
                    if (f.GetBody().GetUserData().name == "hotdog") {				// If one of the entity starting Contact is Enemy
                        var enemy = f.GetBody().GetUserData();					// Get relevent enemy
                        enemy.BeginContact(fixtures, i);						// Send both fixtures
                    }
                    if (f.GetBody().GetUserData().components == "OutOfBounds") {
                        var platform = f.GetBody().GetUserData();
                        platform.BeginContact(fixtures, i);
                    }
                });

                /*
                 * End contact listener
                 */
                contactListener.EndContact = function(contact) {
                    var fixtures = [];
                    fixtures.push(contact.GetFixtureA());
                    fixtures.push(contact.GetFixtureB());

                    $.each(fixtures, function(i, f) {
                        if (f.GetBody().GetUserData().name == "player") {				// If one of the entity ending Contact is Player
                            var player = f.GetBody().GetUserData();
                            player.EndContact(fixtures, i);
                        }
                        if (f.GetBody().GetUserData().name == "hotdog") {				// If one of the entity ending Contact is Enemy
                            var enemy = f.GetBody().GetUserData();
                            enemy.EndContact(fixtures, i);
                        }

                    });
                };
            };

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
                    $.each(App.gate, function(i, ent) {
                        ent.destroy();
                    });
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
                    }, 1000);
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

            //Crafty.scene($.urlParam("scene") || "demo");                      // Instantiate the scene
            //App.addDebugPlayer();
        },
        initEntities: function(entities) {
            var ret = _.map(entities, function(cfg) {                           // Add entities from config file
                var entity = Crafty.e(cfg.components).attr(cfg);
                entity.cfg = cfg;
                return entity;
            });
            return ret;
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

            App.initCrafty();                                                   // Render entities

            App.toggleDebug(App.debug);                                         // to force refresh
        },
        playerSetup: function(data) {
            App.usedSprites = [];
            // Choose random color
            var randomColor = Math.floor(Math.random() * App.playerColors.length);
            // Check if the random color is already assigned
            while (App.usedSprites.indexOf(randomColor) > -1 && App.usedSprites.length < App.playerColors.length) {
                randomColor = Math.floor(Math.random() * App.playerColors.length);
            }
            if (App.usedSprites.length < App.playerColors.length) {
                data.colorIndex = randomColor; // This property is used to manage colors
                data.colorCode = App.playerColors[data.colorIndex].colorCode;

                App.usedSprites.push(randomColor);
                IO.emit('colorSelected', data);
            } else {
                IO.emit('roomFull');
            }
        },
        addPlayer: function(cfg) {
            // This currently force new players to be mannequin
            App.players[cfg.socketId] = Crafty.e(cfg.playerSprites + ", Player, Mannequin, WebsocketController")
                .attr(App.cfg.player);

            if ($.size(App.players) === 1) {
                this.setState("countdown");
                this.playing = false;
            }
        },
        addDebugPlayer: function() {
            if (!App.players.DEBUG) {
                console.log("something", App.playerColors[0].sprites + ", " + App.playerColors[0].component);
                App.players.DEBUG = Crafty.e(App.playerColors[0].sprites + ", " + App.playerColors[0].component + ",  Keyboard")
                    .attr(App.cfg.player);
            } else {
                App.players.DEBUG.destroy();
                delete App.players.DEBUG;
            }
        },
        killEnemy: function(enemy) {
            enemy.destroy();
        },
        showCountdown: function() {
            var w = 200, h = 200, x = App.cfg.player.x, y = App.cfg.player.y, thick = 10, // Append a box to limit players moves

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
                    },
                    {
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

            $.each(App.players, function(i, p) {                                // Bring all players to starting position
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
        },
        setColors: function() {
            App.playerColors = [];
            $.each(playerColors[App.cfg.player.components], function(i, color) {
                App.playerColors.push(color);
            });
        },
        toggleDebug: function(val) {
            App.debug = val || !App.debug;

            $("body").toggleClass("wallo-debugmode", App.debug)
                .toggleClass("wallo-stdmode", !App.debug);

            if (this.debug) {
                Crafty.stage.x = $("#tab-play").position().left;
            }
        },
        toggleDebugCanvas: function() {
            Crafty.box2D.ShowBox2DDebug = !Crafty.box2D.ShowBox2DDebug;
            Crafty.box2D.debugCanvas.getContext('2d')
                .clearRect(0, 0, Crafty.box2D.debugCanvas.width, Crafty.box2D.debugCanvas.height);
        },
        getPadUrl: function() {
            return  PADURL + "?gameId=" + IO.gameId;
        }
    };
    $.App = App;                                                                // Set up global reference

    App.init();                                                                 // Init

}($));

var oldAttr = Crafty.prototype.attr;
Crafty.prototype.attr = function(key) {
    if (arguments.length === 1 && typeof key === "object") {
        if (key.image && (this.has("WalloImage") || this.has("Image"))) {
            this.image(key.image);
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
