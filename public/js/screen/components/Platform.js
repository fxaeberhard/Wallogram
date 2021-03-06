/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.c("Platform", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("2D, Box2D, MouseHover")									// allows the entity to be drawn as a colored box
			.attr({w: 100, h: 20})												// set width and height
			.box2d({
				bodyType: 'static',
				density: 0.2,
				friction: 10,
				restitution: 0,
				shape: "box"
			});
	}
});

/**
 * 
 */
Crafty.c("ColoredPlatform", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("Platform, Canvas, Color")								// allows the entity to be drawn as a colored box
			.color("white");
	}
});

Crafty.c("Spawner", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("2D, Box2D, MouseHover")									
			.attr({w: 60, h: 60, name: "spawner", boxedIn: false})												// set width and height based on player
			.box2d({
				bodyType: 'static',
				density: 1.0,
				friction: 10,
				restitution: 0,
				isSensor: true,
				shape: "box"
			})
			
	}
});
/**
 * 
 */
Crafty.c("OutOfBounds", {
	init: function() {
		this.requires("2D, Box2D, MouseHover")
			.attr({w: 3000, h: 30})
			.box2d({
				bodyType: "static",
				density: 1.0,
				friction: 10,
				restutution: 0,
				isSensor: true,
				shape: "box"
			})
	},
	BeginContact: function(fixtures, index) {
		 var index2
		
		if(index == 1) {																				// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
		if(fixtures[index2].GetBody().GetUserData().reseting != true 
		&& (fixtures[index2].GetBody().GetUserData().name == "enemy" 
		|| fixtures[index2].GetBody().GetUserData().name == "player")){
			fixtures[index2].GetBody().GetUserData().die()
		}
		 
		 
	}
});

/**
 * 
 */
Crafty.c("QR", {
	init: function() {
		this.requires("2D, DOM, MouseHover")
			.attr({
				w: 80,
				h: 80,
				z: 100,
				name: "QR"
			});
		// Same, using image component
		//this.requires("2D, DOM, Image,  MouseHover")
		//	  .image("http://chart.apis.google.com/chart?cht=qr&chs=170x170&chld=Q&choe=UTF-8&chl=" + encodeURIComponent(padUrl))
		this._foreground = "000000";
		this._background = "ffffff";
	},
	background: function(color) {
		this._background = color;
		this.sync();
	},
	foreground: function(color) {
		this._foreground = color;
		this.sync();
	},
	sync: function() {
		var padUrl = $.App.getPadUrl();
                console.log("QR.sync(url: " + padUrl + ")");
                this.css({
			background: "url(//qrickit.com/api/qr?fgdcolor=" + this._foreground.replace("#", "")
				+ "&bgdcolor=" + this._background.replace("#", "")
				+ "&qrsize=170&t=p&e=m&d=" + encodeURIComponent(padUrl) + ") 0 0",
			// background: "url(//chart.apis.google.com/chart?cht=qr&chs=170x170&chld=Q&choe=UTF-8&chl=" + encodeURIComponent(padUrl) + ") 0 0",
 
			// background: "url(//api.qrserver.com/v1/create-qr-code/?size=170x170&fgcolor=" + this._foreground.replace("#", "")
			//	  + "&bgcolor=" + this._background.replace("#", "")
			//	  + "&data=" + encodeURIComponent(padUrl) + ") 0 0",
			"background-size": "100% 100%"
		});
	}
});

/**
 * 
 */
Crafty.c("WalloImage", {
	init: function() {
		this.requires("2D, DOM, MouseHover")
			.attr({
				w: 80,
				h: 80,
				z: 100
			});
		// Same with Image component
		//this.requires("2D, DOM, Image, MouseHover")
		//	  .image()
		//	  .css({
		//		  "background-size": "100% 100%"
		//	  })
	},
	url: function(url) {
		this.css({
			background: "url(" + url + ")",
			"background-size": "100% 100%"
		});
	}
});
Crafty.c("fixImage", {
	init: function() {
		this.requires("2D, Canvas")
			.attr({
				 x: 0,
				 y: 0,
				w: $.App.cfg.width,
				h: $.App.cfg.height
			});
	}
});
/**
 * 
 */
Crafty.c("Timer", {
	init: function() {
		this.requires("2D, DOM, Text, MouseHover")
			.attr({
			 	"x": 100,
			 	"y": 100,
			 	"color": "white"
			})
			.css({
				color: this.color
			});

		var that = this, timerHandler;

		$(document).on("stateChange", function(e, newState, oldState) {
			switch (oldState) {													// Exit previous state
				case "run":
					clearInterval(timerHandler);
					break;
			}

			switch (newState) {													// Enter new state
				case "countdown":												// Show countdown before play
					that.text("Ready...");
					break;

				case "run":														// Play
					timerHandler = setInterval(function() {
						that.text($.HHMMSS(new Date().getTime() - $.App.startTime));
					}, 53);
					break;

				case "win":														// Somebody reached the goal
					that.text(that.text());
					break;
			}
		});
	}
});

/**
 * 
 */
Crafty.c('MouseHover', {
    init: function() {
        this.requires("Mouse")
            .bind('MouseOver', function() {
                $.Edit.showEditOverlay(this);
                //document.body.style.cursor = "pointer";
            })
            .bind('MouseOut', function() {
                $.Edit.hideEdition();
                //document.body.style.cursor = "default";
            });
        return this;
    }
    //remove: function () {
    //    document.body.style.cursor = "default";
    //}
});
Crafty.c("Lab_Spawner", {
	init: function() {
		var Spawner = this
		this.requires("Canvas, Spawner, lab_cage")
			.attr({
				"goingDown": false,
				"goingUp": false,
				"name": "spawner",
				"boxedIn": true
			})
			.addFixture({//                                                     // Add Top
                bodyType: 'static',
                shape: [[this.x, this.y], 
                		[this.x + this.w, this.y], 
                		[this.x + this.w , this.y + 2], 
                		[this.x , this.y + 2]],
                userData: "top"
            })
            .addFixture({//                                                     // Add right
                bodyType: 'static',
                shape: [[this.x + this.w - 2, this.y], 
                		[this.x + this.w, this.y], 
                		[this.x + this.w, this.y + this.h], 
                		[this.x + this.w - 2, this.y + this.h]],
                userData: "right"
            })
            /*
.addFixture({//                                                     // Add bottom
                bodyType: 'static',
                shape: [[this.x, this.y + this.h], 
                		[this.x + this.w, this.y + this.h], 
                		[this.x + this.w, this.y + this.h + 2], 
                		[this.x, this.y + this.h + 2]],
                userData: "bottom"
            })
*/
			.addFixture({//                                                     // Add left
                bodyType: 'static',
                shape: [[this.x, this.y], 
                		[this.x + 2, this.y], 
                		[this.x + 2 , this.y + this.h], 
                		[this.x , this.y + this.h]],
                userData: "left"
            })
            .bind("EnterFrame", function() {
            	var body = this.body,
            		ratio = Crafty.box2D.PTM_RATIO;
            		position = body.GetPosition()
            	if(this.runOnce != true) {
	            	this.setOrigin(ratio)
            	}
	            if(this.goingUp && this.y > this.yOrigin - this.h) {
	            	body.SetActive(false)
					body.SetPosition(new b2Vec2(position.x ,position.y - 0.3))
	            } else if(this.goingDown && this.y < this.yOrigin){
	            	body.SetActive(true)
	            	body.SetPosition(new b2Vec2(position.x ,position.y + 0.3))
	            } else {
		            this.goingDown = false
		            this.goingUp = false
	            }
            })
			$(document).on("stateChange", function(e, newState, oldState) {
				switch (newState) {													// Enter new state
					case "countdown":
						Spawner.down()													//
						break;
	
					case "run":														// Play
						Spawner.up()
						break;
				}
			});
	},
	setOrigin: function(ratio) {
		this.yOrigin = this.y
		this.runOnce = true
		this.body.SetActive(false)
		this.body.SetPosition(new b2Vec2(position.x ,(this.y - this.h) / ratio))
	},
	down: function() {
		this.goingDown = true
	},
	up: function() {
		this.goingUp = true
	}
	
	
});
Crafty.c("Lab_Teleport", {
	init: function() {															// init function is automatically run when entity with this component is created		
		this.active = [];
		this.requires("2D, Box2D, MouseHover, Canvas, lab_teleport_ball")					// allows the entity to be drawn as a colored box
			.attr({ w: 60,
					h:60,
					z:10,
					name: "teleport"
			})
			.box2d({
				bodyType: 'static',
				density: 1.0,
				friction: 10,
				restitution: 0,
				isSensor: true,
			})
			.bind("EnterFrame", function() {
				if(this.runOnce != true){
					this.AddToList()
				}
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":30, "right": 70, "bottom": 70, "left": 30}))
			}
		
		if(!$.App.Teleport){														// if teleport list doesn't exist create it.
			$.App.Teleport = []
		}
	},
	AddToList: function(){
		$.App.Teleport[this.label] = this
		this.runOnce = true;
	},
	BeginContact: function(fixtures, index) {
		var index2, body = this.body
	
		if(index == 1) {																				// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
		
		if(fixtures[index2].GetBody().GetUserData().name == "player" && this.active.indexOf(fixtures[index2].GetBody().GetUserData()) == -1){
			console.log("speed",fixtures[index2].GetBody().GetLinearVelocity())
			var active = this.active,
				speed = fixtures[index2].GetBody().GetLinearVelocity()
				tagetActive = $.App.Teleport[this.target].active 
				destination = $.App.Teleport[this.target],
				itemId = active.push(fixtures[index2].GetBody().GetUserData()),										// add player to teleported list
				TargetTtemId = tagetActive.push(fixtures[index2].GetBody().GetUserData()),	// add player to taget teleported list
				x = $.App.Teleport[this.target].x,
				y = $.App.Teleport[this.target].y
		        setTimeout(function() {															// Set 1 milliseconds delay before teleporting
					fixtures[index2].GetBody().GetUserData().SetP(x, y)
					fixtures[index2].GetBody().SetLinearVelocity(speed)
					console.log("speed2",fixtures[index2].GetBody().GetLinearVelocity())
				}, 1);
			setTimeout(function() {															// Set 2 second Delay before teleporting again
				active.splice(itemId - 1, 1);
				tagetActive.splice(TargetTtemId -1, 1);
	        }, 1000);
			
		}
		
	},
	EndContact: function(fixtures, index) {
		var index2, body = this.body
	
		if(index == 1) {																				// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
		
		if(fixtures[index2].GetBody().GetUserData().name == "player"){
			
		}
	}
});
Crafty.c("Lab_Porte", {
	init: function() {
		this.requires("2D, Canvas, MouseHover, Box2D, lab_porte")
			.box2d({
				bodyType: 'static',
				userData: "plat"
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":293, "right": 230, "bottom": 330, "left": 11}))
			}
	}
})
Crafty.c("Lab_Platform", {
	init: function() {
		this.requires("2D, Canvas, MouseHover, Box2D, lab_plateforme1")
			.box2d({
				bodyType: 'static',
				userData: "plat"
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":8, "right": 146, "bottom": 66, "left": 8}))
			}
	}
})
Crafty.c("AnimatedPlatform", {
	init: function() {
		this.requires("2D, Canvas, MouseHover, SpriteAnimation")
	},
});

Crafty.c("Gyrophare", {
	init: function() {
		this.requires("AnimatedPlatform, lab_gyrophare")
			.attr({
				animSpeed: 800,
				animLength: 1,
				isSensor: true
			})
			.reel("anim", this.animSpeed, 0, 0, 9)
			.reel("idle", this.animSpeed, 0, 0, 1)
			.bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
				}
				 
			})
	}
});
Crafty.c("Chimie", {
	init: function() {
		this.requires("AnimatedPlatform, lab_chimie, Box2D")
			.attr({
				animSpeed: 1500,
				animLength: 1,
				isSensor: true
			})
			.box2d({
				bodyType: 'static',
				userData: "plat"
			})
			.reel("anim", this.animSpeed, 0, 0, 51)
			.reel("idle", this.animSpeed, 0, 0, 1)
			.bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
				}
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":129, "right": 125, "bottom": 137, "left": 10}))
			}

	}
});
Crafty.c("Jauge", {
	init: function() {
		this.requires("AnimatedPlatform, lab_jauge, Box2D")
			.attr({
				animSpeed: 2500,
				animLength: 1,
				isSensor: true
			})
			.box2d({
				bodyType: 'static',
				userData: "plat"
			})
			.reel("anim", this.animSpeed, 0, 0, 78)
			.reel("idle", this.animSpeed, 0, 0, 1)
			.bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)			
				} 
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":5, "right": 175, "bottom": 151, "left": 5}))
			}
	}
});
Crafty.c("Serrure", {
	init: function() {
		this.requires("AnimatedPlatform, lab_serrure")
			.attr({
				animSpeed: 2500,
				animLength: 1,
				isSensor: true
			})
			.reel("anim", this.animSpeed, 0, 0, 74)
			.reel("idle", this.animSpeed, 0, 0, 1)
			.bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
				}
			})
	}
});
Crafty.c("Ventilo", {
	init: function() {
		this.requires("AnimatedPlatform, lab_ventilo")
			.attr({
				animSpeed: 300,
				animLength: 1,
				isSensor: true
			})
			.reel("anim", this.animSpeed, 0, 0, 4)
			.reel("idle", this.animSpeed, 0, 0, 1)
			.bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
				}
				 
			})
	}
});


Crafty.c("Serveur", {
	init: function() {
		this.requires("AnimatedPlatform, lab_serveur, Box2D")
			.attr({
				animSpeed: 9000,
				animLength: 1,
				isSensor: true
			})
			.box2d({
				bodyType: 'static',
				userData: "plat_serveur"
			})
			.reel("anim", this.animSpeed, 0, 0, 9)
			.reel("idle", this.animSpeed, 0, 0, 1)
			.bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
				}  
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":307, "right": 227, "bottom": 346, "left": 11}))
			}
	}
})
/**
 * 
 */
Crafty.c("Falling", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.isDown = false;
		var counter, counter2,
			multiplier = 50, ratio = Crafty.box2D.PTM_RATIO;
		this.requires("AnimatedPlatform")
			.attr({
		 		w: 100,
		 		h: 20,
		 		active: false,
		 		touching: false,
		 		idle: 1,
		 		name: "falling"
			})
			.bind("EnterFrame", function() {
				var body = this.body
				if (this.runOnce != true) {
			  		this.setOrigin()
			  		this.setCounters(multiplier)
		 		}	
		 		if(this.touching == true){
			  		if(this.isDown == false ){					// checks if platform is down											
						if (this.counter == 0) {
				   			body.SetType(2)
				   			this.isDown = true
			  			} else {
				   			this.counter --;
						}
						
						if(this.counter % multiplier == 0){								// show counter in console 
				   			console.log("falling in: "+this.counter/multiplier)
			  			}
			  			
					}	
		 		} else if (this.touching == false){
			  		this.counter = this.fallTime * multiplier;						// reset fall counter
			  		if (this.counter2 == 0) {										// if counter = to 0 reset platform otherwise decrement counter
				   		this.counter2 = this.recoverTime * multiplier;
						 body.SetType(0)
						body.SetPosition(new b2Vec2(this.xOrigin/ratio, this.yOrigin/ratio));
						body.SetAngle(0)
						this.animate("idle", -1)
						this.isDown = false
						console.log("recovered")
					} else if (this.isDown == true){
						 this.counter2--;
					}
					
					if(this.counter2 % multiplier == 0 && this.counter2 != this.recoverTime * multiplier){								// show counter in console 
			  			console.log("recovering in: "+this.counter2/multiplier)
		 			}
		 		}
			})
	},
	setOrigin: function() {
		this.runOnce = true
		this.xOrigin = this.x;
		this.yOrigin = this.y;
		this.wOrigin = this.w;
		this.hOrigin = this.h;
	},
	setCounters: function(multiplier) {
		this.counter = this.fallTime * multiplier;
		this.counter2 = this.recoverTime * multiplier;
	},
	BeginContact: function(fixtures, index) {
		var index2, body = this.body
	
		if(index == 1) {																				// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
		
		if(fixtures[index2].GetBody().GetUserData().name == "hotdog" 
		|| fixtures[index2].GetBody().GetUserData().name == "player"){
			if (!this.touching){
				this.touching = true
				if(!this.isPlaying("breaking") && body.GetType() != 2){									// if breaking animation is not playing yet then start it.
					this.animate("breaking");
				}
			}
		}
	},
	EndContact: function(fixtures, index) {
		var index2
	
		if(index == 1) {																				// If index is 1 than index two is 0 and vice versa
			index2 = 0;
		}else {
			index2 = 1;
		}
		if(fixtures[index2].GetBody().GetUserData().name == "hotdog" 
		|| fixtures[index2].GetBody().GetUserData().name == "player"){
			this.touching = false
			fixtures[index].GetBody().GetUserData().animate("idle", -1)
		}
		
	}
});

Crafty.c("Standard_Falling", {
	init: function() {
		 
		this.requires("Falling, Box2D")
			.attr({
				isSensor: true,
				fallTime: 2,
		 		idle: 1,
		 		recoverTime: 5
			})
			.reel("anim", this.fallTime * 1000, 0, 0, 76)
			.reel("idle", 1000, 0, 0, 1)
			.box2d({
				bodyType: 'static',
				density: 0.2,
				friction: 10,
				restitution: 0,
				shape: "box"
			})
			.bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
				}
			})
	}
})

Crafty.c("Lab_Falling_platform", {
	
	init: function() {
		this.requires("Falling, lab_plateforme_tombe, Box2D")
			.attr({
				fallTime: 2,
		 		breaking: 30,
		 		idle: 1,
		 		recoverTime: 5
			})
			.reel("breaking", (this.fallTime * 1000), 0, 0, this.breaking )
			.reel("idle", 1000, 0, 0, this.idle )
			.box2d({
				bodyType: 'static',
				density: 1.0,
				friction: 0,
				restitution: 0,
				userData: "plat_fall"
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":47, "right": 325, "bottom": 183, "left": 10}))
			}
	}
})
Crafty.c("Lab_Falling_hook", {
	init: function() {
		this.requires("2D, Canvas, lab_fix_plateforme_tombe,")
			 .attr({
					 "x": 23,
					 "y": 23,
					 "w": 23,
					 "h": 23
				 })
		}
})

Crafty.c("Lab_Falling", {
	init: function() {
		this.requires("2D, Canvas, MouseHover, Lab_Falling_platform")
			.attr({
				z: 3
			})
			.bind("EnterFrame", function() {
				if(!this.added){
					this.create()
				}
				if($.App.debug && !this.isDown && (this.x != this.xOrigin || this.y != this.yOrigin || this.w != this.wOrigin || this.h != this.hOrigin)){
					this.resetPosition()
				}
			})
			
	},
	create: function() {
		this.wScaleRatio =	 336 / this.w
		this.hScaleRatio = 	196 / this.h
		this.hookLeft = Crafty.e("Lab_Falling_hook").attr({
			  								"x": this.x + (54 / this.wScaleRatio) ,
											"y": this.y + (24 / this.hScaleRatio),
											"w": 23 / this.wScaleRatio,
											"h": 23 / this.hScaleRatio,
											"z": 2
											})
		this.hookRight = Crafty.e("Lab_Falling_hook").attr({
											"x": this.x +  (253 / this.wScaleRatio),
											"y": this.y + (24 / this.hScaleRatio),
											"w": 23 / this.wScaleRatio,
											"h": 23 / this.hScaleRatio,
											"z": 2
										})
		this.added = true
	},
	destroy: function(){
		this.hookRight.destroy()
		this.hookLeft.destroy()
	},
	resetPosition: function(){
		 this.hookRight.destroy()
		 this.hookLeft.destroy()
		 this.create()
		 this.setOrigin()
	}
})
/**
 * 
 */
Crafty.c("Target", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("2D, Box2D")									// allows the entity to be drawn as a colored box
			.attr({w: 30, h: 30, name: "Target"})												// set width and height
			.box2d({
				bodyType: 'static',
				isSensor: true,
				shape: "box"
			})
	}
});
Crafty.c("Lab_Target", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("Canvas, lab_tuyeau, MouseHover")							// allows the entity to be drawn as a colored box
			.attr({w: 86, h: 242, name: "Target"})												// set width and height
			.bind("EnterFrame", function() {
				if(!this.added){
					this.setOrigin()
					this.create()
				}
				if($.App.debug && (this.x != this.xOrigin || this.y != this.yOrigin || this.w != this.wOrigin || this.h != this.hOrigin)){
					this.resetPosition()
				}
			})
	},
	setOrigin: function() {
		this.xOrigin = this.x;
		this.yOrigin = this.y;
		this.wOrigin = this.w;
		this.hOrigin = this.h;
	},
	create: function() {
		this.wScaleRatio =	 86 / this.w
		this.hScaleRatio = 	242 / this.h
		this.target = Crafty.e("Target").attr({
								"x": this.x + (25 / this.wScaleRatio),
								"y": this.y + (290 / this.hScaleRatio),
								"w": 40 / this.wScaleRatio,
								"h": 40 / this.hScaleRatio,
								"z": 160
		 })
		 this.added = true
	},
	resetPosition: function(){
		 this.target.destroy()
		 this.create()
		 this.setOrigin()
	}
});


Crafty.c("Garage_Target", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("Canvas, Target, garage_exit, MouseHover")							// allows the entity to be drawn as a colored box
			.attr({w: 429, h: 233, name: "Target"})												// set width and height
	}
});
/**
 * 
 */
Crafty.c("MovingPlatform", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("2D, Box2D, MouseHover, Canvas")
			.attr({
				w: 100, 
				h: 20,
				time: 2,
				name: "movingPlat"
			})
			.bind("EnterFrame", function() {									// runs everyframe of the game
				var body = this.body,
					ratio = Crafty.box2D.PTM_RATIO,
					position = body.GetPosition()

				if(!this.runOnce){
					this.setOrigin()
					this.setDistance(position, ratio)
				}
				if($.App.debug) {																	// if app is in edit mode
					if(this.moving != true){
						if(this.x != this.xOrigin || this.y != this.yOrigin || this.w != this.wOrigin || this.h != this.hOrigin){
							this.setOrigin()
							console.log("setOrigin")
						}
					} else {
						if(this.x != this.x1 || this.y != this.y1) {
							body.SetPosition(new b2Vec2(this.x1 / ratio, this.y1 / ratio))
						}
					}
					this.moving = false
				} else {
					if(this.xDiff > 0 ){
						if(position.x < this.x1 / ratio || position.x > (this.x1 + this.xDiff) / ratio){		// if it reaches one of the bounderies(x1, x2) it switches direction
							this.xPosDiff = -this.xPosDiff;
						}
					} else if(this.xDiff < 0){
						if(position.x > this.x1 / ratio || position.x < (this.x1 + this.xDiff) / ratio){		// if it reaches one of the bounderies(x1, x2) it switches direction
							this.xPosDiff = -this.xPosDiff;
						}
					}
					if(this.yDiff > 0){
						if(position.y < this.y1 / ratio || position.y > (this.y1 + this.yDiff) / ratio){		// if it reaches one of the bounderies(y1, y2) it switches direction
							this.yPosDiff = -this.yPosDiff;
						}
					}else if(this.yDiff < 0){
						if(position.y > this.y1 / ratio || position.y < (this.y1 + this.yDiff) / ratio){		// if it reaches one of the bounderies(y1, y2) it switches direction
							this.yPosDiff = -this.yPosDiff;
						}
					}
										this.position = new b2Vec2(position.x + this.xPosDiff, position.y + this.yPosDiff)
					body.SetPosition(this.position)
					xPrevPos = body.GetPosition().x
					yPrevPos = body.GetPosition().y
					this.moving = true
				}
			});
	},
	setOrigin: function() {
		this.runOnce = true
		this.x1 = this.x;
		this.y1 = this.y;
		this.xOrigin = this.x;
		this.yOrigin = this.y;
		this.wOrigin = this.w;
		this.hOrigin = this.h;
	},
	setDistance: function(position, ratio) {
		var fps = Crafty.timer.FPS()
		this.xPosDiff = (this.xDiff / ratio) / (this.time * fps);
		this.yPosDiff = (this.yDiff / ratio) / (this.time * fps);
	}
});
Crafty.c("Standard_MovingPlatform", {
	init: function() { 
		this.requires("MovingPlatform, Color")
			.color("blue")
			.box2d({
					 bodyType: 'kinematic',
					 density: 1.0,
					 friction: 10,
					 restitution: 0,
					 shape: "box",
					 userData: "moving_platform"
				 })
	}
});
Crafty.c("Lab_MovingPlatform", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("MovingPlatform, lab_plateforme1")						 // allows the entity to be drawn as a colored box
			.box2d({
				bodyType: 'kinematic',
				density: 1.0,
				friction: 10,
				restitution: 0,
				userData: "moving_platform"
			})
			.updateSize = function(){											//Override update size function
				return sizeChange(this, ({"top":8, "right": 146, "bottom": 66, "left": 8}))
			}
	}
});
/*
 * Garage
 */
Crafty.c("Garage_Window", {
	
	init: function() {
		this.requires("2D, Box2D, MouseHover, garage_window, Canvas")									// allows the entity to be drawn as a colored box
			.attr({
				w: 500,
				h: 254
			})												// set width and height
			.box2d({
				bodyType: 'static',
				userData: "plat"
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":3, "right": 478, "bottom": 248, "left": 22}))
			}
	}
})
Crafty.c("Garage_Sign", {
	
	init: function() {
		this.requires("2D, Box2D, MouseHover, garage_sign, Canvas")									// allows the entity to be drawn as a colored box
			.attr({
				w: 560,
				h: 477
			})												// set width and height
			.box2d({
				bodyType: 'static',
				userData: "plat"
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":12, "right": 415, "bottom": 417, "left": 8}))
			}
	}
})
Crafty.c("Garage_Falling_Ledge", {
	
	init: function() {
		this.requires("Falling, garage_breaking_ledge, Box2D")
			.attr({
				w: 200,
				h: 28,
				fallTime: 2,
		 		breaking: 4,
		 		idle: 1,
		 		recoverTime: 5
			})												// set width and height
			.reel("breaking", (this.fallTime * 1000), 0, 0, this.breaking )
			.reel("idle", this.fallTime * 1000, 0, 0, this.idle )
			.box2d({
				bodyType: 'static',
				userData: "plat"
			})
			.updateSize = function(){																//Override update size function
				   return sizeChange(this, ({"top":6, "right": 193, "bottom": 23, "left": 8}))
			}
	}
})
Crafty.c("WalloText", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("2D, DOM, Text, MouseHover")
			.attr({w: 100, h: 20});
	}
});

Crafty.c("Invisible", {
	init: function() {															// init function is automatically run when entity with this component is created
		this.requires("2D, DOM, Platform, MouseHover")
			.attr({w: 100, h: 20});
	}
});

Crafty.c("Video", {
    init: function() {															// init function is automatically run when entity with this component is created
        this.requires("2D, DOM, MouseHover")
            .attr({w: 150, h: 80});
    },
    url: function(url) {

        if (url.indexOf("youtube.com") > -1) {
            var id = url.match(/v=(...........)/)[1];
            $(this._element).html('<div class="dummy"></div><iframe class="ytplayer" width="100%" height="100%" src="//www.youtube.com/embed/' + id
                + '?rel=0&amp;controls=0&amp;showinfo=0&loop=1&modestbranding=1&autoplay=1&fs=0&enablejsapi=1" frameborder="0" ></iframe>');

            var tag = document.createElement('script');
            tag.src = "//www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            if (window.YT) {
                muteAllVids();
            }
        }
    }
});

window.onYouTubeIframeAPIReady = function() {
    muteAllVids();
};
function muteAllVids() {
    $(".ytplayer").each(function(i, e) {
        var player = new YT.Player(e, {
            events: {
                'onReady': function(event) {
                    player.playVideo();
                    // Mute?!
                    //player.mute(); instead of this use below
                    event.target.mute();
                    //player.setVolume(0);
                }
            }
        });
    });
}


function sizeChange(platform, boxPos){
	var PTM_RATIO = Crafty.box2D.PTM_RATIO;
	platform.fixtures[0].m_shape.SetAsArray([
		new b2Vec2((platform.w * (boxPos.left / platform.__tile)) / PTM_RATIO, (platform.h * (boxPos.top / platform.__tileh)) / PTM_RATIO),
		new b2Vec2((platform.w * (boxPos.right / platform.__tile)) / PTM_RATIO, (platform.h * (boxPos.top / platform.__tileh)) / PTM_RATIO),
		new b2Vec2((platform.w * (boxPos.right / platform.__tile)) / PTM_RATIO, (platform.h * (boxPos.bottom / platform.__tileh)) / PTM_RATIO),
		new b2Vec2((platform.w * (boxPos.left / platform.__tile)) / PTM_RATIO, (platform.h * (boxPos.bottom / platform.__tileh)) / PTM_RATIO)],
		4
	);
	return platform;
}
