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
        PLAYERCFG: {x: 10, y: 5},
        WIDTH: 600,
        HEIGHT: 400,
        /**
         * This runs when the page initially loads.
         */
        init: function() {
            App.players = {};

            IO.init();                                                          // Init socket.io

            Crafty.init(App.WIDTH, App.HEIGHT);                                 // Start crafty
            Crafty.canvas.init();

            Crafty.box2D.init(0, 10, 32, true);                                 // Init the box2d world, gx = 0, gy = 10
            Crafty.box2D.showDebugInfo();                                       // Start the Box2D debugger

            Crafty.scene("demo");                                               // Instantiate the scene

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

                    case 50:                                                    // 2: Add a debug player playable w/ keyboard
                        if (!App.players["DEBUG"]) {
                            App.players["DEBUG"] = Crafty.e("Player, Keyboard").setPosition(App.PLAYERCFG);
                        }
                        break;
                }
            });
        },
        addPlayer: function(cfg) {
            var player = Crafty.e("Player, WebsocketController").setPosition(App.PLAYERCFG);
            App.players[cfg.socketId] = player;
        },
        setState: function(newState) {
            switch (App.state) {                                                // Exit previous state
                case "countdown":
                    this.walls.destroy();
                    clearTimeout(App.countDown);
                    break;

                case "run":
                    clearInterval(App.timerHandler);
                    break;
            }

            switch (newState) {                                                 // Enter new state
                case "countdown":
                    var w = 200, h = 200, cfg = {
                        bodyType: 'static',
                        density: 1.0,
                        friction: 10,
                        restitution: 0
                    };

                    this.walls = Crafty.e("2D, Canvas, Box2D")
                        .box2d($.extend(cfg, {
                            shape: [[0, 0], [w, 0], [w, 10], [0, 10]]
                        }))
                        .setPosition({x: App.PLAYERCFG.x - w / 200, y: App.PLAYERCFG.y - h / 200})
                        .addFixture($.extend(cfg, {
                            shape: [[0, 0], [10, 0], [10, h], [0, h]]
                        }))
                        .addFixture($.extend(cfg, {
                            shape: [[(w - 10), 0], [w, 0], [w, h], [(w - 10), h]]
                        }))
                        .addFixture($.extend(cfg, {
                            shape: [[0, (h - 10)], [w, (h - 10)], [w, h], [0, h]]
                        }));

                    $.each(App.players, function(i, p) {                        // Bring all players to starting position
                        p.setPosition(App.PLAYERCFG);
                    });

                    IO.emit('restart');

                    var countDown = 3,
                        step = function() {
                            $(".screen-msg").text(countDown);
                            if (countDown === 0) {
                                App.setState("run");
                            } else {
                                App.countDown = setTimeout(step, 1000);
                            }
                            countDown--;
                        };

                    $(".screen-msg").text("Starting...");
                    App.countDown = setTimeout(step, 1000);
                    break;

                case "run":
                    var startTime = new Date().getTime();

                    App.timerHandler = setInterval(function() {
                        $(".screen-msg").text($.HHMMSS(new Date().getTime() - startTime));
                    }, 53);
                    break;

                case "win":
                    break;
            }
            App.state = newState;
        }
    };
    $.App = App;                                                                // Set up global reference

    App.init();                                                                 // Init

}($));
