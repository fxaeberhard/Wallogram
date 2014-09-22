/**
 *
 * Wallogram pad. Quick and dirty.
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
	
Y = YUI({
    charset: 'utf-8',
    debug: true,
    loadOptional: true,
    insertBefore: 'customstyles',
    gallery: 'gallery-2011.02.18-23-10',
    filter: 'raw'
}).use('node', 'event', 'slider', 'charts', 'event-resize', 'event-touch', 'event-move', function (Y) {
	var pusher, channel, state,
		mychart,
		myDataValues = [ 
			{x:0, y:0, z:0}, 
			{x:0, y:0, z:0}, 
			{x:0, y:0, z:0}, 
			{x:0, y:0, z:0}, 
			{x:0, y:0, z:0}, 
			{x:0, y:0, z:0}, 
			{x:0, y:0, z:0}, 
			{x:0, y:0, z:0}, 
			{x:0, y:0, z:0}, 
			{x:0, y:0, z:0}
			];
    
    	
	/* Fit pad to window */
	function fitPad() {
		var bodyNode = Y.one("body"),
			padNode = Y.one(".pad"),
			winWidth = bodyNode.get('winWidth');
			winHeight = bodyNode.get('winHeight');
			maxWidth = 640,
			maxHeight = 291,
			padRatio = maxWidth/maxHeight,
			width=0, height=0, widthByH=0;
		
		if (winWidth > maxWidth && winHeight > maxHeight) {
			width = maxWidth;
			height = maxHeight;
		} else {
			widthByH = padRatio * winHeight;
			if (widthByH < winWidth) {
				width = widthByH; 
				height = winHeight;
			} else {
				width = winWidth;
				height = winWidth/padRatio;
			}
		}

		padNode.setStyle("width", width);
		padNode.setStyle("height", height);
		padNode.setStyle("marginLeft", -width/2);
		padNode.setStyle("marginTop", -height/2);
	}
	fitPad();
	Y.on("windowresize", fitPad);
	
	/******************************************** Pusher Setup */
	 // Enable pusher logging - don't include this in production
	function initPusherConnection() {
    	Pusher.log = function(message) {
          if (window.console && window.console.log) window.console.log(message);
        };
        Pusher.channel_auth_endpoint = 'pusher_auth.php';
        
        pusher = new Pusher(pusherAuthKey);
        channel = pusher.subscribe(pusherChannelPrefix+screenId);
		channel.bind('pusher:subscription_succeeded', function(status) {
			console.log("Connected to pusher channel.");
			Y.one(".logger").append("c");
			triggerPusherEvent('client-connection', {});
		});
		channel.bind('pusher:subscription_error', function(status) {
			alert('Error subscribing to pusher channel.');
		});
		
	}    
    function triggerPusherEvent(evt, data) {
    	data.uid = sessionId;
    	data.sid = screenId;
		channel.trigger(evt, data);
	}
  
	/******************************************** Pad Events */
	var currentCrossButton = null,
		crossNode = Y.one('.pad-cross');
	/*
	function resetCross() {
		crossNode.removeClass('pad-cross-top')
		.removeClass('pad-cross-bottom')
		.removeClass('pad-cross-left')
		.removeClass('pad-cross-right');
		currentCrossButton = null;
	}
	function setCross(position) {
		resetCross();
		crossNode.addClass('pad-cross-'+position);
		currentCrossButton = position;
		
		// FIXME
		//if (position == )
		if (position == 'left' || position == 'right' || position == 'top') {
			triggerPusherEvent('client-pad-event', 
				{ button: 'cross-down', 
				  position: position
			});
		}
	}
	function pressCross(e, position) {
		console.log("Pressing: "+position);
		if (position == currentCrossButton) return;
		setCross(position);


		this.addClass('pad-button-pressed');
	}
	function releaseCross(e, position) {
		console.log("Releasing: "+position);
		if (position == currentCrossButton) {
			resetCross();
			if (position == 'left' || position == 'right') {
				triggerPusherEvent('client-pad-event', 
				{ button: 'cross-up', 
				  position: position
				});
			}
		}

		this.removeClass('pad-button-pressed');
	}
	function enterCross(e, position) {
		console.log("Entering: "+position+" (b:"+e.button+", cCrossButton: "+currentCrossButton+")");
		if (e.button== 0 || position == currentCrossButton) return;
		setCross(position);
		this.addClass('pad-button-pressed');
	}
	function leaveCross(e, position) {
		if (position == currentCrossButton) {
			resetCross();
			if (position == 'left' || position == 'right') {
				triggerPusherEvent('client-pad-event', { 
					button: 'cross-up', 
					position: position
				});
			}
		}

		this.removeClass('pad-button-pressed');
	}*/
	function log(msg) {
	//	Y.one(".logger").append(msg+"|");
	}
	
	function pressButton(e) {
		log("press: ");
		var cTarget = e.target;

		if (e.target.position)
			log(e.target.position);
		else log("undef");

//		if (e.changedTouches) {
//			log (e.changedTouches.length);
//			log(e.changedTouches[0]._event);
//			log(e.changedTouches[0]._event.target.className);
//			log(e.changedTouches[0]._event.currentTarget.className);
			//cTarget = e.changedTouches[0];
//		}
		
		if (!cTarget.position) return; 

		switch (cTarget.position) {
			case "top":
			case "left":
			case "right":
			case "a":
			case "b":
				triggerPusherEvent('client-pad-event', 
					{ button: 'cross-down', 
					  position: cTarget.position
					});
				break;
		}
		cTarget.addClass('pad-button-pressed');

		e.preventDefault();
		e.stopPropagation();
		e.halt();
		e.stopImmediatePropagation();
	}
	function onMove(e) {
		//log("move: "+e.target.position);

		e.preventDefault();
		e.stopPropagation();
		e.halt();
		e.stopImmediatePropagation();
	}
	function releaseButton(e) {
		log("release: ");
		var cTarget = e.target;
		//if (e.changedTouches) {
		//	cTarget = e.changedTouches[0];
		//}
		if (cTarget.position)
			log(cTarget.position);
		else log("undef");
		
		if (!cTarget.position) return;

	
		switch (cTarget.position) {
			case "top":
			case "left":
			case "right":
			case "a":
			case "b":
				triggerPusherEvent('client-pad-event', 
					{ button: 'cross-up', 
					  position: cTarget.position
					});
				break;
		}
		cTarget.removeClass('pad-button-pressed');

		e.preventDefault();
		e.stopPropagation();
		e.halt();
		e.stopImmediatePropagation();
	}
	/************************** Set up events */
	function bindPad() {
		triggerPusherEvent('client-connection-event', { });
    	Shadowbox.close();
		
    	var crossPositions = ['top', 'bottom', 'left', 'right'],
    		buttonsPositions = ['a', 'b', 'start', 'select'],
    		i = 0, node, pos;
    	Y.one(".pad").on("gesturemovestart", pressButton);
    	Y.one(".pad").on("gesturechange", onMove);
    	Y.one(".pad").on("gesturemoveend", releaseButton);
    	
    	for (;i<crossPositions.length;i++) {
    		pos = crossPositions[i];
    		node = Y.one('.pad-crossdummy-'+pos);
  /*  		node.on('mousedown', pressCross, null, pos);
    		node.on('mouseup', releaseCross, null, pos);
    		node.on('mouseenter', enterCross, null, pos);
    		node.on('mouseleave', leaveCross, null, pos);
    		node.on('dragenter', enterCross, null, pos);
    		node.on('dragleave', leaveCross, null, pos);
*/
    		node.position = pos;
    		/*
    		node.on('touchstart', pressButton);
    		node.on('touchmove', function(){});
    		node.on('touchend', releaseButton);
    		*/
    		
    		/*
    		node.on('gesturemovestart', pressButton);
    		node.on('gesturemove', function(){});
    		node.on('gesturemoveend', releaseButton);*/
    	}
    	for (i=0;i<buttonsPositions.length;i++) {
    		pos = buttonsPositions[i];
    		node = Y.one('.pad-button-'+pos);
    		node.position = pos;
    		/*
    		node.on('gesturemovestart', pressButton);
    		node.on('gesturemove', function(){});
    		node.on('gesturemoveend', releaseButton);
    		*/
    	}
	}
	
	/***************************** Accelerometer */
	var data      = {x : 0, y : 0, z: 0};
	var previous  = {x : 0, y : 0, z: 0}; 

	var threshold = 2,
		interval  = 40,
		payload   = {},
		packets   = 0,
		have_gyroscope = false;

	function read_gyroscope() {
	    /* beta:  -180..180 (rotation around x axis) */
	    /* gamma:  -90..90  (rotation around y axis) */
	    /* alpha:    0..360 (rotation around z axis) (-180..180) */

	    data.x = Math.round(event.beta);
	    data.y = Math.round(event.gamma);
	    data.z = Math.round(event.alpha);
	  
	    /* jQuery mobile cannot handle negative minimum value.      */
	    /* so I have to use zero based value to display the slider. */
	   // console.log();
	   // $("#beta").val(data.x * 1 + 180).trigger("keyup");
	    //$("#gamma").val(data.y * 1 + 90).trigger("keyup");
	    //$("#alpha").val(data.z * 1 + 180).trigger("keyup");
	  
	    payload = {type: "orientation", data: data};  
	};

	function read_accelerometer() {
	    /* If we have rotation rate device has gyroscopes and start */
	    /* reading gyroscopes instead...                            */
	    if(event.rotationRate) {
	        window.removeEventListener("devicemotion", read_accelerometer, false);
	        window.addEventListener("deviceorientation", read_gyroscope, false);
	    }

	    threshold = 5;
	    /* Accelerometers give smaller number thus we multiply */
	    /* to have similar rates as with gyroscope.            */
	    data.x = Math.round(event.accelerationIncludingGravity.x * 10);
	    data.y = Math.round(event.accelerationIncludingGravity.y * 10);
	    /*data.z = Math.round(event.accelerationIncludingGravity.z * 10);*/   
	  
	    /* jQuery mobile cannot handle negative minimum value.      */
	    /* so I have to use zero based value to display the slider. */
	   // $("#beta").val(data.x * 1 + 180).trigger("keyup");
	   // $("#gamma").val(data.y * 1 + 90).trigger("keyup");
	  
	    payload = {type: "acceleration", data: data};
	};
	
	
	function initAccelerometer() {
    	state = "accelerometer";
    	bindAccelerometer();
    	Shadowbox.close();
    	Y.later(400, null, onShadowBoxClose);
	}
	
	function bindAccelerometer() {

		/* By default we read accelerometers since they are available in all iGadgets. */
		window.addEventListener("devicemotion", read_accelerometer, false);
		
		/* Reduce the amount of data to be sent in two ways. 1) Only send every */
		/* interval milliseconds and 2) Only send if user has tilted the phone  */
		/* more than threshold.                                                 */
		var sleeper = setInterval(function() {
			console.log("sleeper check");
			pushChartValue(data);
		  
		    if ((threshold < Math.abs(data.x - previous.x)) || 
		        (threshold < Math.abs(data.y - previous.y)) ||
		        (threshold < Math.abs(data.z - previous.z))) {
	    		console.log("Sleeper sends event");
	    		
		            previous.x = data.x;
		            previous.y = data.y;
		            previous.z = data.z;
		            try {
		             //   socket.send(JSON.stringify(payload));              
		            } catch(error) {
		            }
		           // $("#packets").text(packets++);
		    }
		}, interval);
		
	}
	     
    function onShadowBoxClose() {
    	//Shadowbox.makeObject(link, {
    	Shadowbox.open({
             content:    
             	'<div id="pad-chart" data-role="content" data-inset="true" data-theme="a" class="pad-accelerowindow">'+
            	 //   '<p>Now tilt your phone and see stuff move in computer browser.</p>'+
            	 //   '<div>'+
	             //	 	'X: <div id="x-slider"></div>'+
	             //	 	'Y: <div id="y-slider"></div>'+
	             //	 	'z: <div id="z-slider"></div>'+
	             //	'</div>'+
	            '</div>',
             player:     "html",
             height:     300,
             width:      300,
             options: {
 	            onFinish: bindAccelerometerScreen
 	        }
         });
	}

	function pushChartValue(val) {
		myDataValues.pop();
		myDataValues.push(val);
		mychart.set('dataProvider', myDataValues);
	}
	function bindAccelerometerScreen() {

    	mychart = new Y.Chart({
    		 styles: {
		        axes:{
		            values:{
    					label:{ color: "transparent" }
		            },
		            category:{
		                label:{ color: "transparent" }
		            }
    	 		},
		        series:{
		            x:{
		                marker:{
    	 					display: "none",
		                    fill:{
		                        color:"transparent"
		                    },
		                    border:{
		                        color:"transparent"
		                    }
		                }
    	 			},
    	 			 y:{
		                marker:{
    	 					display: "none",
		                    fill:{
		                        color:"transparent"
		                    },
		                    border:{
		                        color:"transparent"
		                    }
		                }
    	 			},
    	 			 z:{
		                marker:{
    	 					display: "none",
		                    fill:{
		                        color:"transparent"
		                    },
		                    border:{
		                        color:"transparent"
		                    }
		                }
    	 			}
		        }
    	 	},
    		dataProvider:myDataValues, render:"#pad-chart"});
	}
    function bindWelcomeScreen(e) {
    	if (state == "welcomescreen" ) {
        	Y.one('#start-pad').on('click', bindPad);
        	Y.one('#start-cinetic').on('click', initAccelerometer);
    	}
    }
    
    /******************************************** Init ShadowBox */
    Y.on('domready', function() {	
    	 
    	initPusherConnection();
    	
        Shadowbox.init({
        	displayNav: false,
            modal: true,
            skipSetup: true
        });
        state = "welcomescreen";
      
        Shadowbox.open({
            content:    
            	'<div class="pad-choosewindow">Welcome to Wallogram! <br />Choose your controle style: <br /><br /><br />'+
            	'<input id="start-pad" type="button" value="Use traditionnale game pad" /><br /><br />'+
            	'<input id="start-cinetic" '+((Y.UA.ipad || Y.UA.ipad || true)?'':'disabled="diabled"')+' type="button" value="Use cinetic controls." /><br />'+
            	'<div class="pad-small">(only available on ipad & iphone)</div>'+
            	'</div>',
            player:     "html",
            height:     300,
            width:      300,
            gallery: 'wall',
            options: {
	        	onFinish: bindWelcomeScreen
	        }
        });
    });
    
});