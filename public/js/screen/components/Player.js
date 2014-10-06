/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.c("Player", {
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.currentDir = 0;
        this.requires("2D, Canvas, Box2D")                                      // Requirements
            .bind("EnterFrame", function() {
                var body = this.body;                                           // Get the var body from the child.
                if (!this.sideContact && this.isDown('LEFT_ARROW')) {           // If right arrow is down
                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
                    body.m_linearVelocity.x = -5;                               // Adds to the linearVelocity of the box.
                    this.flip();
                }
                if (!this.sideContact && this.isDown('RIGHT_ARROW')) {          // If right arrow is down
                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
                    body.m_linearVelocity.x = 5;                                // Adds to the linearVelocity of the box.
                    this.unflip();
                }
                if (this.onground && (this.isDown('SPACE') || this.isDown('UP_ARROW') || this.isDown('A'))) {
                    //console.log("EnterFrame(): jumping");
                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
                    //this.body.m_linearVelocity.y = 0;
                    //console.log(body);
                    body.ApplyImpulse(// Applys and impulse to the player. (Makes it jump)
                        new b2Vec2(0, 500),
                        body.GetWorldCenter()
                        );
                    //console.log(body);
                    this.animate("jump");
                    this.onground = false;
                }
            })
            .onContact("Box2D", function(fixtures) {
                var onGround = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "foot";
                });
                if (onGround) {
                    if (!this.onground
                        && this.body.m_linearVelocity.y <= 1.5 && this.body.m_linearVelocity.y >= -1.5) {
                        //console.log("Screen.onContact(): ground hit");
                        this.onground = true;
                        this.run(this.currentDir);
                    }
                    this.sideContact = false;
                } else {
                    this.sideContact = true;
                }
                return;
                if (onGround) {
                    if (!this.onground) {
//                        && this.body.m_linearVelocity.y <= 1.5 && this.body.m_linearVelocity.y >= -1.5) {
                        //console.log("Screen.onContact(): ground hit");
                        this.onground = true;
                        this.run(this.currentDir);
                    }
                    this.sideContact = false;
                } else {
                    this.sideContact = true;
                }
            })
            .bind("KeyDown", function() {
                if (this.isDown('LEFT_ARROW')) {
                    this.run(-1);
                }
                if (this.isDown('RIGHT_ARROW')) {
                    this.run(1);
                }
            })
            .bind("KeyUp", function() {
                if (!this.isDown('LEFT_ARROW')
                    && !this.isDown('RIGHT_ARROW')) {
                    this.run(0);
                }
            });

    },
    idle: function() {
        if (this.onground) {
            this.animate("idle", -1);
        }
        this.currentDir = 0;
        return this;
    },
    run: function(dir) {
        this.currentDir = dir;
        if (this.onground) {
            this.animate((dir) ? "run" : "idle", -1);
        }
        return this;
    }
});

/**
 * 
 */
Crafty.c("WebsocketController", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.states = {};
    },
    isDown: function(key) {
        return this.states[key];
    },
    onPadEvent: function(e) {
        this.states[e.position] = e.type === "down";
        this.trigger(e.type === "down" ? "KeyDown" : "KeyUp");
    }
});

/**
 * 
 */
Crafty.c("Mannequin", {
    ANIMSPEED: 800,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, MannequinSprite, SpriteAnimation")               // Requirements
            .attr({x: 100, w: 64, h: 64})                                       // set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .animate("idle", -1)                                                // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 1.0,
                friction: 0.2,
                restitution: 0.1,
                shape: [[this.w / 3, this.w / 4], [2 * this.w / 3, this.w / 4], [2 * this.w / 3, this.w - 2], [this.w / 3, this.w - 2]]
            })
            .addFixture({//                                                     // Add feet sensor
                bodyType: 'dynamic',
                density: 1.0,
                friction: 0.2,
                restitution: 0,
                shape: [[this.w / 3, this.w - 5], [2 * this.w / 3, this.w - 5], [2 * this.w / 3, this.w], [this.w / 3, this.w]],
                isSensor: true,
                userData: "foot"
            });

        this.body.SetFixedRotation(true);
    }
});


/**
 * 
 */
Crafty.c("WalloBot", {
    ANIMSPEED: 8000,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, WalloBotSprite, SpriteAnimation")                // Requirements
            .attr({x: 100, w: 150, h: 150})                                     // Set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .animate("idle", -1)                                                 // Run idle animation
            .box2d({
                bodyType: 'static',
                density: 1.0,
                friction: 0.2,
                restitution: 0.1,
                shape: [[this.w / 3, this.w / 4], [2 * this.w / 3, this.w / 4], [2 * this.w / 3, this.w], [this.w / 3, this.w]]
            })
            .addFixture({//                                                     // Add feet sensor
                bodyType: 'dynamic',
                density: 1.0,
                friction: 0.2,
                restitution: 0,
                shape: [[this.w / 3, this.w - 5], [2 * this.w / 3, this.w - 5], [2 * this.w / 3, this.w], [this.w / 3, this.w]],
                isSensor: true,
                userData: "foot"
            });

        this.body.SetFixedRotation(true);
    }
});

/**
 * 
 */
Crafty.c("SlowBigWalloBot", {
    ANIMSPEED: 8000,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, WalloBotSprite, SpriteAnimation")                // Requirements
            .attr({x: 100, w: 150, h: 150})                                     // Set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .animate("idle", -1)                                                 // Run idle animation
            .box2d({
                bodyType: 'static',
                density: 1.0,
                friction: 0.2,
                restitution: 0.1,
                shape: [[this.w / 3, this.w / 4], [2 * this.w / 3, this.w / 4], [2 * this.w / 3, this.w], [this.w / 3, this.w]]
            })
            .addFixture({//                                                     // Add feet sensor
                bodyType: 'dynamic',
                density: 1.0,
                friction: 0.2,
                restitution: 0,
                shape: [[this.w / 3, this.w - 5], [2 * this.w / 3, this.w - 5], [2 * this.w / 3, this.w], [this.w / 3, this.w]],
                isSensor: true,
                userData: "foot"
            });

        this.body.SetFixedRotation(true);
    }
});
