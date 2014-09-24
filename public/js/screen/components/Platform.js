/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.c("Platform", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("2D, Canvas, Box2D, MouseHover")                          // allows the entity to be drawn as a colored box
            .attr({w: 100, h: 20})                                              // set width and height
            .box2d({
                bodyType: 'static',
                density: 1.0,
                friction: 10,
                restitution: 0,
                shape: "box"
            });
    }
});

/**
 * 
 */
Crafty.c("Target", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("2D, Canvas, Box2D, Color, MouseHover")                   // allows the entity to be drawn as a colored box
            .attr({w: 30, h: 30})                                               // set width and height
            .color("red")                                                       // set color
            .box2d({
                bodyType: 'static',
                density: 1.0,
                friction: 10,
                restitution: 0,
                isSensor: true,
                shape: "box"
            })
            .onContact("Player", function(contacts) {
                $.App.setState("win");
            });
    }
});

/**
 *
 */
Crafty.c('MouseHover', {
    init: function() {
        this.requires("Mouse")
            .bind('MouseOver', function() {
                $.App.showEdition(this);
                //document.body.style.cursor = "pointer";
            })
            .bind('MouseOut', function() {
                $.App.hideEdition();
                //document.body.style.cursor = "default";
            });
        return this;
    },
    //remove: function () {
    //    document.body.style.cursor = "default";
    //}
});

/**
 * 
 */
Crafty.c("Falling", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
//        this.requires("Platform, Gravity")
//            .gravity("Solid")                                                   // the player will stop falling if it hits anything with a component of Solid
//            .gravityConst(1);                                                   // determines speed of falling
    },
    handle: function() {                                                        // happens each frame of animation
        this.y += this.dx;                                                      // move platform by speed sideways
        this.antigravity();
//        this.gravity();
        //   if (this.y > 0)
//            this.x -= 705;                                                      // wrap around from right side
//        if (this.x < -100)
//            this.x += 705;                                                      // wrap around from left side
    }
});
