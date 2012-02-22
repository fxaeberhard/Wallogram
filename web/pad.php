<?php 
// Get the config
require('config.php');	

// Init php session
$_REQUEST['sid'];		
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Wallogram GamePad</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<link rel="icon" type="image/ico" href="/favicon.ico" /> 
		
		<!-- YUI 3 -->
		<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/combo?3.3.0/build/cssfonts/fonts-min.css&3.3.0/build/cssreset/reset-min.css&3.3.0/build/cssgrids/grids-min.css&3.3.0/build/cssbase/base-min.css" charset="utf-8" /> 
		
		<!-- Shadowbox -->
		<link rel="stylesheet" type="text/css" href="lib/shadowbox-3.0.3/shadowbox.css">
	
		<!-- Pad -->
		<meta id="customstyles" /> 
		<link rel="stylesheet" type="text/css" href="assets/pad.css">
	</head>

	<body class="yui3-skin-sam">
	
		<!-- Markup -->
		<div class="pad" >
			<div class="pad-cross"></div>
			<div class="pad-crossdummy-top"></div>
			<div class="pad-crossdummy-bottom"></div>
			<div class="pad-crossdummy-left"></div>
			<div class="pad-crossdummy-right"></div>
			<div class="pad-button-select"></div>
			<div class="pad-button-start"></div>
			<div class="pad-button-a"></div>
			<div class="pad-button-b"></div>
		</div>
	
		<!-- YUI 3 - Loader -->
		<script type="text/javascript" src="http://yui.yahooapis.com/combo?3.3.0pr3/build/yui/yui-min.js&3.3.0pr3/build/loader/loader-min.js"></script> 

		<!-- Shwadowbox -->
		<script type="text/javascript" src="lib/shadowbox-3.0.3/shadowbox.js"></script>
		
		<!-- Pusher JS -->
		<script src="http://js.pusherapp.com/1.9/pusher.min.js" type="text/javascript"></script>
	  	
	  	<!-- Wallogram - Pad -->
		<script type="text/javascript">
			var sessionId = '<?php session_start();echo session_id();?>',
				screenId = '<?php echo (isset($_REQUEST['sid']))?$_REQUEST['sid']:'1745';?>',
				pusherAppId = '<?php echo PUSHERAPP_APPID; ?>',
				pusherAuthKey = '<?php echo PUSHERAPP_AUTHKEY; ?>',
				pusherChannelPrefix = 'private-',
				pusherSecretKey = '<?php echo PUSHERAPP_SECRET; ?>';
		</script>
		<script src="js/pad.js" type="text/javascript"></script>
	</body>
</html>