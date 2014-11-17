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
        var currentDir = 0,
        	prevPlatPos = {x: 0, y: 0};
        this.requires("2D, Canvas, Box2D")										// Requirements
            .bind("EnterFrame", function() {
                var body = this.body,
                    velocity = body.GetLinearVelocity(),
                    forceX = 0,
                    landingV;
                
                if ((!this.sideContact || this.onground) && this.isDown('LEFT_ARROW')) {									// If right arrow is down
	                if (velocity.x > -this.TOPSPEED + 1){	     					// If player is still under topspeed (accelerating)
	                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
	                    if (velocity.x > -this.TOPSPEED) {							// set force to 500 if velocity isn't too high
	                        forceX = -this.WALKFORCE;
						}
	                    this.flip();
	                    //console.log("left: "+velocity.x)
		            } else if(velocity.x <= -this.TOPSPEED + 1 && velocity.x >= -this.TOPSPEED){	// If player is in topspeed than fix velocity to topspeed
			            body.SetLinearVelocity(new b2Vec2(-this.TOPSPEED, velocity.y))
		            }
		        }
		        
	            if ((!this.sideContact || this.onground) && this.isDown('RIGHT_ARROW')){									// If right arrow is down
	                if ( velocity.x < this.TOPSPEED - 1 ){       					// If player is still under topspeed (accelerating)
	                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
	                    if (velocity.x < this.TOPSPEED) {							// set force to 500 if velocity isn't too high
	                        forceX = this.WALKFORCE;
	                    }
	                    this.unflip();
	                    //console.log("right: "+velocity.x)
		            } else if(velocity.x >= this.TOPSPEED - 1 && velocity.x <= this.TOPSPEED){ // If palyer is in topspeed than fix velocity to topspeed
			            body.SetLinearVelocity(new b2Vec2(this.TOPSPEED, velocity.y))
		            }
		        }
		        
		        if (velocity.x < 0 && !this.isDown('LEFT_ARROW')){					// If velocity is smaller than 0 and left arrow isn't pressed decrease speed
			        if (velocity.x <= -1) {											// If velocity is smaller or equal to 0 decrease by walkforce else bring it to 0
				        forceX = this.WALKFORCE
					}else{
						body.SetLinearVelocity(new b2Vec2(0, velocity.y))
					}
		        }
		        if (velocity.x > 0 && !this.isDown('RIGHT_ARROW')) {				// If velocity is bigger than 0 and right arrow isn't pressed decrease speed
		        	if(velocity.x >= 1){											// If velocity is bigger or equal to 0 decrease by walkforce else bring it to 0
			        	forceX = -this.WALKFORCE
		        	} else {
			        	body.SetLinearVelocity(new b2Vec2(0, velocity.y))
		        	}
		        }
		        
		        if(this.body.m_contactList && this.body.m_contactList.other.m_userData.name == "movingPlat"){	// If on moving plate, compensate movement.
		        	var contactObject = this.body.m_contactList.other,
		        		PlateformPos = contactObject.GetPosition(),
						playerPosition = this.body.GetPosition(),
						diffPos = {x: 0, y: 0};
		        		if(this.prevPlatPos.x == 0){
			        		this.prevPlatPos.x = PlateformPos.x
			        		diffPos.x = diffPos.y = 0
		        		} else {
			        		diffPos.x = PlateformPos.x - this.prevPlatPos.x
			        		this.prevPlatPos.x = PlateformPos.x
		        		}
		        	this.body.SetPosition(new b2Vec2(playerPosition.x + diffPos.x, playerPosition.y))
		        }
		        
                if ((this.onground || (this.onground && !this.sideContact)) && (this.isDown('SPACE') || this.isDown('UP_ARROW') || this.isDown('A'))) {
                    //console.log("EnterFrame(): jumping");
                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
                    body.ApplyImpulse(											// Apply upward impulse
                        new b2Vec2(0, this.JUMPFORCE),
                        body.GetWorldCenter()
                    )
                    this.animate("jump");
                    this.onground = false;
                }
	            if(!this.isDown('SPACE') 										// apply force downward when jump button is released
            	  && !this.isDown('UP_ARROW')
            	  && !this.isDown('A') 
            	  && !this.onground && body.m_linearVelocity.y < this.DOWNFORCELIMIT){
	                 body.ApplyImpulse(
	                 	new b2Vec2(0, this.DOWNFORCE),
	                 	body.GetWorldCenter()
	                 )
	             this.prevPlatPos = {x: 0, y: 0};								// reset previous position to zero on release of jump. (can't use on press of button because it is too early.)
	            }
	
                if(velocity.x != 0 && !this.onground && 
                	!(this.isDown('RIGHT_ARROW') 
                	  || this.isDown('LEFT_ARROW'))){
	                forceX = -velocity.x * 10;
				}			
				if (forceX != 0) {												// Apply moving force if forceX exist
                    body.ApplyForce(
                        new b2Vec2(forceX, 0),
                        body.GetWorldCenter()
                        )
                }
            })

            .onContact("Box2D", function(fixtures) {
                var onGround = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "foot";
                }),
					leftTouch = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "leftSide";
                }),
					rightTouch = $.arrayFind(fixtures, function(i, f) {
                    return f.contact.fixtureA.m_userData === "rightSide";
                });
                if(leftTouch){
					//console.log(leftTouch.contact.fixtureA.m_userData);
				}
                if (onGround) {
                    if (!this.onground
                    && this.body.m_linearVelocity.y <= 3 
                    && this.body.m_linearVelocity.y >= -3) {
                        //console.log("Screen.onContact(): ground hit");
                        this.onground = true;
                        this.run(this.currentDir);
                    }
                } else {
	                if(leftTouch || rightTouch){
	                    this.sideContact = true;
                    } else {
                    	this.sideContact = false;
					}
                }
                return;
                if (onGround) {
                    if (!this.onground) {
//                        && this.body.m_linearVelocity.y <= 1.5 && this.body.m_linearVelocity.y >= -1.5) {
                        //console.log("Screen.onContact(): ground hit");
                        this.onground = true;
                        this.run(this.currentDir);
                    }
					this.sideContact = false;
                } else {
                    this.sideContact = true;
                }
            })
            .bind("KeyDown", function() {
                if (this.isDown('LEFT_ARROW')) {
                    this.run(-1);
                }
                if (this.isDown('RIGHT_ARROW')) {
                    this.run(1);
                }
            })
            .bind("KeyUp", function() {
                if (!this.isDown('LEFT_ARROW')
                    && !this.isDown('RIGHT_ARROW')) {
                    this.run(0);
                }
            });

    },
    idle: function() {
        if (this.onground) {
            this.animate("idle", -1);
        }
        this.currentDir = 0;
        return this;
    },
    run: function(dir) {
        this.currentDir = dir;
        if (this.onground) {
            this.animate((dir) ? "run" : "idle", -1);
        }
        return this;
    }
});

/**
 * 
 */
Crafty.c("WebsocketController", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.states = {};
    },
    isDown: function(key) {
        return this.states[key];
    },
    onPadEvent: function(e) {
        this.states[e.position] = e.type === "down";
        this.trigger(e.type === "down" ? "KeyDown" : "KeyUp");
    }
});

/**
 * 
 */
Crafty.c("Mannequin", {
    ANIMSPEED: 800,
    JUMPFORCE: -260,
    WALKFORCE: 400,
    DOWNFORCELIMIT: 5,
    DOWNFORCE: 10,
    TOPSPEED: 8,
    /**
     * 
     */
        init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("SpriteAnimation")               // Requirements
            .attr({x: 100, w: 64, h: 64})                                       // set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .animate("idle", -1)                                                // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 3.0,
                friction: 0,
                restitution: 0,
                shape: [[this.w / 3, this.w / 4], [2 * this.w / 3, this.w / 4], [2 * this.w / 3, this.w - 2], [this.w / 3, this.w - 2]],
                userData: "body"
            })
            .addFixture({//                                                     // Add feet sensor
                bodyType: 'dynamic',
                shape: [[(this.w / 3)+1, this.w - 5], [(2 * this.w / 3)-1, this.w - 5], [(2 * this.w / 3)-1, this.w], [(this.w / 3)+1, this.w]],
                isSensor: true,
                userData: "foot"
            })
            .addFixture({//                                                     // Add left sensor
                bodyType: 'dynamic',
                shape: [[this.w / 3, this.w / 4], [ (this.w / 3) + 5, this.w / 4], [(this.w / 3) + 5 , this.w - 7], [this.w / 3, this.w - 7]],
                isSensor: true,
                userData: "leftSide"
            })
            .addFixture({//                                                     // Add right sensor
                bodyType: 'dynamic',
                shape: [[ (2 * this.w / 3) - 5, this.w / 4], [2 * this.w / 3, this.w / 4], [2 * this.w / 3, this.w - 7], [(2 * this.w / 3) - 5, this.w - 7]],
                isSensor: true,
                userData: "rightSide"
            });

        this.body.SetFixedRotation(true);
    }
});


/**
 * 
 */
Crafty.c("WalloBot", {
    ANIMSPEED: 800,
    JUMPFORCE: -450,
    WALKFORCE: 600,
    DOWNFORCELIMIT: 16,
    DOWNFORCE: 20,
    TOPSPEED: 10,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, WalloBotSprite, SpriteAnimation")                // Requirements
            .attr({x: 100, w: 80, h: 80})                                       // Set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .animate("idle", -1)                                                 // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 4,
                friction: 0,
                restitution: 0,
                shape: [[this.w / 3, this.w / 4], [2 * this.w / 3, this.w / 4], [2 * this.w / 3, this.w], [this.w / 3, this.w]],
                userData: "body"
            })
            .addFixture({//                                                     // Add feet sensor
                bodyType: 'dynamic',
                shape: [[this.w / 3, this.w - 5], [2 * this.w / 3, this.w - 5], [2 * this.w / 3, this.w], [this.w / 3, this.w]],
                isSensor: true,
                userData: "foot"
            })
            .addFixture({//                                                     // Add left sensor
                bodyType: 'dynamic',
                shape: [[this.w / 3, this.w / 4], [ (this.w / 3) + 5, this.w / 4], [(this.w / 3) + 5 , this.w - 5], [this.w / 3, this.w - 5]],
                isSensor: true,
                userData: "leftSide"
            })
            .addFixture({//                                                     // Add right sensor
                bodyType: 'dynamic',
                shape: [[ (2 * this.w / 3) - 5, this.w / 4], [2 * this.w / 3, this.w / 4], [2 * this.w / 3, this.w - 5], [(2 * this.w / 3) - 5, this.w - 5]],
                isSensor: true,
                userData: "rightSide"
            });
            

        this.body.SetFixedRotation(true);
    }
});

/**
 * 
 */
Crafty.c("SlowBigWalloBot", {
    ANIMSPEED: 8000,
    JUMPFORCE: -100,
    WALKFORCE: 170,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, WalloBotSprite, SpriteAnimation")                // Requirements
            .attr({x: 100, w: 150, h: 150})                                     // Set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .animate("idle", -1)                                                 // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 1.0,
                friction: 0.2,
                restitution: 0.1,
                shape: [[this.w / 3, this.w / 4], [2 * this.w / 3, this.w / 4], [2 * this.w / 3, this.w], [this.w / 3, this.w]]
            })
            .addFixture({//                                                     // Add feet sensor
                bodyType: 'dynamic',
                shape: [[this.w / 3, this.w - 5], [2 * this.w / 3, this.w - 5], [2 * this.w / 3, this.w], [this.w / 3, this.w]],
                isSensor: true,
                userData: "foot"
            });

        this.body.SetFixedRotation(true);
    }
});
