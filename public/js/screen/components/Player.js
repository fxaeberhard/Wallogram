/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.c("Player", {
    ANIMSPEED: 800,
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("2D, Canvas, MannequinSprite, SpriteAnimation, Box2D")   // Requirements
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .idle()
            .attr({x: 100, w: 128, h: 128})                                     // set width and height
            .box2d({
                bodyType: 'dynamic',
                density: 1.0,
                friction: 0.2,
                restitution: 0.1,
                shape: "box"
            })
            .bind("EnterFrame", function() {
                var body = this.body;                                           // Get the var body from the child.
                if (this.isDown('LEFT_ARROW')) {                                // If right arrow is down
                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
                    body.m_linearVelocity.x = -5;                               // Adds to the linearVelocity of the box.
                    this.flip();
                }
                if (this.isDown('RIGHT_ARROW')) {                               // If right arrow is down
                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
                    body.m_linearVelocity.x = 5;                                // Adds to the linearVelocity of the box.
                    this.unflip();
                }
                if (this.jumped && this.onground) {
                    console.log("EnterFrame(): jumped");
                    this.jumped = false;
                }
                if (this.onground && !this.jumped && (this.isDown('SPACE') || this.isDown('UP_ARROW') || this.isDown('A'))) {
                    console.log("EnterFrame(): jumping");

                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
                    this.body.m_linearVelocity.y = 0;
                    body.ApplyImpulse(new b2Vec2(0, 1600), body.GetWorldCenter());//Applys and impulse to the player. (Makes it jump)
                    this.animate("jump");

//                    var pos = body.GetPosition();
                    // if (this.fixtures.length> 0) {
                    // if (body.GetLinearVelocity().y  -1) {//Stops player from sometimes jumpping higher then suppose to
//                        var Hit = GetBodyAtPoint(this.x, this.y + (this.height / 2 + 2), true);//Under
//                        var Hit1 = GetBodyAtPoint(body.x - (body.width / 2) + 2, body.y + (body.height / 2 + 2), true);//Down-Left
//                        var Hit2 = GetBodyAtPoint(body.x + (body.width / 2) - 2, body.y + (body.height / 2 + 2), true);//Down-Right
//                        if (Hit != null && Hit.m_userData != TheChild) {
//                        Crafty.box2D.world.QueryPoint(function() {
//                        }, new b2Vec2(pos.x, pos.y + 65));
//                        var contacts = this.contact("Box2D"),
//                            ctct = contacts[0];
//                        console.log(ctct);
//                    Crafty.box2D.world.QueryPoint()
//                    this.fixtures[0].TestPoint(new b2Vec2(0, 128))
//                    body.ApplyImpulse(new b2Vec2(0, 1000), body.GetWorldCenter());//Applys and impuls to the player. (Makes it jump)
//                }
//                        }
//                        else if (Hit1 != null && Hit1.m_userData != TheChild || Hit2 != null && Hit2.m_userData != TheChild) {

                    //                          body.ApplyImpulse(new b2Vec2(0.0, -3.0), body.GetWorldCenter());
//                        }                                                       //Applys and impuls to the player. (Makes it jump)
//                    }
//                    else {
//                        if (this.contact("Box2D")) {
//                            this.isjumping = false;
                    //    }

                    this.jumped = true;
                    this.onground = false;
                }
//                if (this.isjumping) {
////                    this.isjumping += 1;
//                } else if (this.isrunning) {
////                    if (this.body.m_linearVelocity.Length() >= 10) {     // Apply maximum speed limiting
////                        this.body.m_linearVelocity.Normalize();
////                        this.body.m_linearVelocity.Multiply(10);
////                    }
//                    if (this.body.m_linearVelocity.x >= 10) {     // Apply maximum speed limiting
////                        this.body.m_linearVelocity.Normalize();
//                        this.body.m_linearVelocity.x = 10;
//                    }
//
//                    // Increase power
//                    this.body.ApplyForce(new b2Vec2(1000 * this.isrunning, 0), this.body.GetWorldCenter());
//                }
            })
            .onContact("Box2D", function() {
//                var that = this, pos = this.body.GetPosition();
//                if (this.isjumping && this.jumped && this.body.m_linearVelocity.y === 0) {
//                    Crafty.box2D.world.QueryPoint(function() {
//                        this.run(this.isrunning);
//                    }, new b2Vec2(pos.x, pos.y + 65 / 2 + 2));
//                    console.log(e, this.isrunning);
////                    this.isjumping = false;
//                }

                console.log("lm", this.body.m_linearVelocity.y);
                if (this.body.m_linearVelocity.y <= 1.5 && this.body.m_linearVelocity.y >= -1.5 && !this.onground) {
                    console.log("onGround");
                    this.onground = true;
                    this.run(this.isrunning);
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

        this.body.SetFixedRotation(true);
//        this.addFixture({
//            bodyType: 'static',
//            density: 1.0,
//            friction: 10,
//            restitution: 0,
//            shape: [
//                [0, 0],
//                [10, 0],
//                [10, h],
//                [0, h]
//            ]
//        });
    },
    idle: function() {
        if (this.onground) {
            this.animate("idle", -1);
        }
        this.isrunning = 0;
        return this;
    },
    run: function(dir) {
        this.isrunning = dir;

        if (this.onground) {
            if (dir) {
                this.animate("run", -1);
            } else {
                this.animate("idle", -1);
            }
        }
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
