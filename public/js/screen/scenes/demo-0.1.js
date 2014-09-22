/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.scene("demo", function() {
    Crafty.background("#002");                                                  // this sets the background to a static dark blue

    Crafty.e("2D, Canvas, Player, KeyboardController")
        .attr({x: 300, y: 500, z: 5});                                          // make player entity

    Crafty.e("2D, Canvas, Solid, Color")
        .attr({x: 0, y: 550, w: 600, h: 50})
        .color("green");                                                        // make a stable floor block at the bottom

    Crafty.e("2D, Canvas, Platform")
        .attr({x: 450, y: 200, w: 300, h: 300});
    
    for (var i = 0; i < 5; i++) {                                               // make several platform entities
        Crafty.e("2D, Canvas, Platform")
            .attr({x: 150, y: i * 200 + 50});
    }
});
