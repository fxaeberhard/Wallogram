<?php
/*
 * Wallogram
 * http://wallogram.red-agent.com
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
?>
<?php
require('config.php');                                                          // Get the config
session_start();                                                                // Init php session
$session_id = (isset($_REQUEST['sid'])) ? $_REQUEST['sid'] : '222';
//$_REQUEST['sid'];
?>
<!DOCTYPE html>
<html>
    <head>

        <!-- Meta -->
        <title>Wallogram pad</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <link rel="icon" type="image/ico" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>

        <!-- YUI3 -->
        <link rel="stylesheet" type="text/css" href="lib/yui3/build/cssnormalize/cssnormalize-min.css" /> 
        <!--<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.14.1/build/cssnormalize/cssnormalize-min.css" />-->

        <!-- Pad stylessheets -->
        <link rel="stylesheet" type="text/css" href="css/pad.css" />

    </head>

    <body class="yui3-skin-sam">

        <!-- YUI3 -->
        <script src="lib/yui3/build/yui/yui-min.js" type="text/javascript"></script> 
        <!--<script type="text/javascript" src="http://yui.yahooapis.com/combo?3.14.1/build/yui/yui-min.js"></script>--> 

        <!-- Pusher -->
        <script src="http://js.pusher.com/2.1/pusher.min.js" type="text/javascript"></script>

        <!-- Sources -->
        <script src="js/pad.js" type="text/javascript"></script>        
        <script src="js/pusher.js" type="text/javascript"></script>

        <!-- Initialization -->
        <script type="text/javascript">
            YUI().use('event-resize', 'event-gestures', 'widget', "json",
                    'widget-position', 'widget-position-align', 'array-extras',
                    'wallogram-pad', 'wallogram-pusher', function(Y) {          // Fetch dependencies

                var pusher = new 　Y.Wallogram.Pusher({                         // Init pusher connection
                        sessionId: '<?php echo session_id(); ?>',               // Player identifier
                        screenId: '<?php echo $session_id ?>',                  // Playfield identifier
                        key: '<?php echo PUSHER_AUTHKEY; ?>'                    // Pusher autentication key
                    }),
                    pad = new Y.Wallogram.Pad();                                // Init pad;

                pad.pusher = pusher;
                pad.render();                                                   // Render pad                                                  
            });
        </script>

    </body>
</html>
