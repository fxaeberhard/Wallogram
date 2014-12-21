/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.c("Enemy", {
	init: function() {  																			// init function is automatically run when entity with this component is created
		this.dead = this.rightTouch = this.leftTouch = this.footTouch = false 
        this.requires("2D, Canvas, Box2D, MouseHover")
	    	.bind("EnterFrame", function() {
	    		var body = this.body,
	    			velocity = body.GetLinearVelocity(),
	    			ratio = Crafty.box2D.PTM_RATIO,
					position = body.GetPosition(),
	    			forceX
	    		if (this.runOnce != true) {
		    		this.setOrigin()
	    		}
	    		if($.App.debug){
	    			this.animate("idle", -1)
	    			body.SetLinearVelocity(new b2Vec2(0, 0))
	    			if(this.moving != true){
						if(this.x != this.xOrigin || this.y != this.yOrigin){
							this.setOrigin()
						}
					} else {
						if(this.x != this.x1 || this.y != this.y1) {
							body.SetPosition(new b2Vec2(this.xOrigin / ratio, this.yOrigin / ratio))
						}
					}
					this.moving = false
	    		} else {
	    			if(this.moving == false){
		    			this.start()
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
		        this.moving = true
		        }
	    	})
    },
    setOrigin: function() {
	    this. xOrigin = this.x;
	    this. yOrigin = this.y;
	    this.runOnce = true;
    },
    start: function() {
	    this.setDirection();
    },
    run: function(dir) {
        this.currentDir = dir;
        var body = this.body;
        this.animate((dir) ? "run" : "idle", -1);
        return this;
    },
    die: function() {
	    var enemy = this;
	    this.reseting = true;
	    clearTimeout(this.deathReset)
	    setTimeout(function() {
		    enemy.reset()
		}, 1000);																						// Set 3 second Delay before reseting

    },
    reset: function() {								
		this.attr({"components": "Hotdog", "x": this. xOrigin, "y": this. yOrigin})				// Reset the player position
        this.dead = false;
        this.reseting = false;
        this.setDirection();
        console.log("Enemy.reset()", this);
    },
    setDirection: function() {
	    if (this.direction == "left") {																	// set initial direction
		    this.flip()
			this.animate("run", -1)
			this.body.SetLinearVelocity(new b2Vec2(-2, 0))
	    } else {
		    this.animate("run", -1)
			this.body.SetLinearVelocity(new b2Vec2(2, 0))
	    }
    },
    BeginContact: function(fixtures, index){															// Contact listener relating an Enemy entity
		var index2,
			player = this,
			body = this.body,
			velocity = body.GetLinearVelocity();
		
		if(index == 1) {																				// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
		
		if (fixtures[index2].GetBody().GetUserData().name == "player" && this.dead == false ){ 			// If other entity is a player and the enemy is not dead
			if(fixtures[index].GetUserData() == "top"){													// If player gets in contact with top sensor, enemy dies
				var enemy = this,
					fix = [],
					position = body.GetPosition()
					fixLoop = body.GetFixtureList()
				console.log(fixtures[index2])
				this.animate("die");
				for(var i = 0; i < body.m_fixtureCount;  i++){
					fix.push(fixLoop)
					fixLoop = fixLoop.GetNext()
				}

				var fixture = $.arrayFind(fix, function(i, f) {
                    return f.m_userData === "body";
                })
					                
				body.SetLinearVelocity(new b2Vec2(0, velocity.y))
				this.dead = true;
				this.deathReset = setTimeout(function() {
					enemy.die();
				}, 10000)
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
            .attr({x: 100, y: 100, w: 64, h: 64, name: "enemy"})               // set width and height
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
Crafty.c("Lab_Enemy", {
	ANIMSPEED: 1000,
	init: function() {
		this.requires("Enemy, lab_enemy, SpriteAnimation")               	// Requirements
            .attr({x: 100, y: 100, w: 44, h: 80, name: "enemy"})               // set width and height
			.reel("idle", this.ANIMSPEED, 0, 0, 1)
            .reel("run", this.ANIMSPEED, 0, 0, 24)								// Set up animation
            .reel("die", this.ANIMSPEED, 0, 0, 1)
            .animate("idle", -1)                                                // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 2.0,
                friction: 0,
                restitution: 0,
                shape: [[this.w * (60 / 187), this.h * (51 / 340)], 
                		[this.w * (162 / 187), this.h * (51 / 340)], 
                		[this.w * (162 / 187), this.h * (315 / 340)], 
                		[this.w * (60 / 187), this.h * (315 / 340)]],
                userData: "body"
            })
            .addFixture({														// Add foot sensor
                bodyType: 'dynamic',
                shape: [[this.w * (60 / 187) + 3, this.h * (315 / 340)- 3], 
                		[this.w * (162 / 187) - 3, this.h * (315 / 340)- 3], 
                		[this.w * (162 / 187) - 3, this.h * (315 / 340)+ 3], 
                		[this.w * (60 / 187) + 3, this.h * (315 / 340)+ 3]],
                isSensor: true,
                userData: "foot"
            })
            .addFixture({														// Add left sensor
                bodyType: 'dynamic',
                shape: [[this.w * (60 / 187) - 3, this.h * (51 / 340) + 3], 
                		[this.w * (60 / 187) + 3, this.h * (51 / 340) + 3], 
                		[this.w * (60 / 187) + 3, this.h * (315 / 340) - 3], 
                		[this.w * (60 / 187) - 3, this.h * (315 / 340) - 3]],
                isSensor: true,
                userData: "leftSide"
            })
            .addFixture({	                                                   	// Add right sensor
                bodyType: 'dynamic',
                shape: [[this.w * (162 / 187) - 3, this.h * (51 / 340) + 3],
                		[this.w * (162 / 187) + 3, this.h * (51 / 340) + 3], 
                		[this.w * (162 / 187) + 3, this.h * (315 / 340) - 3], 
                		[this.w * (162 / 187) - 3, this.h * (315 / 340) - 3]],
                isSensor: true,
                userData: "rightSide"
            })
            .addFixture({														// Add top sensor
                bodyType: 'dynamic',
                shape: [[this.w * (60 / 187) + 3, this.h * (51 / 340) + 3], 
                		[this.w * (162 / 187) - 3, this.h * (51 / 340) + 3], 
                		[this.w * (162 / 187) - 3, this.h * (51 / 340) - 3], 
                		[this.w * (60 / 187) + 3, this.h * (51 / 340) - 3]],
                isSensor: true,
                userData: "top"
            });
        this.body.SetFixedRotation(true);
	}
});
Crafty.c("Mario_Goomba", {
	ANIMSPEED: 400,
	init: function() {
		this.requires("Enemy, mario_blue_goomba, SpriteAnimation")               	// Requirements
            .attr({x: 100, y: 100, w: 45, h: 45, name: "enemy"})               // set width and height
			.reel("idle", this.ANIMSPEED, 0, 0, 1)
            .reel("run", this.ANIMSPEED, 0, 0, 2)								// Set up animation
            .reel("die", this.ANIMSPEED, 2, 0, 1)
            .animate("idle", -1)                                                // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 3.0,
                friction: 0,
                restitution: 0,
                shape: [[0, 0], 
                		[this.w, 0], 
                		[this.w, this.h], 
                		[0, this.h]],
                userData: "body"
            })
            .addFixture({														// Add foot sensor
                bodyType: 'dynamic',
                shape: [[ 3, this.h - 3], 
                		[this.w - 3, this.h - 3], 
                		[this.w - 3, this.h + 3], 
                		[ 3, this.h + 3]],
                isSensor: true,
                userData: "foot"
            })
            .addFixture({														// Add left sensor
                bodyType: 'dynamic',
                shape: [[- 3, 3], 
                		[3, 3], 
                		[3, this.h - 3], 
                		[- 3, this.h - 3]],
                isSensor: true,
                userData: "leftSide"
            })
            .addFixture({	                                                   	// Add right sensor
                bodyType: 'dynamic',
                shape: [[this.w - 3, 3],
                		[this.w + 3, 3], 
                		[this.w + 3, this.h - 3], 
                		[this.w - 3, this.h - 3]],
                isSensor: true,
                userData: "rightSide"
            })
            .addFixture({														// Add top sensor
                bodyType: 'dynamic',
                shape: [[ 3, 3], 
                		[this.w - 3, 3], 
                		[this.w - 3, - 3], 
                		[ 3, - 3]],
                isSensor: true,
                userData: "top"
            });
        this.body.SetFixedRotation(true);
	}
});