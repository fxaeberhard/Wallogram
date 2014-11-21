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
		this.rightTouch = false
		this.leftTouch = false
		this.footTouch = false                               
        this.requires("2D, Canvas, Box2D")
    	.bind("EnterFrame", function() {
    		var body = this.body,
    			velocity = body.GetLinearVelocity(),
    			forceX
    		if(this.isPlaying("idle")){
        		this.run(1);
        		body.SetLinearVelocity(new b2Vec2(2, velocity.y))
    		}
    		if (velocity.x != 0 && this.dead && this.leftTouch == false && this.rightTouch == false){			// slow down to a stop when dead
        		if (velocity.x < 0){
				    forceX = -velocity.x
		        }
		        if (velocity.x > 0) {	
			        forceX = -velocity.x
		        }
		        if (forceX != 0) {																// Apply moving force if forceX exist
                    body.ApplyImpulse(
                        new b2Vec2(forceX, 0),
                        body.GetWorldCenter()
                    )
                }
            }            
    	})
    },
    run: function(dir) {
        this.currentDir = dir;
        var body = this.body;
        this.animate((dir) ? "run" : "idle", -1);
        return this;
    },
    BeginContact: function(fixtures, index){															// Contact listener relating an Enemy entity
		var index2,
			body = this.body,
			velocity = body.GetLinearVelocity();
		
		if(index == 1) {																				// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
		
		this.sensorCheck(fixtures[index].GetUserData(), true)
		
		if (fixtures[index2].GetBody().GetUserData().name == "player" && this.dead == false ){ 			// If other entity is a player and the enemy is not dead
			if(fixtures[index].GetUserData() == "top"){													// If player gets in contact with top sensor, enemy dies
				this.animate("die");
				body.SetLinearVelocity(new b2Vec2(0, velocity.y))
				this.dead = true;
			}
			
		if(this.leftTouch || this.rightTouch || this.footTouch){  										// If player gets in contact with any side or bottom
	            fixtures[index2].GetBody().GetUserData().hit(this)										// Player gets hit
			}
		}
		
		if (this.rightTouch == true && velocity.x > -1 && this.dead == false) {		// Switch direction when it gets in contact with something
	        this.flip()
        	body.SetLinearVelocity(new b2Vec2(-2, velocity.y))
		} else if(this.leftTouch == true && velocity.x < 1 && this.dead == false) {
        	this.unflip()
    		body.SetLinearVelocity(new b2Vec2(2, velocity.y))
		}
    },
    EndContact: function(fixtures, index){																// Contact listener relating an Enemy entity
		this.sensorCheck(fixtures[index].GetUserData(), false)
    },
    sensorCheck: function(fixtureName, value) {
	    switch(fixtureName){
			case "leftSide":
				this.leftTouch = value;
			break;
			case "rightSide":
				this.rightTouch = value;
			break;
			case "footTouch":
				this.footTouch = value;
			break;
		}
    }
});

Crafty.c("Hotdog", {
	ANIMSPEED: 1000,
	init: function() {
		this.requires("Enemy, HotdogSprite, SpriteAnimation")               	// Requirements
            .attr({x: 100, y: 100, w: 64, h: 64, name: "hotdog"})               // set width and height
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
            .addFixture({														// Add foot sensor
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
            .addFixture({	                                                   	// Add right sensor
                bodyType: 'dynamic',
                shape: [[(3 * this.w / 4) - 3, (this.w / 10) + 3],
                		[(3 * this.w / 4) + 3, (this.w / 10) + 3], 
                		[(3 * this.w / 4) + 3, (11 * this.w / 12) - 3], 
                		[(3 * this.w / 4) - 3, (11 * this.w / 12) - 3]],
                isSensor: true,
                userData: "rightSide"
            })
            .addFixture({														// Add top sensor
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