/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.scene("demo", function() {
    var w = 600,
        h = 400,
        walls = Crafty.e("2D, Canvas, Box2D")
        .attr({x: 0, y: 0})
        .box2d({
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
        });

    walls.addFixture({
        bodyType: 'static',
        density: 1.0,
        friction: 10,
        restitution: 0,
        shape: [
            [0, 0],
            [10, 0],
            [10, h],
            [0, h]
        ]
    });

    walls.addFixture({
        bodyType: 'static',
        density: 1.0,
        friction: 10,
        restitution: 0,
        shape: [
            [(w - 10), 0],
            [w, 0],
            [w, h],
            [(w - 10), h]
        ]
    });

    walls.addFixture({
        bodyType: 'static',
        density: 1.0,
        friction: 10,
        restitution: 0,
        shape: [
            [0, (h - 10)],
            [w, (h - 10)],
            [w, h],
            [0, h]
        ]
    });
});
