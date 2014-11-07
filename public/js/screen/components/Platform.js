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
            .attr({w: 100, h: 20,})                         					// set width and height
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
            .onContact("Player", function(contacts) {
                $.App.resetPlayer(contacts[0].obj);
            });
    }
});

/**
 * 
 */
Crafty.c("QR", {
    init: function() {
        var padUrl = $.App.getPadUrl();
        this.requires("2D, DOM, MouseHover")
            .css({
                background: "url(http://chart.apis.google.com/chart?cht=qr&chs=170x170&chld=Q&choe=UTF-8&chl=" + encodeURIComponent(padUrl) + ") 0 0",
                "background-size": "100% 100%"
            })
            .attr({
                w: 80,
                h: 80,
                z: 100
            });
        // Same, using image component
        //this.requires("2D, DOM, Image,  MouseHover")
        //    .image("http://chart.apis.google.com/chart?cht=qr&chs=170x170&chld=Q&choe=UTF-8&chl=" + encodeURIComponent(padUrl))
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

/**
 * 
 */
Crafty.c("Timer", {
    init: function() {
        this.requires("2D, DOM, Text, MouseHover")
            .css({
                color: "white"
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

/**
 * 
 */
Crafty.c("Falling", {
    init: function() {                                                          // init function is automatically run when entity with this component is created
		var counter, counter2, isDown = false, xOrigin, yOrigin,
			multiplier = 50, contactName, ratio = Crafty.box2D.PTM_RATIO;
    	this.requires("ColoredPlatform, Gravity")
    		.attr({
	    		fallTime: 2,
	    		recoverTime: 5,
	    		active: false,
	    		touching: false,
	    		name: "falling"
    		})
    		.bind("EnterFrame", function() {
    			var body = this.body
    			if(!isDown){													// checks if platforme is down
	    			if(!xOrigin && !yOrigin){									// set origine location if they are not set yet
						xOrigin = this.x;
		    			yOrigin = this.y;
	    			}
	    			
	    			if (!counter && counter != 0) {								// set counter if it doesn't exist
		    			counter = this.fallTime * multiplier;
		    			counter2 = this.recoverTime * multiplier;
	    			}
	    			
	    			if(this.body.GetContactList() != null){						// check if there is contact with anything
						contactName = this.body.GetContactList().contact.m_fixtureA.m_userData;
					} else {
						contactName = "";
					}
					if(contactName == "foot" || contactName == "body"){ 		// if contact exist check if it is with a wallobot
		    			if (counter == 0) {
			    			body.SetType(2)
			    			isDown = true
			    			console.log("falling")
			    			counter2 = this.recoverTime * multiplier;
		    			} else {
			    			counter--;
		    			}
					} else if(counter < this.fallTime *multiplier){				// if not contact and counter is smaller than top time than increment
			    		counter++;
					}
					
/*
					if(counter % multiplier == 0){								// show counter in console 
		    			console.log("falling in: "+counter/multiplier)
	    			}
*/
	    		} else {
		    		if (counter2 == 0) {										// if counter = to 0 reset platform otherwise decrement counter
					    body.SetType(0)
						body.SetPosition(new b2Vec2(xOrigin/ratio, yOrigin/ratio));
						body.SetAngle(0)
						isDown = false
						console.log("reset")
						counter = this.fallTime * multiplier;
				    } else {
					    counter2--;
				    }
				    
/*
				    if(counter2 % multiplier == 0){								// show counter in console 
					    console.log("reseting in "+counter2/multiplier)
				    }
*/
	    		}
			})
    }
});
