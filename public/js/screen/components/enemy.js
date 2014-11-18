/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.c("Enemy", {
	init: function() {  																			// init function is automatically run when entity with this component is created
			this.dead = false                                                        
	        this.requires("2D, Canvas, Box2D")
        	.bind("EnterFrame", function() {
        		var body = this.body,
        			velocity = body.GetLinearVelocity()
        		if(this.isPlaying("idle")){
	        		this.run(1);
	        		body.SetLinearVelocity(new b2Vec2(2, velocity.y))
        		}
        		if(velocity.x > 0 && !(this.leftTouch || this.rightTouch) && this.isPlaying("run")) {
	        		if (this._flipX) {
		        		this.unflip()
	        		}
	        		body.SetLinearVelocity(new b2Vec2(2, velocity.y))
        		} else if(velocity.x < 0 && !(this.leftTouch || this.rightTouch) && this.isPlaying("run")) {
	        		if (this._flipX || this._flipX == undefined) {
		        		this.flip()
	        		}
	        		body.SetLinearVelocity(new b2Vec2(-2, velocity.y))
        		}
        	})
        	.onContact("Box2D", function(fixtures) {
	        	var body = this.body,
        			velocity = body.GetLinearVelocity()
        			
	        	var onGround = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "foot";
                }),
                	topTouch = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureB.m_userData === "top"
                });
                this.leftTouch = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "leftSide";
                });
				this.rightTouch = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "rightSide";
                });
                /*
if(topTouch){
					console.log(topTouch.contact.fixtureA.m_userData);
				}
*/
                if(this.leftTouch && velocity.x == 0){							// set direction
                    this.unflip()
                    body.SetLinearVelocity(new b2Vec2(2, velocity.y))
                    console.log("swiiittcchchhh")
                } else if (this.rightTouch && velocity.x == 0){
	                console.log(velocity.x)
					this.flip()
					body.SetLinearVelocity(new b2Vec2(-2, velocity.y))
				}
				
        	})
        	.onContact("Player", function(fixtures) {
	        	var body = this.body,
        			velocity = body.GetLinearVelocity(),
					bottomTouch = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "foot";
                }),
	        		topTouch = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureB.m_userData === "top"
                }),
					leftTouch = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "leftSide";
                }),
					rightTouch = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "rightSide";
                });
                
                
				if (topTouch && this.dead == false) {													// When a player jumps on the head of enemy, he falls and dies
					this.animate("die")
					body.SetLinearVelocity(new b2Vec2(0, velocity.y))
					this.dead = true
					console.log(body.GetFixtureList().GetShape())
				}
				
				if (bottomTouch || leftTouch || rightTouch) {
					
				}
        	})
    },
    run: function(dir) {
        this.currentDir = dir;
        var body = this.body;
        this.animate((dir) ? "run" : "idle", -1);
        return this;
    }
});

Crafty.c("Hotdog", {
	ANIMSPEED: 1000,
	init: function() {
		this.requires("Enemy, HotdogSprite, SpriteAnimation")               			// Requirements
            .attr({x: 100, y: 100, w: 64, h: 64})                               // set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 16)                             // Set up animation
            .reel("run", this.ANIMSPEED, 0, 1, 16)
            .reel("die", this.ANIMSPEED, 0, 11, 8)
            .animate("idle", -1)                                                // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 2.0,
                friction: 0,
                restitution: 0,
                shape: [[this.w / 4, this.w / 10], 
                		[3 * this.w / 4, this.w / 10], 
                		[3 * this.w / 4, 11 * this.w / 12], 
                		[this.w / 4, 11 * this.w / 12]],
                userData: "body"
            })
            .addFixture({														// Add left sensor
                bodyType: 'dynamic',
                shape: [[(this.w / 4) + 3, (11 * this.w / 12) - 3], 
                		[(3 * this.w / 4) - 3, (11 * this.w / 12) - 3], 
                		[(3 * this.w / 4) - 3, (11 * this.w / 12) + 3], 
                		[(this.w / 4) + 3, (11 * this.w / 12) + 3]],
                isSensor: true,
                userData: "foot"
            })
            .addFixture({														// Add left sensor
                bodyType: 'dynamic',
                shape: [[(this.w / 4) - 3, (this.w / 10) + 3], 
                		[(this.w / 4) + 3, (this.w / 10) + 3], 
                		[(this.w / 4) + 3, (11 * this.w / 12) - 3], 
                		[(this.w / 4) - 3, (11 * this.w / 12) - 3]],
                isSensor: true,
                userData: "leftSide"
            })
            .addFixture({	                                                   	// Add feet sensor
                bodyType: 'dynamic',
                shape: [[(3 * this.w / 4) - 3, (this.w / 10) + 3],
                		[(3 * this.w / 4) + 3, (this.w / 10) + 3], 
                		[(3 * this.w / 4) + 3, (11 * this.w / 12) - 3], 
                		[(3 * this.w / 4) - 3, (11 * this.w / 12) - 3]],
                isSensor: true,
                userData: "rightSide"
            })
            .addFixture({														// Add left sensor
                bodyType: 'dynamic',
                shape: [[(this.w / 4) + 3, (this.w / 10) + 3], 
                		[(3 * this.w / 4) - 3, (this.w / 10) + 3], 
                		[(3 * this.w / 4) - 3, (this.w / 10) - 3], 
                		[(this.w / 4) + 3, (this.w / 10) - 3]],
                isSensor: true,
                userData: "top"
            });
        this.body.SetFixedRotation(true);
	}
});