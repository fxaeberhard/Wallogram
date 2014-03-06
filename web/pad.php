<?php
require('config.php');                                                          // Get the config
session_start();                                                                // Init php session
//$_REQUEST['sid'];
?>
<!DOCTYPE html>
<html>
    <head>
        <!-- Meta -->
        <title>Wallogram pad</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <link rel="icon" type="image/ico" href="/favicon.ico" /> 

        <!-- YUI 3 -->
        <link rel="stylesheet" type="text/css" href="lib/yui3/build/cssnormalize/cssnormalize-min.css" /> 
        <!--<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.14.1/build/cssnormalize/cssnormalize-min.css" />-->

        <!-- Wallogram pad -->
        <link rel="stylesheet" type="text/css" href="css/pad.css" />

    </head>

    <body class="yui3-skin-sam">

        <!-- YUI 3 Loader -->
        <script src="lib/yui3/build/yui/yui-min.js" type="text/javascript"></script> 
        <!--<script type="text/javascript" src="http://yui.yahooapis.com/combo?3.14.1/build/yui/yui-min.js"></script>--> 

        <!-- Pusher -->
        <script src="http://js.pusher.com/2.1/pusher.min.js" type="text/javascript"></script>

        <!-- Wallogram -->
        <script src="js/pad.js" type="text/javascript"></script>        
        <script src="js/pusher.js" type="text/javascript"></script>

        <!-- Initialization -->
        <script type="text/javascript">
            YUI().use('event-resize', 'event-touch', 'event-move', 'widget', "json",
                    'widget-position', 'widget-position-align', 'array-extras',
                    'wallogram-pad', 'wallogram-pusher', function(Y) {

                var pusher = new 　Y.Wallogram.Pusher({
                    sessionId: '<?php echo session_id(); ?>',
                    screenId: '<?php echo (isset($_REQUEST['sid'])) ? $_REQUEST['sid'] : '222'; ?>',
                    appId: '<?php echo PUSHER_APPID; ?>',
                    key: '<?php echo PUSHER_AUTHKEY; ?>'
                }), //                                                          // Init pusher connection
                pad = new Y.Wallogram.Pad();                                    // Init pad

                pad.pusher = pusher;
                pad.render();                                                   // Render pad                                                  
            });
        </script>
    </body>
</html>
