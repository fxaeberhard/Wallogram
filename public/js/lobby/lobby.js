jQuery(function($) {
	'use strict';

	var Lobby;

	Lobby = {
		init: function(){
			$.getJSON("/levels/getAllLevels", null, function(levels){
				$.each(levels,function(key,value){
					console.log(value.name)
					$('.wallo-load-levels ul').append('<li><a href="/screen?level='+value.name+'">'+value.name+'</a></li>')
				})
			})
			$('.levelName').hide();
			$('body').on('click','#newLevel',function(){
				$('.levelName').show()
			})
			$('body').on('click','.levelName button',function(){
				if($('.levelName input').val() != ''){
					Lobby.newLevel();
				}else{
					alert('insert a name')
				}
			})
		},
		newLevel: function(){
			$.getJSON("/levels/new.json", null, function(newLevel){
				newLevel.name = $('.levelName input').val()
				$.ajax({
          type: 'POST',
          data: JSON.stringify(newLevel),
          url: '/levels/addLevel',
          dataType: 'JSON',
          contentType: 'application/json'
        }).done(function( response ) {
          // Check for successful (blank) response
          if (response.msg === '') {
            console.log('It seems that the party is created and stored')
            window.location.replace("/screen?level="+newLevel.name);
          }
          else {
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);
          }
        });
			})
		}
	}

	Lobby.init();
})