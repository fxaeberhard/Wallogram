<?php
/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */

require('config.php');
$screenId = "po";
$padUrl = 'http://www.red-agent.com/wallogram/pad.php?sid=' . $screenId;
?><!DOCTYPE html>
<html>
    <head>
        <title>Wallogram</title>
        <meta name="google" value="notranslate" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="icon" type="image/png" href="favicon.png" />

        <!-- YUI3 -->
        <link rel="stylesheet" type="text/css" href="lib/yui3/build/cssnormalize/cssnormalize-min.css" />
        <!--<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.14.1/build/cssnormalize/cssnormalize-min.css" />-->

        <!-- Shadow box -->
        <link rel="stylesheet" type="text/css" href="lib/shadowbox/shadowbox.css">

        <!-- Wallogram -->
        <link rel="stylesheet" type="text/css" href="css/screen.css">
    </head>

    <body class="yui3-skin-sam">

        <!-- Welcome page -->
        <div class="wallogram-welcomepage">

            <div style="float:left;max-width: 730px;">
                <p class="wallogram-title"><img src="assets/wallogram-picto-loup-50.png" />Wallogram</p>
                <p><br />
                    Wallogram turns our environment in a video game playground. 
                </p>
                <p>
                    To do so the game is projected on walls and facades and several players use their mobile phone as a game controller.
                </p>
            </div>

            <a href_o="<?php echo $padUrl ?>" target="_blank" class="wallogram-padlink">
                <img src="http://chart.apis.google.com/chart?cht=qr&chs=200x200&chld=Q&choe=UTF-8&chl=<?php echo urlencode($padUrl) ?>" width="200" height="200" />
                <img class="wallogram-padlink-logo" src="assets/wallogram-picto-pad-110.png" />
                <span>Scan to play</span>
            </a>

            <div style="clear:both;padding:2em;"></div>

            <div class="wallogram-gallery">
                <a href="assets/screenshots/20140321_124232.jpg" rel="shadowbox[Main]" title="Portes Ouvertes Heig-vd 2013">
                    <img src="assets/screenshots/mini/20140321_124232.jpg" />
                </a>
                <a href="assets/screenshots/20140321_143718.jpg" rel="shadowbox[Main]" title="Prototype">
                    <img src="assets/screenshots/mini/20140321_143718.jpg" />
                </a>
                <a href="assets/screenshots/20140321_124248.jpg" rel="shadowbox[Main]" title="Prototype">
                    <img src="assets/screenshots/mini/20140321_124248.jpg" />
                </a>
                <a href="assets/screenshots/Wallogram-proto-0.1.png" rel="shadowbox[Main]" title="Prototype">
                    <img src="assets/screenshots/mini/Wallogram-proto-0.1.png" />
                </a>
                <a href="assets/screenshots/manette.png" rel="shadowbox[Main]" title="Controller">
                    <img src="assets/screenshots/mini/manette.png" />
                </a>
                <a href="assets/screenshots/Prototype-wall-16_9_noir.png" rel="shadowbox[Main]" title="Concept">
                    <img src="assets/screenshots/mini/Prototype-wall-16_9_noir.png" />
                </a>
                <a href="assets/screenshots/fenetre_3quarts.png" rel="shadowbox[Main]" title="Concept">
                    <img src="assets/screenshots/mini/fenetre_3quarts.png" />
                </a>
                <a href="assets/screenshots/fenetre_verte.png" rel="shadowbox[Main]" title="Concept">
                    <img src="assets/screenshots/mini/fenetre_verte.png" />
                </a>
                <a href="assets/screenshots/Wallogram-Montage.mp4" rel="shadowbox[Main];width=720;height=404;player=flv;" title="Concept">
                    <img src="assets/screenshots/mini/Wallogram-Montage.png" />
                </a>
            </div>

            <footer>
                &copy; Francois-Xavier Aeberhard, <a target="_blank" href="http://www.red-agent.com">Red Agent</a> 
                <br />
                Wallogram is distributed under MIT License. <a href="https://github.com/fxaeberhard/Wallogram" target="_blank">Github</a>
            </footer>
        </div>

        <!-- Play page -->
        <div class="wallogram-playpage">
            <!-- QR -->
            <div class="qr">
                <a href_o="<?php echo $padUrl ?>" target="_blank" class="wallogram-padlink">
                    <img src="http://chart.apis.google.com/chart?cht=qr&chs=200x200&chld=Q&choe=UTF-8&chl=<?php echo urlencode($padUrl) ?>" width="200" height="200" />
                    <!-- <img src="qr.php?url=<?php echo urlencode($padUrl) ?>" width="200" height="200" />-->
                    <img class="wallogram-padlink-logo" src="assets/wallogram-picto-pad-110.png" />
                    <span>Scan to play</span>
                </a>
            </div>
            <!-- Screen swf -->
            <div id="flashContent">
                <p>
                    To view this page ensure that Adobe Flash Player version
                    10.2.0 or greater is installed.
                </p>
                <a href='http://www.adobe.com/go/getflashplayer'><img src='http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player' /></a>
            </div>
        </div>

        <!-- YUI3 -->
        <script type="text/javascript" src="lib/yui3/build/yui/yui-min.js"></script>
        <!--<script type="text/javascript" src="http://yui.yahooapis.com/combo?3.14.1/build/yui/yui-min.js"></script>-->

        <!-- Pusher -->
        <script type="text/javascript" src="http://js.pusher.com/2.1/pusher.min.js"></script>

        <!-- Shadow box -->
        <script type="text/javascript" src="lib/shadowbox/shadowbox.js"></script>

        <!-- Swf object -->
        <script type="text/javascript" src="lib/swfobject.js"></script>

        <!-- Sources -->
        <script type="text/javascript" src="js/pusher.js"></script>

        <!-- Initialization -->
        <script type="text/javascript">
            // Swf initialisation
            var swfVersionStr = "10.2.0", // For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection. 
                    xiSwfUrlStr = "lib/playerProductInstall.swf", // To use express install, set to playerProductInstall.swf, otherwise the empty string. 
                    flashvars = {},
                    params = {
                quality: "high",
                bgcolor: "#",
                allowscriptaccess: "sameDomain",
                allowfullscreen: "true"
                        // wmode: "transparent"
            },
            attributes = {
                id: "Wallogram",
                name: "Wallogram",
                align: "middle"
            };
            swfobject.embedSWF("Wallogram.swf", "flashContent", "1024", "768",
                    swfVersionStr, xiSwfUrlStr, flashvars, params, attributes);
            //swfobject.createCSS("#flashContent", "display:block;text-align:left;");// JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.

            // Shadowbox initialisation
            Shadowbox.init({
                autoplayMovies: true,
                slideshowDelay: 3,
                viewportPadding: 40
            });

            // On player join, show play screen
            YUI().use("base", "node", 'wallogram-pusher', function(Y) {         // Fetch dependencies
                var pusher = new 　Y.Wallogram.Pusher({// Init pusher connection
                    screenId: '<?php echo $screenId ?>', // Playfield identifier
                    key: '<?php echo PUSHER_AUTHKEY; ?>'                        // Pusher autentication key
                });

                pusher.on("client-connection", function() {                     // When a clien connects,
                    Y.all(".wallogram-welcomepage").hide();
                    Y.all(".wallogram-playpage").setStyle("height", "auto");    // show play page
                    //Y.all(".wallogram-playpage").show();                      
                });
                //Y.all(".wallogram-playpage").setStyle("height", 0);
            });
        </script>
       
        <!-- Google analytics -->
        <script type="text/javascript">
            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-12224039-1']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script');
                ga.type = 'text/javascript';
                ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(ga, s);
            })();
        </script>
        
    </body>
</html>
