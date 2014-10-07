/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
jQuery(function($) {
    'use strict';

    var IO = $.IO, App;

    App = {
        /* *************************************
         *                Setup                *
         * *********************************** */
        cfg: {
            player: {x: 10, y: 5},
            width: 600,
            height: 400,
            countdownDuration: 5,
            entities: []
        },
        /**
         * This runs when the page initially loads.
         */
        init: function() {
            App.players = {};

            IO.init();                                                          // Init socket.io

            var levelUri = $.urlParam("level") || "levels/demo.json";

            $.getJSON(levelUri, null, function(cfg) {                           // Retrieve current level
                App.setCfg(cfg);                                                // Update game cfg

                App.initCrafty();                                               // Init crafty

                App.bindEvents();                                               // Bind game events

                IO.emit('hostCreateNewGame');                                   // Join a game

                $.Edit.init();

                App.toggleDebug(true);
            });
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

            IO.on('playerJoinedRoom', function(data) {                          // As a player joins the game, instantiate a crafty entity
                console.log("Screen.playerJoinedRoom()", data);
                App.addPlayer(data);
            });

            IO.on('padEvent', function(data) {                                  // Forward pad events to the target crafty entity
                //console.log("Screen.padEvent", data);
                if (!App.players[data.socketId]) {
                    App.addPlayer(data);
                }
                App.players[data.socketId].onPadEvent(data);
            });

            $("body").keydown(function(e) {                                     // Keyboard events
                switch (e.keyCode) {
                    case 191:
                    case 192:                                                   // §: Debug
                        App.toggleDebug();
                        break;

                    case 49:                                                    // 1: Restart game
                        App.setState("countdown");
                        break;

                    case 50:                                                    // 2: Add a debug player w/ keyboard
                        App.addDebugPlayer();
                        break;

                    case 51:
                        var wnd = window.open("about:blank", "", "_blank");     // 3: Open current cfg in a blank frame
                        wnd.document.write(JSON.stringify(App.cfg));

                    case 52:                                                    // 4: Full screen
                        var isFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen,
                            cfs = document.exitFullscreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen,
                            el = document.documentElement,
                            rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                        if (isFullScreen) {
                            cfs.call(document);                                 //Exits full-screen mode and returns to the document view.
                        } else {
                            rfs.call(el, Element.ALLOW_KEYBOARD_INPUT);
                        }
                }
            });
        },
        resetPlayer: function(player) {
            console.log("App.resetPlayer()", player);
            player.body.SetLinearVelocity(new b2Vec2(0, 0));									// Reset velocity 
            player.attr(App.cfg.player);                                        // Reset the player position
        },
        setState: function(newState) {
            if (App.state === newState)
                return;

            $(document).trigger("stateChange", [newState, App.state]);

            console.log("Screen.setState(" + newState + ")");

            switch (App.state) {                                                // Exit previous state
                case "countdown":
                    this.walls.destroy();
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
                    break;

                case "win":                                                     // Somebody reach the goal
                    App.restartHandler = setTimeout(function() {
                        App.setState("countdown");
                    }, 10000);
                    break;
            }
            App.state = newState;
        },
        /* *************************************
         *                Crafty               *
         * *********************************** */
        initCrafty: function() {
            Crafty.init(App.cfg.width, App.cfg.height,
                $(".wallo-crafty").get(0));                                     // Init crafty
            Crafty.canvas.init();
            Crafty.box2D.init(0, 10, 16, true);                                 // Init the box2d world, gx = 0, gy = 10, pixeltometer = 32

            //Crafty.scene($.urlParam("scene") || "demo");                      // Instantiate the scene

            $.each($.App.cfg.entities, function(i, p) {                        // Add entities from config file
                var entity = Crafty.e(p.components).attr(p);
                entity.cfgObject = p;
            });

            App.addDebugPlayer();
        },
        addPlayer: function(cfg) {
            App.players[cfg.socketId] = Crafty.e("Player, WebsocketController")
                .attr(App.cfg.player);

            if ($.size(App.players) === 1) {
                this.setState("countdown");
            }
        },
        addDebugPlayer: function() {
            if (!App.players.DEBUG) {
                App.players.DEBUG = Crafty.e("Player, Keyboard")
                    .attr(App.cfg.player);
            } else {
                App.players.DEBUG.destroy();
                delete App.players.DEBUG;
            }
        },
        showCountdown: function() {
            var w = 200, h = 200, //                                            // Append a box to limit players moves
                cfg = {
                    bodyType: 'static',
                    density: 1.0,
                    friction: 10,
                    restitution: 0
                };

            this.walls = Crafty.e("2D, Canvas, Box2D")
                .box2d($.extend(cfg, {
                    shape: [[0, 0], [w, 0], [w, 10], [0, 10]]
                }))
                .attr({x: App.cfg.player.x - w / 200, y: App.cfg.player.y - h / 200})
                .addFixture($.extend(cfg, {
                    shape: [[0, 0], [10, 0], [10, h], [0, h]]
                }))
                .addFixture($.extend(cfg, {
                    shape: [[(w - 10), 0], [w, 0], [w, h], [(w - 10), h]]
                }))
                .addFixture($.extend(cfg, {
                    shape: [[0, (h - 10)], [w, (h - 10)], [w, h], [0, h]]
                }));                                                            // Add a box to limit players moves until they can move

            $.each(App.players, function(i, p) {                                // Bring all players to starting position
                App.resetPlayer(p);
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
        toggleDebug: function(val) {
            this.debug = val || !this.debug;

            $("body").toggleClass("wallo-debugmode")
                .toggleClass("wallo-stdmode");

            if (!Crafty.box2D.debugCanvas) {
                Crafty.box2D.showDebugInfo();                                   // Start the Box2D debugger
            }
            Crafty.box2D.ShowBox2DDebug = this.debug;
            Crafty.box2D.debugCanvas.getContext('2d')
                .clearRect(0, 0, Crafty.box2D.debugCanvas.width, Crafty.box2D.debugCanvas.height);
        },
        getPadUrl: function() {
            return  "/pad.html?gameId=" + IO.gameId;
        }
    };
    $.App = App;                                                                // Set up global reference

    App.init();                                                                 // Init

}($));

var oldAttr = Crafty.prototype.attr;
Crafty.prototype.attr = function(key) {
    if (arguments.length === 1 && typeof key === "object") {
        if (key.url
            && (this.has("WalloImage") || this.has("Image"))) {
            this.image(key.url);
        }
        if (key.color && this.has("Color")) {
            this.color(key.color);
        }
    }
    return oldAttr.apply(this, arguments);
};
