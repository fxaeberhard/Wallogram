jQuery(function($) {
	'use strict';

	var Lobby;

	Lobby = {
		init: function(){
			$.getJSON("/levels/getAllLevels", null, function(levels){
				$.each(levels,function(key,value){
					console.log(value.name)
					$('.wallo-load-levels ul').append('<li><a href="/screen?level='+value.name+'">'+value.name+'</a><a href="#" id="'+value._id+'" class="delete">&nbsp;delete</a></li>')
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
            $('body').on('click','.wallo-load-levels .delete',function(event){
                event.preventDefault();
                Lobby.deleteLevel($(this).attr('id'));
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
		},
		deleteLevel: function(id){
            console.log('test')
		    // Pop up a confirmation dialog
		    var confirmation = confirm('Are you sure you want to delete this user?');

		    // Check and make sure the user confirmed
		    if (confirmation === true) {
		        // If they did, do our delete
		        $.ajax({
		            type: 'DELETE',
		            url: '/levels/deleteLevel/' + id
		        }).done(function( response ) {

		            // Check for a successful (blank) response
		            if (response.msg === '') {
		            }
		            else {
		                alert('Error: ' + response.msg);
		            }
		        });
		    }
		    else {
		        // If they said no to the confirm, do nothing
		        return false;
		    }
		}
	}

	Lobby.init();
})