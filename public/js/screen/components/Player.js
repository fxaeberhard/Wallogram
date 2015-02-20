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
        this.leftTouch = [], this.rightTouch = [], /* this.bodyTouch = [] ,*/ this.onground = [],
        this.score = 0,
        this.onMovingPlatform = false;
        var currentDir = 0
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
		        if (velocity.x <= -1 && !this.isDown('LEFT_ARROW')) {											// If velocity is smaller or equal to 0 decrease by walkforce else bring it to 0
			        forceX = this.WALKFORCE
				}else if(velocity.x >= 1 && !this.isDown('RIGHT_ARROW')){											// If velocity is bigger or equal to 0 decrease by walkforce else bring it to 0
		        	forceX = -this.WALKFORCE
	        	} else if(!this.isDown('RIGHT_ARROW') && !this.isDown('LEFT_ARROW')){
		        	body.SetLinearVelocity(new b2Vec2(0, velocity.y))
	        	}
		        
	            if(this.has("Keyboard") || this.has("WebsocketController")){			// If it has Keyboad or WebsocketController component than set controles
	                if (this.isDown('LEFT_ARROW')) {									// If right arrow is down
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
			        //console.log(this.body.GetLinearVelocity())
			        if (this.onMovingPlatform){											// If on moving plate, compensate movement.
			        	var playerPos = this.body.GetPosition(),
			        		platform = this.contactPlatform.GetUserData()
			        	if(platform){
		        			this.body.SetPosition(new b2Vec2(playerPos.x + platform.xPosDiff, playerPos.y + platform.yPosDiff))
		        		}
			        }
			        
	                if (this.onground.length > 0 && (this.isDown('SPACE') || this.isDown('UP_ARROW') || this.isDown('A'))) {
	                    //console.log("EnterFrame(): jumping");
	                    body.SetAwake(true);                                        // Wakes the body up if its sleeping
	                    body.ApplyImpulse(											// Apply upward impulse
	                        new b2Vec2(0, this.JUMPFORCE),
	                        body.GetWorldCenter()
	                    )
	                    this.animate("jump");
	                }
		            if(!this.isDown('SPACE') 										// apply force downward when jump button is released
	            	  && !this.isDown('UP_ARROW')
	            	  && !this.isDown('A') 
	            	  && this.onground.length == 0 
	            	  && body.m_linearVelocity.y < this.DOWNFORCELIMIT){
		                 body.ApplyImpulse(
		                 	new b2Vec2(0, this.DOWNFORCE),
		                 	body.GetWorldCenter()
		                 )
		            }
		
	                if(velocity.x != 0 && !this.onground.lenght == 0
	                && !(this.isDown('RIGHT_ARROW') 
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
    	this.prevPlatPos = {x: 0, y: 0};
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
	    if(this.has("Keyboard") || this.has("WebsocketController")){
	        this.currentDir = dir;
	        if (this.onground.length > 0) {
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
		//console.log("dead", this)	
    },
    reset: function() {		
	    this.body.SetLinearVelocity(new b2Vec2(0, 0));							
        this.SetP($.App.spawn.x, $.App.spawn.y)						
        this.dead = false;
        this.reseting = false;                                    
		//console.log("Player.reset()", this);
    },
    SetP: function(x, y) {
        this.attr({"x": x,"y": y});
	},
    hit: function(enemy) {
	    if(this.ko != true) {												// If player is not ko than action can start
		    var player = this,
		    	playerB2D = this.body,
		    	enemy = enemy.body,
				posPlayer = playerB2D.GetPosition(),						// Get position of player and enemy to calculate the angle at which he will fly out
				posEnemy = enemy.GetPosition(),
				vector = new b2Vec2(
					50*(posPlayer.x - posEnemy.x),
					-Math.abs(2*(posPlayer.y - posEnemy.y))
				);
			this.alpha = 0.5;
		    this.ko = true;													// set ko to true so it doesn't happen more than once
			console.log("center", enemy)
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
				player.setDir(player)	            
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
		if(!fixtures[index2].IsSensor()) {
			this.sensorCheck(fixtures[index].GetUserData(), true)
		}	
		
		if(this.rightTouch.length > 0 || this.leftTouch.length > 0){ 								// If Players sensor is either side set sideContact to true
	    	this.sideContact = true;
		}
		
		if (fixtures[index].GetUserData() == "foot"){
			if (fixtures[index2].GetBody().GetUserData().name == "movingPlat") {
				this.onMovingPlatform = true
				this.contactPlatform = fixtures[index2].GetBody();
			}
			
			this.setDir(this)
		}
		
		if(fixtures[index2].GetBody().GetUserData().name == "Target" && $.App.playing != false){
			$.App.win(fixtures[index].GetBody().GetUserData())
		}
    },
    EndContact: function(fixtures, index){
	    var index2;
	    
	    if(index == 1) {													// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
	    if(!fixtures[index2].IsSensor()) {
	    	this.sensorCheck(fixtures[index].GetUserData(), false)
	    }
	    
	    if(this.rightTouch.length == 0 && this.leftTouch.length == 0){ 							// If players sensor that lost contact is either said said sideContact to false
	    	this.sideContact = false;
		}
		
		if(fixtures[index].GetUserData() == "foot"
		&& fixtures[index2].GetBody().GetUserData().name == "movingPlat") {
			this.onMovingPlatform = false;
		}
    },
    setDir: function(player) {
	    if (player.isDown('LEFT_ARROW')) {
            player.run(-1);
        } else if (player.isDown('RIGHT_ARROW')) {
            player.run(1);
        } else {
            player.idle();
            
        }  

    },
    sensorCheck: function(fixtureName, value) {
	    switch(fixtureName){
			case "leftSide":
				if(value == true) {
					this.leftTouch.push(value);	
				} else if(this.leftTouch.length != 0){
					this.leftTouch.pop()
				}
			break;
			case "rightSide":
				if(value == true) {
					this.rightTouch.push(value);	
				} else if(this.rightTouch.length != 0){
					this.rightTouch.pop()
				}
			break;
			case "foot":
				if(value == true) {
					this.onground.push(1);
				} else if(this.onground.length != 0){
					this.onground.pop()
				}
			break;
/*
			case "body":
				if(value == true) if(this.bodyTouch.length != 0){
					this.bodyTouch.push(1);	
				} else {
					this.bodyTouch.pop()
				}
			break;
*/
		}
    },
    addData: function(data){
	    this.socketId = data.socketId
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
    JUMPFORCE: -100,
    WALKFORCE: 400,
    DOWNFORCELIMIT: 5,
    DOWNFORCE: 10,
    TOPSPEED: 8,
    HEIGHT: 64,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, SpriteAnimation")               						// Requirements
            .attr({x: 100, w: 64, h: this.HEIGHT, name: "player"})                       // set width and height
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
                shape: [[(this.w / 3)+2, this.w - 2], 
                		[(2 * this.w / 3)-2, this.w - 2], 
                		[(2 * this.w / 3)-2, this.w + 3], 
                		[(this.w / 3)+2, this.w + 3]],
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
    JUMPFORCE: -150,
    WALKFORCE: 500,
    DOWNFORCELIMIT: 6,
    DOWNFORCE: 12,
    TOPSPEED: 10,
    HEIGHT: 80,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, SpriteAnimation")                // Requirements
            .attr({x: 100, w: 80, h: this.HEIGHT, name: "player"})                       // Set width and height
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
                shape: [[(this.w / 3)+2, this.w - 2], 
                		[(2 * this.w / 3)-2, this.w - 2], 
                		[(2 * this.w / 3)-2, this.w + 3], 
                		[(this.w / 3)+2, this.w + 3]],
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
Crafty.c("WalloBotBigger", {
    ANIMSPEED: 800,
    JUMPFORCE: -300,
    WALKFORCE: 800,
    DOWNFORCELIMIT: 6,
    DOWNFORCE: 12,
    TOPSPEED: 10,
    HEIGHT: 120,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, SpriteAnimation")                // Requirements
            .attr({x: 100, w: 120, h: this.HEIGHT, name: "player"})                       // Set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 4)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 0, 4, 5)
            .reel("run", this.ANIMSPEED, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]]) // Specify frames 1 by 1 since the anim spans on 2 cells
            .animate("idle", -1)                                                 // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 2,
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
                shape: [[(this.w / 3)+2, this.w - 2], 
                		[(2 * this.w / 3)-2, this.w - 2], 
                		[(2 * this.w / 3)-2, this.w + 3], 
                		[(this.w / 3)+2, this.w + 3]],
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
Crafty.c("Mario", {
    ANIMSPEED: 400,
    JUMPFORCE: -250,
    WALKFORCE: 350,
    DOWNFORCELIMIT: 6,
    DOWNFORCE: 12,
    TOPSPEED: 10,
    HEIGHT: 45,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, SpriteAnimation")                // Requirements
            .attr({x: 100, w: 45, h: this.HEIGHT, name: "player"})                       // Set width and height
            .reel("idle", this.ANIMSPEED, 3, 0, 1)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 4 , 0, 1)
            .reel("run", this.ANIMSPEED, 0, 0, 3) 
            .animate("idle", -1)                                                 // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 3.0,
                friction: 0,
                restitution: 0,
                shape: [[this.w * (8 / 128), 0], 
                		[this.w * (120 / 128), 0], 
                		[this.w * (120 / 128), this.h], 
                		[this.w * (8 / 128), this.h]],
                userData: "body"
            })
            .addFixture({														// Add foot sensor
                bodyType: 'dynamic',
                shape: [[this.w * (8 / 128) + 3, this.h - 3], 
                		[this.w * (120 / 128) - 3, this.h - 3], 
                		[this.w * (120 / 128) - 3, this.h + 3], 
                		[this.w * (8 / 128) + 3, this.h + 3]],
                isSensor: true,
                userData: "foot"
            })
            .addFixture({														// Add left sensor
                bodyType: 'dynamic',
                shape: [[this.w * (8 / 128) - 3, 3], 
                		[this.w * (8 / 128) + 3, 3], 
                		[this.w * (8 / 128) + 3, this.h - 3], 
                		[this.w * (8 / 128) - 3, this.h - 3]],
                isSensor: true,
                userData: "leftSide"
            })
            .addFixture({	                                                   	// Add right sensor
                bodyType: 'dynamic',
                shape: [[this.w * (120 / 128) - 3, 3],
                		[this.w * (120 / 128) + 3, 3], 
                		[this.w * (120 / 128) + 3, this.h - 3], 
                		[this.w * (120 / 128) - 3, this.h - 3]],
                isSensor: true,
                userData: "rightSide"
            })
            .addFixture({														// Add top sensor
                bodyType: 'dynamic',
                shape: [[this.w * (8 / 128) + 3, 3], 
                		[this.w * (120 / 128) - 3, 3], 
                		[this.w * (120 / 128) - 3, - 3], 
                		[this.w * (8 / 128) + 3, - 3]],
                isSensor: true,
                userData: "top"
            });
        this.body.SetFixedRotation(true);
    }
});
Crafty.c("Ducky", {
    ANIMSPEED: 400,
    JUMPFORCE: -140,
    WALKFORCE: 350,
    DOWNFORCELIMIT: 6,
    DOWNFORCE: 12,
    TOPSPEED: 10,
    HEIGHT: 45,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Player, SpriteAnimation")                // Requirements
            .attr({x: 100, w: 45, h: this.HEIGHT, name: "player"})                       // Set width and height
            .reel("idle", this.ANIMSPEED, 0, 0, 1)                              // Set up animation
            .reel("jump", this.ANIMSPEED, 3 , 0, 1)
            .reel("run", this.ANIMSPEED, 1, 0, 2) 
            .animate("idle", -1)                                                 // Run idle animation
            .box2d({
                bodyType: 'dynamic',
                density: 2.0,
                friction: 0,
                restitution: 0,
                shape: [[this.w * (8 / 128),this.h * (24 / 128)], 
                		[this.w * (120 / 128),this.h * (24 / 128)], 
                		[this.w * (120 / 128), this.h], 
                		[this.w * (8 / 128), this.h]],
                userData: "body"
            })
            .addFixture({														// Add foot sensor
                bodyType: 'dynamic',
                shape: [[this.w * (8 / 128) + 3, this.h - 3], 
                		[this.w * (120 / 128) - 3, this.h - 3], 
                		[this.w * (120 / 128) - 3, this.h + 3], 
                		[this.w * (8 / 128) + 3, this.h + 3]],
                isSensor: true,
                userData: "foot"
            })
            .addFixture({														// Add left sensor
                bodyType: 'dynamic',
                shape: [[this.w * (8 / 128) - 3, this.h * (24 / 128) + 3], 
                		[this.w * (8 / 128) + 3, this.h * (24 / 128) + 3], 
                		[this.w * (8 / 128) + 3, this.h - 3], 
                		[this.w * (8 / 128) - 3, this.h - 3]],
                isSensor: true,
                userData: "leftSide"
            })
            .addFixture({	                                                   	// Add right sensor
                bodyType: 'dynamic',
                shape: [[this.w * (120 / 128) - 3, this.h * (24 / 128) + 3],
                		[this.w * (120 / 128) + 3, this.h * (24 / 128) + 3], 
                		[this.w * (120 / 128) + 3, this.h - 3], 
                		[this.w * (120 / 128) - 3, this.h - 3]],
                isSensor: true,
                userData: "rightSide"
            })
            .addFixture({														// Add top sensor
                bodyType: 'dynamic',
                shape: [[this.w * (8 / 128) + 3, this.h * (24 / 128) + 3], 
                		[this.w * (120 / 128) - 3, this.h * (24 / 128) + 3], 
                		[this.w * (120 / 128) - 3, this.h * (24 / 128) - 3], 
                		[this.w * (8 / 128) + 3, this.h * (24 / 128) - 3]],
                isSensor: true,
                userData: "top"
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
    HEIGHT: 150,
    /**
     * 
     */
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("SpriteAnimation")                // Requirements
            .attr({x: 100, w: 150, h: this.HEIGHT, name: "player"})                     // Set width and height
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
