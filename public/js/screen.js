/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
jQuery(function($) {
    'use strict';

    var IO = $.IO, App = {
        /* *************************************
         *                Setup                *
         * *********************************** */

        PLAYERCFG: {x: 5, y: 10},
        /**
         * This runs when the page initially loads.
         */
        init: function() {
            App.players = {};

            IO.init();                                                          // Init socket.io

            Crafty.init(600, 600);                                              // Start crafty
            Crafty.canvas.init();

            Crafty.box2D.init(0, 10, 32, true);                                 // Init the box2d world, gx = 0, gy = 10
            Crafty.box2D.showDebugInfo();                                       // Start the Box2D debugger

            Crafty.scene("demo");                                               // Instantiate the scene

            App.bindEvents();

            IO.emit('hostCreateNewGame');                                       // Join a game
        },
        bindEvents: function() {
            IO.on('newGameCreated', function(data) {                            // When the game is created
                console.log("Screen.newGameCreated(id: " + data.gameId + ', host:' + data.mySocketId + ")");
                IO.gameId = data.gameId;                                        // setup game id

                //setInterval(function() {
                //    IO.emit('hostHeartbeat', {
                //        'hostSocket': data.mySocketId
                //    });
                //}, 10000);
            });
            IO.on('playerJoinedRoom', function(data) {                          // As a player joins the game, instantiate a crafty entity
                console.log("Screen.playerJoinedRoom()", data);
                App.players[data.socketid] =
                    Crafty.e("2D, Canvas, Player, WebsocketController")
                    .setPosition(App.PLAYERCFG);
            });
            IO.on('padEvent', function(data) {                                  // Forward pad events to the target crafty entity
                //console.log("Screen.padEvent", data);
                App.players[data.socketid].onPadEvent(data);
            });

            $("body").keydown(function(e) {                                     // Keyboard events
                switch (e.keyCode) {
                    case 49:                                                    // 1: Restart game
                        App.restart();
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
        restart: function() {
            $.each(App.players, function(i, p) {
                p.setPosition(App.PLAYERCFG);
            });

            IO.emit('restart');

            var countDown = 3,
                step = function() {
                    $(".screen-msg").text(countDown);
                    if (countDown === 0) {
                        App.run();
                    } else {
                        setTimeout(step, 1000);
                    }
                    countDown--;
                };

            $(".screen-msg").text("Starting...");
            setTimeout(step, 1000);
        },
        run: function() {
            var startTime = new Date().getTime();

            App.timerHandler = setInterval(function() {
                $(".screen-msg").text(App.HHMMSS(new Date().getTime() - startTime));
            }, 53);
        },
        HHMMSS: function(sec_num) {
            var minutes = Math.floor((sec_num) / 60000),
                seconds = Math.floor((sec_num - (minutes * 60000)) / 1000),
                milliseconds = Math.floor((sec_num - (minutes * 60000) - (seconds * 1000)) / 10);

            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            if (milliseconds < 10) {
                milliseconds = "0" + milliseconds;
            }
            return minutes + ':' + seconds + ':' + milliseconds;
        }
    };

    App.init();

}($));
