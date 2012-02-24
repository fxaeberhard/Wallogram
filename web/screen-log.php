<?php 
require('config.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<title>Wallogram</title>
	<link rel="icon" type="image/ico" href="/favicon.ico" /> 
	
	<!--	Online version -->
	<!--<link rel="stylesheet" type="text/css" 
		href="http://yui.yahooapis.com/combo?3.4.1/build/cssfonts/fonts-min.css&3.4.1/build/cssreset/reset-min.css&3.4.1/build/cssgrids/grids-min.css&3.4.1/build/cssbase/base-min.css" charset="utf-8" /> 
	 -->
	<link rel="stylesheet" type="text/css" href="lib/yui3/build/cssfonts/fonts-min.css" />
	<link rel="stylesheet" type="text/css" href="lib/yui3/build/cssreset/reset-min.css" />

	<meta id="customstyles" /> 
	
</head>

<body>
	<?php 
		session_start();
		$padUrl = 'http://wallogram.red-agent.com/pad.php?sid='.session_id();
		$padUrl = 'pad.php?sid='.session_id();
	?>
	
	<div data-role="content" data-inset="true" data-theme="a">   
	 	To connect a pad, use your phone to the following url:<br/>
	 	<a href="<?php echo $padUrl?>" target="_blank"><?php echo $padUrl?></a>
	 	or use the following QR code:<br />
	 	<img src="http://chart.apis.google.com/chart?cht=qr&chs=230x230&chld=Q&choe=UTF-8&chl=<?php echo urlencode($padUrl)?>" />
	</div>

	<div id="logger"></div>

	<!-- YUI Base Classes -->
	<!--<script type="text/javascript" src="http://yui.yahooapis.com/combo?3.4.1/build/yui/yui-min.js&3.4.1/build/loader/loader-min.js"></script> 
	-->
	<script src="http://js.pusherapp.com/1.9/pusher.min.js" type="text/javascript"></script>
 	<script type="text/javascript" src="lib/yui3/build/yui/yui.js"></script> 
	<script type="text/javascript" src="lib/yui3/build/loader/loader.js"></script> 
	
	<script src="http://js.pusher.com/1.11/pusher.min.js" type="text/javascript"></script>
  	
	<script type="text/javascript">
		var sessionId = '<?php echo session_id();?>',
			pusherChannel = 'private-'+sessionId,
			pusherAppId = '<?php echo PUSHERAPP_APPID; ?>',
			pusherAuthKey = '<?php echo PUSHERAPP_AUTHKEY; ?>';

		Pusher.log = function(message) {
		 	if (window.console && window.console.log) window.console.log(message);
		};
        Pusher.channel_auth_endpoint = 'pusher_auth.php';
	    // Flash fallback logging - don't include this in production
	    //WEB_SOCKET_DEBUG = true;

	    var pusher = new Pusher(pusherAuthKey);
	    
	    var channel = pusher.subscribe(pusherChannel);
	    channel.bind('client-pad-event', function(data) {
	        if (data.sid == sessionId) {
	        	document.getElementById('logger').innerHTML += '<p>'+data.button+", "+data.position+", "+data.uid+'</p>';
	        	console.log("Pusher data received", data);
	        }
	    });
	</script>
</body>
</html>