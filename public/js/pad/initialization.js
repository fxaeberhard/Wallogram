jQuery(function($) {
    $.IO.init();                                                    // Init socket.io
    $.IO.gameId = $.urlParam("gameId");

    YUI().use('event-resize', 'event-gestures', 'widget', "json",
        'widget-position', 'widget-position-align', 'array-extras',
        'wallogram-pad', function(Y) {                              // Fetch dependencies
            var pad = new Y.Wallogram.Pad().render();               // Init pad;

            $.IO.emit('playerJoinGame', {
                playerName: 'anon'
            });                                                     // Send the gameId and playerName to the server
            $.IO.on('colorAssigned',function(msg){                  // Set pad's backgroud color with the player's color
                $('body').css('background-color','#'+msg)
				$('body .pad-button').css('background-color','#'+msg)
            })
            $.IO.on('complete',function(msg){                       // Do something when all the colors are already assigned... But we need to define it :-)
                $('body').css('opacity',0.1)
                alert(msg)
            })
        });
}($));