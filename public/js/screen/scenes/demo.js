/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.scene("demo", function() {
    var w = $.App.WIDTH,
        h = $.App.HEIGHT,
        cfg = {
            bodyType: 'static',
            density: 1.0,
            friction: 10,
            restitution: 0,
            shape: [
                [0, 0],
                [w, 0],
                [w, 10],
                [0, 10]
            ]
        };

    // Add platforms
    Crafty.e("Platform").setPosition({x: 10, y: 5});
    Crafty.e("Platform").setPosition({x: 3, y: 10});

    // Add limits
    Crafty.e("2D, Canvas, Box2D")
        .attr({x: 0, y: 0})
        .box2d($.extend(cfg, {
            shape: [[0, 0], [w, 0], [w, 10], [0, 10]]
        }))
        .addFixture($.extend(cfg, {
            shape: [[0, 0], [10, 0], [10, h], [0, h]]
        }))
        .addFixture($.extend(cfg, {
            shape: [[(w - 10), 0], [w, 0], [w, h], [(w - 10), h]]
        }))
        .addFixture($.extend(cfg, {
            shape: [[0, (h - 10)], [w, (h - 10)], [w, h], [0, h]]
        }));
});
