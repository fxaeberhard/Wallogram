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
        this.requires("2D, Canvas, Color")										// Requirements
            .attr({x: 0, y: 0, w: 20, h: 100})
            .color("white")
//            .bind("EnterFrame", function() {
//            })
            .bind("KeyDown", function() {
                if (this.has("Keyboard") || this.has("WebsocketController")) {
                    if (this.isDown('LEFT_ARROW')) {
                        this.run(-1);
                    }
                    if (this.isDown('RIGHT_ARROW')) {
                        this.run(1);
                    }
                    if (this.isDown('SPACE') || this.isDown('UP_ARROW') || this.isDown('A')) {
                        this.animate("jump");
                    }
                }
            })
            .bind("KeyUp", function() {
                if (!this.isDown('UP_ARROW')
                    && !this.isDown('DOWN_ARROW')) {
                    this.run(0);
                }
            });
    },
    runOnce: function() {
        this.originX = this._x;
        this.originY = this._y;
        this.runOnce = true;
    },
    idle: function() {
        if (this.onground.length > 0) {
            this.animate("idle", -1);
        }
        this.currentDir = 0;
        return this;
    },
    run: function(dir) {
        if (this.has("Keyboard") || this.has("WebsocketController")) {
            this.currentDir = dir;
            if (this.onground.length > 0) {
                this.animate((dir) ? "run" : "idle", -1);
            }
        }
        return this;
    }
});
