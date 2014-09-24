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
            entities: [
                {components: "Platform", x: 10, y: 5},
                {components: "Platform", x: 3, y: 10},
                {components: "Target", x: 11, y: 3}
            ]
        },
        /**
         * This runs when the page initially loads.
         */
        init: function() {
            App.players = {};

            IO.init();                                                          // Init socket.io

            App.initCrafty();

            App.bindEvents();

            IO.emit('hostCreateNewGame');                                       // Join a game
        },
        bindEvents: function() {
            IO.on('newGameCreated', function(data) {                            // When the game is created
                console.log("Screen.newGameCreated(id: " + data.gameId + ', host:' + data.socketId + ")");

                IO.gameId = data.gameId;                                        // setup game id

                setInterval(function() {
                    IO.emit('heartBeat');
                }, 5000);

                $("body").append("<a href='pad.html?gameId=" + data.gameId + "' target='_blank'>Pad</a>");
            });

            IO.on('heartBeat', function(data) {
                $.each(App.players, function(id, player) {                      // checking for each players on host and each player received from server if they still exist
                    console.log("Screen.heartBeat()");
                    if (id.indexOf("DEBUG") === -1 &&
                        $.inArray(id, data) === -1) {                           // if the player doews not exist in the returned value 
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
                    case 49:                                                    // 1: Restart game
                        App.setState("countdown");
                        break;

                    case 50:                                                    // 2: Add a debug player w/ keyboard
                        App.addDebugPlayer();
                        break;
                }
            });
        },
        setState: function(newState) {
            if (App.state === newState)
                return;

            switch (App.state) {                                                // Exit previous state
                case "countdown":
                    this.walls.destroy();
                    clearTimeout(App.countdownHandler);
                    break;

                case "run":
                    clearInterval(App.timerHandler);
                    break;

                case "win":
                    clearTimeout(App.restartHandler);
                    break;
            }

            switch (newState) {                                                 // Enter new state
                case "countdown":                                               // Show countdown before play
                    //IO.emit('restart');                                         // Notify pads
                    App.showCountdown();
                    break;

                case "run":                                                     // Play
                    var startTime = new Date().getTime();
                    App.timerHandler = setInterval(function() {
                        $(".screen-msg").text($.HHMMSS(new Date().getTime() - startTime));
                    }, 53);
                    break;

                case "win":                                                     // Somebody reach the goal
                    $(".screen-msg").prepend("Final time<br />");

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
            Crafty.init(App.cfg.width, App.cfg.height);                         // Start crafty
            Crafty.canvas.init();

            Crafty.box2D.init(0, 10, 32, true);                                 // Init the box2d world, gx = 0, gy = 10, pixeltometer = 32
            Crafty.box2D.showDebugInfo();                                       // Start the Box2D debugger

            Crafty.scene($.urlParam("scene") || "comemwall");                   // Instantiate the scene

            App.addDebugPlayer();
        },
        addPlayer: function(cfg) {
            var player = Crafty.e("Player, WebsocketController").setPosition(App.cfg.player),
                playerCount = $.map(App.players, function(n, i) {
                    return i;
                }).length;

            App.players[cfg.socketId] = player;

            if (playerCount === 0) {
                this.setState("countdown");
            }
        },
        addDebugPlayer: function() {
            if (!App.players["DEBUG"]) {
                App.players["DEBUG"] = Crafty.e("Player, Keyboard").setPosition(App.cfg.player);
            }
        },
        showCountdown: function() {
            var w = 200, h = 200,
                cfg = {
                    bodyType: 'static',
                    density: 1.0,
                    friction: 10,
                    restitution: 0
                };

            this.walls = Crafty.e("2D, Canvas, Box2D")                          // Append a box to limit players moves
                .box2d($.extend(cfg, {
                    shape: [[0, 0], [w, 0], [w, 10], [0, 10]]
                }))
                .setPosition({x: App.cfg.player.x - w / 200, y: App.cfg.player.y - h / 200})
                .addFixture($.extend(cfg, {
                    shape: [[0, 0], [10, 0], [10, h], [0, h]]
                }))
                .addFixture($.extend(cfg, {
                    shape: [[(w - 10), 0], [w, 0], [w, h], [(w - 10), h]]
                }))
                .addFixture($.extend(cfg, {
                    shape: [[0, (h - 10)], [w, (h - 10)], [w, h], [0, h]]
                }));

            $.each(App.players, function(i, p) {                                // Bring all players to starting position
                p.setPosition(App.cfg.player);
            });

            var countDown = App.cfg.countdownDuration,
                step = function() {
                    $(".screen-msg").text(countDown);
                    if (countDown === 0) {
                        App.setState("run");
                    } else {
                        App.countdownHandler = setTimeout(step, 1000);
                    }
                    countDown--;
                };

            $(".screen-msg").text("Ready");
            App.countdownHandler = setTimeout(step, 1000);                      // Show count down
        },
        setCfg: function(cfg) {
            $.extend(App.cfg, cfg);
        }
    };
    $.App = App;                                                                // Set up global reference

    App.init();                                                                 // Init

}($));
