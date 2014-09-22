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
        PLAYERCFG: {x: 5, y: 10},
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

            IO.on('playerJoinedRoom', function(data) {                          // As a player joins the game, instantiate a crafty entity
                console.log("Screen.playerJoinedRoom()", data);
                var player = Crafty.e("2D, Canvas, Player, WebsocketController")
                    .setPosition(App.PLAYERCFG);

                App.players[data.socketId] = player;
            });

            IO.on('padEvent', function(data) {                                  // Forward pad events to the target crafty entity
                //console.log("Screen.padEvent", data);
                App.players[data.socketId].onPadEvent(data);
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

            $("body").keydown(function(e) {                                     // Keyboard events
                switch (e.keyCode) {
                    case 49:                                                    // 1: Restart game
                        App.setState("countdown");
                        break;
                    case 50:                                                    // 2: Add a debug player playable w/ keyboard
                        if (!App.players["DEBUG"]) {
                            App.players["DEBUG"] =
                                Crafty.e("2D, Canvas, Player, Keyboard")
                                .setPosition(App.PLAYERCFG);
                        }
                        break;
                }
            });
        },
        run: function() {
            var startTime = new Date().getTime();

            App.timerHandler = setInterval(function() {
                $(".screen-msg").text(App.HHMMSS(new Date().getTime() - startTime));
            }, 53);
        },
        setState: function(newState) {
            switch (App.state) {
            }
            switch (newState) {
                case "countdown":
                    $.each(App.players, function(i, p) {
                        p.setPosition(App.PLAYERCFG);
                    });

                    IO.emit('restart');

                    var countDown = 3,
                        step = function() {
                            $(".screen-msg").text(countDown);
                            if (countDown === 0) {
                                App.setState("run");
                            } else {
                                setTimeout(step, 1000);
                            }
                            countDown--;
                        };

                    $(".screen-msg").text("Starting...");
                    setTimeout(step, 1000);
                    break;

                case "run":
                    var startTime = new Date().getTime();

                    App.timerHandler = setInterval(function() {
                        $(".screen-msg").text($.HHMMSS(new Date().getTime() - startTime));
                    }, 53);
                    break;

                case "gameOver":
                    break;
            }
            App.state = newState;
        }
    };
    $.App = App;                                                                // Set up global reference

    App.init();                                                                 // Init

}($));
