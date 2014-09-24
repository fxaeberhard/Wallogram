/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.scene("comemwall", function() {

    // Add platforms
    $.each($.App.cfg.entities, function(i, p) {
        Crafty.e(p.components)
            .attr(p)
            .setPosition(p);
    });

    // Add limits
    var w = $.App.cfg.width,
        h = $.App.cfg.height,
        cfg = {
            bodyType: 'static',
            density: 1.0,
            friction: 10,
            restitution: 0
        };
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
