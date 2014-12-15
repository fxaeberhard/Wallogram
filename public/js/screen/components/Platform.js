/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
Crafty.c("Platform", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("2D, Box2D, MouseHover")                                  // allows the entity to be drawn as a colored box
            .attr({w: 100, h: 20})                         					// set width and height
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
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("Platform, Canvas, Color")                                // allows the entity to be drawn as a colored box
            .color("white");
    }
});

/**
 * 
 */
Crafty.c("MovingPlatform", {
    init: function() {                                                         // init function is automatically run when entity with this component is created
       	var Xdirection = Ydirection = xSpeed = ySpeed = 0;
        this.requires("2D, Box2D, MouseHover, Canvas, Color")                   				
            .attr({
            	w: 100, 
            	h: 20,
            	x1: 200,
            	y1: 200,
	            x2: 300,
	            y2: 200,
	            time: 2,
	            name: "movingPlat"
            })
            .box2d({
                bodyType: 'kinematic',
                density: 1.0,
                friction: 10,
                restitution: 0,
                shape: "box"
            })
            .color("blue")
            .bind("EnterFrame", function() {									// runs everyframe of the game
            	var body = this.body,
            		ratio = Crafty.box2D.PTM_RATIO,
					Xposition = body.m_xf.position.x*ratio,
					Yposition = body.m_xf.position.y*ratio
            	
            	if(xSpeed == 0 || ySpeed == 0){									// set respective speed for each direction
					var fps = Crafty.timer.FPS(),
						x = this.x1 - this.x2,
						y = this.y1 - this.y2
	            	
	            	xSpeed = x / (this.time * fps)
	            	ySpeed = y / (this.time * fps)
            	}
            	
            	Xdirection = (Xdirection == 0) ? xSpeed : Xdirection;			// if direction is not set, give it positive value of speed
				if(Xposition < this.x1 || Xposition > this.x2){					// if it reaches one of the bounderies(x1, x2) it switches direction
            		Xdirection = -Xdirection;
            	}
				
				Ydirection = (Ydirection == 0) ? ySpeed : Ydirection;			// if direction is not set, give it positive value of speed
				if(Yposition < this.y1 || Yposition > this.y2){					// if it reaches one of the bounderies(y1, y2) it switches direction
            		Ydirection = -Ydirection;
            	}
            	
				
				var velocity = new b2Vec2(Xdirection, Ydirection)
				body.SetLinearVelocity(velocity)
            });
    }
});

/**
 * 
 */
Crafty.c("Target", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("2D, Box2D, MouseHover")                                  // allows the entity to be drawn as a colored box
            .attr({w: 30, h: 30})                                               // set width and height
            .box2d({
                bodyType: 'static',
                density: 1.0,
                friction: 10,
                restitution: 0,
                isSensor: true,
                shape: "box"
            })
            .onContact("Player", function() {
                $.App.setState("win");
            });
    }
});

Crafty.c("Spawner", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("2D, Box2D, MouseHover")                                  
            .attr({w: 60, h: 60})                                               // set width and height based on player
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
		&& fixtures[index2].GetBody().GetUserData().name == "hotdog" 
		|| fixtures[index2].GetBody().GetUserData().name == "player"){
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
                z: 100
            });
        // Same, using image component
        //this.requires("2D, DOM, Image,  MouseHover")
        //    .image("http://chart.apis.google.com/chart?cht=qr&chs=170x170&chld=Q&choe=UTF-8&chl=" + encodeURIComponent(padUrl))
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
        this.css({
            // background: "url(//chart.apis.google.com/chart?cht=qr&chs=170x170&chld=Q&choe=UTF-8&chl=" + encodeURIComponent(padUrl) + ") 0 0",
            background: "url(//qrickit.com/api/qr?fgdcolor=" + this._foreground.replace("#", "")
                + "&bgdcolor=" + this._background.replace("#", "")
                + "&qrsize=170&t=p&e=m&d=" + encodeURIComponent(padUrl) + ") 0 0",
            //background: "url(//api.qrserver.com/v1/create-qr-code/?size=170x170&fgcolor=" + this._foreground.replace("#", "")
            //    + "&bgcolor=" + this._background.replace("#", "")
            //    + "&data=" + encodeURIComponent(padUrl) + ") 0 0",
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
        //    .image()
        //    .css({
        //        "background-size": "100% 100%"
        //    })
    },
    image: function(url) {
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
	        	"color": "green"
        	})
            .css({
                color: this.color
            });

        var that = this, timerHandler;

        $(document).on("stateChange", function(e, newState, oldState) {
            switch (oldState) {                                                 // Exit previous state
                case "run":
                    clearInterval(timerHandler);
                    break;
            }

            switch (newState) {                                                 // Enter new state
                case "countdown":                                               // Show countdown before play
                    that.text("Ready...");
                    break;

                case "run":                                                     // Play
                    timerHandler = setInterval(function() {
                        that.text($.HHMMSS(new Date().getTime() - $.App.startTime));
                    }, 53);
                    break;

                case "win":                                                     // Somebody reached the goal
                    that.text("Final time<br />" + that.text());
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
                $.Edit.showEdition(this);
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
Crafty.c("Lab_Porte", {
    init: function() {
        this.requires("2D, Canvas, MouseHover, lab_porte, Box2D")
            .bind("EnterFrame", function() {
				if(this.initiated != true){
					this.setupBox2D()
				}

	            
            })
    },
    setupBox2D: function() {
	    this.box2d({
                bodyType: 'static',
                shape: [[this.w * (11 / 236), this.h * (309 / 361)], 
                		[this.w * (227 / 236), this.h * (309 / 361)], 
                		[this.w * (227 / 236), this.h * (349 / 361)], 
                		[this.w * (11 / 236), this.h * (349 / 361)]],
                userData: "plat"
            })
        this.initiated = true
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
            .reel("anim", this.animSpeed, 0, 0, 51)
            .reel("idle", this.animSpeed, 0, 0, 1)
            .bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
					this.setupBox2D()
				}
				
            })
    },
    setupBox2D: function() {
	    this.box2d({
                bodyType: 'static',
                shape: [[this.w * (10 / 134), this.h * (129 / 160)], 
                		[this.w * (125 / 134), this.h * (129 / 160)], 
                		[this.w * (125 / 134), this.h * (137 / 160)], 
                		[this.w * (10 / 134), this.h * (137 / 160)]],
                
                userData: "plat"
            })
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
            .reel("anim", this.animSpeed, 0, 0, 78)
            .reel("idle", this.animSpeed, 0, 0, 1)
            .bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
					this.setupBox2D()				
				}
	            
            })
    },
    setupBox2D: function() {
	    this.box2d({
                bodyType: 'static',
                shape: [[this.w * (5 / 182), this.h * (5 / 152)], 
                		[this.w * (175 / 182), this.h * (5 / 152)], 
                		[this.w * (175 / 182), this.h * (151 / 152)], 
                		[this.w * (5 / 182), this.h * (151 / 152)]],
                userData: "plat"
            })
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
            .reel("anim", this.animSpeed, 0, 0, 9)
            .reel("idle", this.animSpeed, 0, 0, 1)
            .bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
					this.setupBox2D()				}
	            
            })
    },
    setupBox2D: function() {
	    this.box2d({
                bodyType: 'static',
                shape: [[this.w * (11 / 236), this.h * (309 / 361)], 
                		[this.w * (227 / 236), this.h * (309 / 361)], 
                		[this.w * (227 / 236), this.h * (346 / 361)], 
                		[this.w * (11 / 236), this.h * (346 / 361)]],
                userData: "plat"
            })
    }
})
/**
 * 
 */
Crafty.c("Falling", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
		this.isDown = false;
		var counter, counter2,
			multiplier = 50, ratio = Crafty.box2D.PTM_RATIO;
    	this.requires("AnimatedPlatform, Box2D")
    		.attr({
	    		w: 100,
	    		h: 20,
	    		fallTime: 2,
	    		breaking: 30,
	    		idle: 1,
	    		recoverTime: 5,
	    		animSpeed: 800,
	    		active: false,
	    		touching: false,
	    		name: "falling"
    		})
    		.reel("breaking", (this.fallTime * 1000), 0, 0, this.breaking )
    		.reel("idle", this.fallTime * 1000, 0, 0, this.idle )
    		.bind("EnterFrame", function() {
    			var body = this.body
    			if (this.runOnce != true) {
		    		this.setOrigin()
		    		this.setCounters(multiplier)
	    		}	
	    		if(this.touching == true){
		    		if(this.isDown == false ){					// checks if platforme is down											
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
	    
        this.requires("Falling")
            .attr({
                animSpeed: 1000,
                animLength: 1,
                isSensor: true
            })
            .reel("anim", this.animSpeed, 0, 0, 76)
            .reel("idle", this.animSpeed, 0, 0, 1)
            .bind("EnterFrame", function() {
				if(!this.isPlaying("anim")){
					this.animate("anim",-1)
					this.setupBox2D()				}
	            
            })
    },
    setupBox2D: function() {
	    this.box2d({
                bodyType: 'static',
                density: 0.2,
                friction: 10,
                restitution: 0,
                shape: "box"
            })
    }
})
Crafty.c("Lab_Falling_platform", {
	
    init: function() {
        this.requires("Falling, lab_plateforme_tombe")
            .attr({
                animSpeed: 1000,
                animLength: 1,
            })
            .bind("EnterFrame", function() {
				if(this.initiated != true){
					this.setupBox2D()
				}
	            
            })
    },
    setupBox2D: function() {
	    this.box2d({
                bodyType: 'static',
                friction: 0,
                restitution: 0,
                shape: [[this.w * (10 / 336), this.h * (48 / 196)], 
                		[this.w * (325 / 336), this.h * (48 / 196)], 
                		[this.w * (325 / 336), this.h * (183 / 196)], 
                		[this.w * (10 / 336), this.h * (183 / 196)]],
                userData: "plat"
            })
		this.initiated = true;
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
	    this.wScaleRatio =  336 / this.w
		this.hScaleRatio = 	196 / this.h
	    this.hookLeft = Crafty.e("Lab_Falling_hook").attr({"x": this.x + (54 / this.wScaleRatio) ,
										   "y": this.y + (24 / this.hScaleRatio),
										   "w": 23 / this.wScaleRatio,
										   "h": 23 / this.hScaleRatio,
										   "z": 2
											})
		this.hookRight = Crafty.e("Lab_Falling_hook").attr({"x": this.x +  (253 / this.wScaleRatio),
										   "y": this.y + (24 / this.hScaleRatio),
										   "w": 23 / this.wScaleRatio,
										   "h": 23 / this.hScaleRatio,
										   "z": 2
										})
		this.added = true
    },
    resetPosition: function(){
	    this.hookRight.destroy()
	    this.hookLeft.destroy()
	    this.create()
	    this.setOrigin()
    }
})

Crafty.c("WalloText", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("2D, DOM, Text, MouseHover")
            .attr({w: 100, h: 20});
    }
});

Crafty.c("Invisible", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("2D, DOM, MouseHover")
            .attr({w: 100, h: 20});
    }
});

Crafty.c("Video", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
        this.requires("2D, DOM, MouseHover")
            .attr({w: 150, h: 80});
    },
    url: function(url) {

        if (url.indexOf("youtube.com") > -1) {
            var id = url.match(/v=(...........)/)[1];
            $(this._element).html('<div class="dummy"></div><iframe width="100%" height="100%" src="//www.youtube.com/embed/' + id
                + '?rel=0&amp;controls=0&amp;showinfo=0&loop=1&modestbranding=1&autoplay=1&fs=0" frameborder="0" ></iframe>');
        }

    }
});

