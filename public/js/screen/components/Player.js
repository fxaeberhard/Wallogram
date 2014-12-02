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
        this.leftTouch = this.rightTouch = this.bodyTouch = this.onground = this.onMovingPlatform = false;
        var currentDir = 0,
        	prevPlatPos = {x: 0, y: 0};
        this.requires("2D, Canvas, Box2D")										// Requirements
            .bind("EnterFrame", function() {
	            //console.log(this.ko)
                var body = this.body,
                    velocity = body.GetLinearVelocity(),
                    forceX = 0,
                    landingV
                  
                if (this.runOnce != true) {
		    		this.runOnce()
	    		}	
                 
                /*
	             * This replaces box2d friction since it does not work well for plateformer (when character lands velocity drops to zero to go back up)
	             */
                if ((this.has("Keyboard") || this.has("WebsocketController")) || this.onground){// If velocity is smaller than 0 and left arrow isn't pressed decrease speed
			        if (velocity.x <= -1 && !this.isDown('LEFT_ARROW')) {											// If velocity is smaller or equal to 0 decrease by walkforce else bring it to 0
				        forceX = this.WALKFORCE
					}else if(velocity.x >= 1 && !this.isDown('RIGHT_ARROW')){											// If velocity is bigger or equal to 0 decrease by walkforce else bring it to 0
			        	forceX = -this.WALKFORCE
		        	} else if(!this.isDown('RIGHT_ARROW') && !this.isDown('LEFT_ARROW')){
			        	body.SetLinearVelocity(new b2Vec2(0, velocity.y))
		        	}
		        }
		        
	            if(this.has("Keyboard") || this.has("WebsocketController")){			// If it has Keyboad or WebsocketController component than set controles
	                if (this.isDown('LEFT_ARROW')) {					// If right arrow is down
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
			        
		            if (this.isDown('RIGHT_ARROW')){									// If right arrow is down
		                if ( velocity.x < this.TOPSPEED - 1 ){       					// If player is still under topspeed (accelerating)
		                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
		                    if (velocity.x < this.TOPSPEED) {							// set force to 500 if velocity isn't too high
		                        forceX = this.WALKFORCE;
		                    }
		                    this.unflip();
		                    //console.log("right: "+velocity.x)
			            } else if(velocity.x >= this.TOPSPEED - 1 && velocity.x <= this.TOPSPEED){ // If player is in topspeed than fix velocity to topspeed
				            body.SetLinearVelocity(new b2Vec2(this.TOPSPEED, velocity.y))
			            }
			        }
			        
			        if (this.onMovingPlatform){											// If on moving plate, compensate movement.
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
			        
	                if (this.onground && (this.isDown('SPACE') || this.isDown('UP_ARROW') || this.isDown('A'))) {
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
	            }
	            
	            if (forceX != 0) {												// Apply moving force if forceX exist
                    body.ApplyForce(
                        new b2Vec2(forceX, 0),
                        body.GetWorldCenter()
                        )
                }
            })
            .bind("KeyDown", function() {
	            if(this.has("Keyboard") || this.has("WebsocketController")){
	                if (this.isDown('LEFT_ARROW')) {
	                    this.run(-1);
	                }
	                if (this.isDown('RIGHT_ARROW')) {
	                    this.run(1);
	                }
	                if (this.isDown('SPACE') || this.isDown('UP_ARROW') || this.isDown('A')){
		                this.animate("jump");
	                }
	            }
            })
            .bind("KeyUp", function() {
                if (!this.isDown('LEFT_ARROW')
                    && !this.isDown('RIGHT_ARROW')) {
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
        if (this.onground) {
            this.animate("idle", -1);
        }
        this.currentDir = 0;
        return this;
    },
    run: function(dir) {
	    if(this.has("Keyboard") || this.has("WebsocketController")){
	        this.currentDir = dir;
	        if (this.onground) {
	            this.animate((dir) ? "run" : "idle", -1);
	        }
	    }
        return this;
    },
    die: function() {
	    var player = this;
		this.reseting = true;
	    this.dead = true;
	    setTimeout(function() {											// Set 2 seconds delay before reseting
			player.reset();
		}, 2000);	
    },
    reset: function() {									
        this.body.SetLinearVelocity(new b2Vec2(0, 0));					// Reset velocity 
        this.attr($.App.cfg.player);									// Reset the player position
        this.dead = false;
        this.reseting = false;                                    
		console.log("Player.reset()", this);
    },
    hit: function(enemy) {
	    if(this.ko != true) {												// If player is not ko than action can start
		    
		    var player = this,
		    	playerB2D = this.body,
		    	enemy = enemy.body,
				posPlayer = playerB2D.GetPosition(),						// Get position of player and enemy to calculate the angle at which he will fly out
				posEnemy = enemy.GetPosition(),
				enemyCenter = new b2Vec2(
					posEnemy.x + (enemy.GetUserData().w/2),
					posEnemy.y + enemy.GetUserData().h
				),
				playerCenter = new b2Vec2(
					posPlayer.x + (playerB2D.GetUserData().w/2),
					posPlayer.y + (playerB2D.GetUserData().h/2)
				),
				vector = new b2Vec2(
					50*(playerCenter.x - enemyCenter.x),
					-Math.abs(2*(playerCenter.y - enemyCenter.y))
				);
			this.alpha = 0.5;
		    this.ko = true;													// set ko to true so it doesn't happen more than once
			
			if (this.has("Keyboard")) {
				this.removeComponent("Keyboard")
				this.controlleComp = "Keyboard"	
			} else {
				this.removeComponent("WebsocketController")
				this.controlleComp = "WebsocketController"	
			}
			playerB2D.SetLinearVelocity(
				new b2Vec2(
					0,
					playerB2D.GetLinearVelocity().y
				)
			)
			//console.log("I'm HIIIITTT")
		    playerB2D.ApplyImpulse(											// hit oposit direction
	            vector,
	            playerB2D.GetWorldCenter()
	        )
			
			this.animate("idle", -1);
			
	        setTimeout(function() {											// Set 3 second Delay before reseting
	            player.ko = false;
	            player.addComponent(player.controlleComp)  
	            
	            if (player.isDown('LEFT_ARROW')) {
                    player.run(-1);
                } else if (player.isDown('RIGHT_ARROW')) {
                    player.run(1);
                } else {
		            player.idle();
	            }  
	            player.alpha = 1;                    
	        }, 2000);
	    }
    },
    BeginContact: function(fixtures, index){
	    var index2;
	    
	    if(index == 1) {													// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
		this.sensorCheck(fixtures[index].GetUserData(), true)

		
		if(this.rightTouch || this.leftTouch){ 								// If Players sensor is either side set sideContact to true
	    	this.sideContact = true;
		}
		
		if (fixtures[index].GetUserData() == "foot"){
			if (fixtures[index2].GetBody().GetUserData().name == "movingPlat") {
				this.onMovingPlatform = true
			}
			if (this.isPlaying("jump")){
				if (this.isDown('LEFT_ARROW')) {
                    this.run(-1);
                } else if (this.isDown('RIGHT_ARROW')) {
                    this.run(1);
                } else {
	                this.idle()
                }
				
			}
		}
		
		if(fixtures[index2].GetBody().GetUserData().components == "Target"){
			$.App.setState("win")
		}
		
    },
    EndContact: function(fixtures, index){
	    var index2;
	    
	    if(index == 1) {													// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
	    
	    this.sensorCheck(fixtures[index].GetUserData(), false)
	    
	    if(!this.rightTouch && !this.leftTouch){ 							// If players sensor that lost contact is either said said sideContact to false
	    	this.sideContact = false;
		}
		
		if(fixtures[index].GetUserData() == "foot"
		&& fixtures[index2].GetBody().GetUserData().name == "movingPlat") {
			this.onMovingPlatform = false;
		}
    },
    sensorCheck: function(fixtureName, value) {
	    switch(fixtureName){
			case "leftSide":
				this.leftTouch = value;
			break;
			case "rightSide":
				this.rightTouch = value;
			break;
			case "foot":
				this.onground = value;
			break;
			case "body":
				this.bodyTouch = value;
			break;
		}
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
            .attr({x: 100, w: 64, h: 64, name: "player"})                       // set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .animate("idle", -1)                                             // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 3.0,
                friction: 0,
                restitution: 0,
                shape: [[this.w / 3, this.w / 4], 
                		[2 * this.w / 3, this.w / 4], 
                		[2 * this.w / 3, this.w - 2], 
                		[this.w / 3, this.w - 2]],
                userData: "body"
            })
            .addFixture({//                                                     // Add feet sensor
                bodyType: 'dynamic',
                shape: [[(this.w / 3)+5, this.w - 2], 
                		[(2 * this.w / 3)-5, this.w - 2], 
                		[(2 * this.w / 3)-5, this.w + 3], 
                		[(this.w / 3)+5, this.w + 3]],
                isSensor: true,
                userData: "foot"
            })
            .addFixture({//                                                     // Add left sensor
                bodyType: 'dynamic',
                shape: [[this.w / 3, this.w / 4], 
                		[(this.w / 3) + 5, this.w / 4], 
                		[(this.w / 3) + 5 , this.w - 7], 
                		[this.w / 3, this.w - 7]],
                isSensor: true,
                userData: "leftSide"
            })
            .addFixture({//                                                     // Add right sensor
                bodyType: 'dynamic',
                shape: [[ (2 * this.w / 3) - 5, this.w / 4], 
                		[2 * this.w / 3, this.w / 4], 
                		[2 * this.w / 3, this.w - 7], 
                		[(2 * this.w / 3) - 5, this.w - 7]],
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
            .attr({x: 100, w: 80, h: 80, name: "player"})                       // Set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .animate("idle", -1)                                                 // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 4,
                friction: 0,
                restitution: 0,
                shape: [[this.w / 3, this.w / 4], 
                		[2 * this.w / 3, this.w / 4], 
                		[2 * this.w / 3, this.w], 
                		[this.w / 3, this.w]],
                userData: "body"
            })
            .addFixture({//                                                     // Add feet sensor
                bodyType: 'dynamic',
                shape: [[this.w / 3, this.w - 5], 
                		[2 * this.w / 3, this.w - 5], 
                		[2 * this.w / 3, this.w], 
                		[this.w / 3, this.w]],
                isSensor: true,
                userData: "foot"
            })
            .addFixture({//                                                     // Add left sensor
                bodyType: 'dynamic',
                shape: [[this.w / 3, this.w / 4], 
                		[(this.w / 3) + 5, this.w / 4], 
                		[(this.w / 3) + 5 , this.w - 5], 
                		[this.w / 3, this.w - 5]],
                isSensor: true,
                userData: "leftSide"
            })
            .addFixture({//                                                     // Add right sensor
                bodyType: 'dynamic',
                shape: [[ (2 * this.w / 3) - 5, this.w / 4], 
                		[2 * this.w / 3, this.w / 4], 
                		[2 * this.w / 3, this.w - 5], 
                		[(2 * this.w / 3) - 5, this.w - 5]],
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
        this.requires("SpriteAnimation")                // Requirements
            .attr({x: 100, w: 150, h: 150, name: "player"})                     // Set width and height
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
