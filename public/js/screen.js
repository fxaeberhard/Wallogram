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

            $.getJSON("levels/wallcomem.json", null, function(cfg) {            // Retrieve current level
                App.setCfg(cfg);                                                // Update game cfg

                App.initCrafty();                                               // Init crafty

                App.bindEvents();                                               // Bind game events

                IO.emit('hostCreateNewGame');                                   // Join a game

                App.initEdition();

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

                $(".wallo-admin").append("<a href='pad.html?gameId=" + data.gameId + "' target='_blank'>Pad</a>")
                	.append("<div id='gameId'>gameId = " + data.gameId + "</div>");
            });

            IO.on('heartBeat', function(data) {
                $.each(App.players, function(id, player) {                      // checking for each players on host and each player received from server if they still exist
                    //console.log("Screen.heartBeat()");
                    if (id.indexOf("DEBUG") === -1 &&
                        $.inArray(id, data) === -1) {                          // if the player doews not exist in the returned value 
                        console.log(player);
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

            var stats = new Stats();                                            // Initialize fps counter
            stats.setMode(0);                                                   // 0: fps, 1: ms
            document.body.appendChild(stats.domElement);
            stats.begin();
            Crafty.bind("RenderScene", function() {
                stats.end();
                stats.begin();
            });
        },
        resetPlayer: function(data){
        	console.log(data[0].obj)
        	data[0].obj.body.SetLinearVelocity(new b2Vec2(0,0));									// Reset velocity 
        	data[0].obj.setPosition(App.cfg.player);                                      			// Destroy the player entity
		},
        setState: function(newState) {
            if (App.state === newState)
                return;

            console.log("Screen.setState(" + newState + ")");

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
                    //IO.emit('restart');                                       // Notify pads
                    App.showCountdown();
                    break;

                case "run":                                                     // Play
                    var startTime = new Date().getTime();
                    App.timerHandler = setInterval(function() {
                        $(".screen-msg").text($.HHMMSS(new Date().getTime() - startTime));
                    }, 53);
                    break;

                case "win":                                                     // Somebody reach the goal
                    $(".screen-msg").html("Final time<br />" + $(".screen-msg").html());
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
            $("body").width(App.cfg.width).height(App.cfg.height);
            Crafty.init(App.cfg.width, App.cfg.height, $(".wallo-crafty").get(0));// Init crafty
            Crafty.canvas.init();
            Crafty.box2D.init(0, 10, 16, true);                                 // Init the box2d world, gx = 0, gy = 10, pixeltometer = 32

            //Crafty.scene($.urlParam("scene") || "demo");                      // Instantiate the scene

            $.each($.App.cfg.entities, function(i, p) {                         // Add entities from config file
                var entity = Crafty.e(p.components).setConfig(p);
                entity.cfgObject = p;
            });

            App.addDebugPlayer();
        },
        addPlayer: function(cfg) {
            App.players[cfg.socketId] = Crafty.e("Player, WebsocketController")
                .setPosition(App.cfg.player);

            if ($.size(App.players) === 1) {
                this.setState("countdown");
            }
        },
        addDebugPlayer: function() {
            if (!App.players.DEBUG) {
                App.players.DEBUG = Crafty.e("Player, Keyboard").setPosition(App.cfg.player);
            } else {
                App.players.DEBUG.destroy();
                App.players.DEBUG = null;
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
        },
        /* *************************************
         *                Edition              *
         * *********************************** */
        initEdition: function() {
            $("body").prepend('<div class="wallo-edit"><div class="wallo-edit-dd"></div></div>');

            YUI().use("dd-drag", "resize", "event-mouseenter", function(Y) {
                var node = Y.one(".wallo-edit-dd"),
                    drag = new Y.DD.Drag({node: node}),
                    resize = new Y.Resize({node: node}),
                    isDragging = false,
                    toggleIsDragging = function() {
                        isDragging = !isDragging;
                    };

                drag.on(["drag:start", "drag:end"], toggleIsDragging);
                drag.on(["drag:drag", "drag:end"], App.savePositions);

                resize.on(["resize:start", "resize:end"], toggleIsDragging);
                resize.on(["resize:resize", "resize:end"], App.savePositions);

                node.after("mouseleave", function() {
                    if (!isDragging) {
                        App.hideEdition();
                    }
                });
            });
        },
        showEdition: function(entity) {
            $('.wallo-edit').show();
            $('.wallo-edit-dd').css("left", entity.x)
                .css("top", entity.y)
                .width(entity.w)
                .height(entity.h);

            $('.wallo-edit-dd')[0].currentEntity = entity;
        },
        hideEdition: function() {
            $('.wallo-edit').hide();
        },
        savePositions: function() {
            var node = $('.wallo-edit-dd'),
                cfg = {
                    x: node.position().left,
                    y: node.position().top,
                    w: node.width(),
                    h: node.height()
                };
            node[0].currentEntity.setConfig(cfg);
            $.extend(node[0].currentEntity.cfgObject, cfg);
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
        }
    };
    $.App = App;                                                                // Set up global reference

    App.init();                                                                 // Init

}($));
