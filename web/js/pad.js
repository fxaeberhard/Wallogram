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
}).use('node', 'event', 'slider', 'charts', function (Y) {
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
    
    	
	/******************************************** Pusher Setup */
	 // Enable pusher logging - don't include this in production
	function initPusherConnection() {
    	Pusher.log = function(message) {
          if (window.console && window.console.log) window.console.log(message);
        };
        Pusher.channel_auth_endpoint = 'pusher_auth.php';
        
        pusher = new Pusher(pusherAuthKey);
		channel = pusher.subscribe(pusherChannelPrefix+screenId);
		//channel = pusher.subscribe("private-wallogram");
	}    
    function triggerPusherEvent(evt, data) {
    	data.uid = sessionId;
    	data.sid = screenId;
		channel.trigger(evt, data);
	}
  
	/******************************************** Pad Events */
	var currentCrossButton = null,
		crossNode = Y.one('.pad-cross');
	
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
	}
	function enterCross(e, position) {
		console.log("Entering: "+position+" (b:"+e.button+", cCrossButton: "+currentCrossButton+")");
		if (e.button== 0 || position == currentCrossButton) return;
		setCross(position);
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
	}
	function pressButton(e, position) {
		if (position == 'a' || position == 'b') {
			triggerPusherEvent('client-pad-event', 
				{ button: 'button', 
					position: position
				});
		}
		this.addClass('pad-button-pressed');
	}
	function releaseButton(e, position) {
		this.removeClass('pad-button-pressed');
	}
	/************************** Set up events */
	function bindPad() {
		triggerPusherEvent('client-connection-event', { });
    	Shadowbox.close();
		
    	var crossPositions = ['top', 'bottom', 'left', 'right'],
    		buttonsPositions = ['a', 'b', 'start', 'select'],
    		i = 0, node, pos;
    	for (;i<crossPositions.length;i++) {
    		pos = crossPositions[i];
    		node = Y.one('.pad-crossdummy-'+pos);
    		node.on('mousedown', pressCross, null, pos);
    		node.on('mouseup', releaseCross, null, pos);
    		node.on('mouseenter', enterCross, null, pos);
    		node.on('mouseleave', leaveCross, null, pos);
    		node.on('dragenter', enterCross, null, pos);
    		node.on('dragleave', leaveCross, null, pos);
    	}
    	for (i=0;i<buttonsPositions.length;i++) {
    		pos = buttonsPositions[i];
    		node = Y.one('.pad-button-'+pos);
    		node.on('mousedown', pressButton, null, pos);
    		node.on('mouseup', releaseButton, null, pos);
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