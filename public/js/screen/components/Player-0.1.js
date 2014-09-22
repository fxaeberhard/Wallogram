/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.c("Player", {
    ANIMSPEED: 500,
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Twoway, Gravity, MannequinSprite, SpriteAnimation")      // Requirements
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("run", this.ANIMSPEED, 0, 1, 14)
            .reel("jump", this.ANIMSPEED, 0, 3, 4)
            .animate("idle", -1)
            .bind("Moved", this.onMove)                                         // bind the Moved event to the "restrict" function below
            .gravity("Solid")                                                   // the player will stop falling if it hits anything with a component of Solid
            .gravityConst(1)                                                    // determines speed of falling
            .attr({w: 128, h: 128});                                              // set width and height
        //.color("#FA0");                                                       // set color to orange
    },
    jump: function() {
        this.animate("run");
    },
    onMove: function() {
        if (this.x > 580)                                                       // keep the player on the screen
            this.x = 580;
        if (this.x < 0)
            this.x = 0;
    }
});
Crafty.c("KeyboardController", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Keyboard")
            .bind("keyDown", function() {
                if (this.isDown('SPACE'))
                    this.jump();
            });
        this.requires("Twoway")
            .twoway(8, 15)                                                     // set two-way velocity to 8 pixels per frame, jump speed to 15
            .bind("NewDirection", function(e) {
                console.log("newdirection", e);
                if (e.x < 0) {
                    this.flip();
                    this.animate("run", -1);
                } else if (e.x > 0) {
                    this.unflip();
                    this.animate("run", -1);
                } else {
                    this.animate("idle", -1);
                }
                if (e.y > 0) {
                    this.animate("jump");
                }
            });
    }
});
Crafty.c("WebsocketController", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
    }
});
