jQuery(function($) {
	'use strict';

	var Lobby;

	Lobby = {
        init: function(){
            Lobby.initUI();
            Lobby.initActions();
        },
        initActions: function () {   
            $('#level-name').hide();
            $('#level-name .new-game-validation').hide();
            $('body').on('click','.my-wall .new',function(){
                $( "#level-name" ).dialog({
                    resizable: false,
                    height:210,
                    modal: true,
                    buttons: {
                        "Create": function() {
                            if($('#level-name input').val() != ''){
                                Lobby.newLevel($('#level-name input').val());
                            }else{
                                $('#level-name .new-game-validation').show();
                            }
                        },
                        Cancel: function() {
                          $( this ).dialog( "close" );
                        }
                    }
                });
            })
            $('body').on('click','.wallo-load-levels .delete',function(event){
                event.preventDefault();
                Lobby.deleteLevel($(this).closest('article').attr('id'));
            })
            //Temporary useless function
            // $('body').on('click','.wallo-load-levels .rename',function(event){
            //     event.preventDefault();
            //     var $liLevel = $(this).parent()
            //     Lobby.renameLevel($liLevel)
            // })
            $('body').on('mouseenter','.games .default-games .game',function(){
                $(this).addClass('game-selected')
            })
            $('body').on('mouseleave','.games .default-games .game',function(){
                $(this).removeClass('game-selected')
            })
        }, 
        initUI : function () {
            $('.wallo-load-levels').empty();
            $.getJSON("/levels/getAllLevels", null, function(levels){
                $.each(levels,function(key,value){
                    if(key%4 == 0 || key == 0){
                        $('.wallo-load-levels').append('<div class="row"><article class="col-md-3 level" id="'+value._id+'"><img src="assets/default-game-sample.gif" alt="level thumbnail"/><div class="level-infos"><h5>'+value.name+'</h5><span>3 hours ago</span><div class="buttons"><a href="/screen?level='+value.name+'" class="levelTreatment edit fa fa-pencil-square-o"></a><a href="#" class="levelTreatment delete fa fa-trash"></a></div></div></article></div>')
                    }else{
                        $('.wallo-load-levels .row:last-child').append('<article class="col-md-3 level" id="'+value._id+'"><img src="assets/default-game-sample.gif" alt="level thumbnail"/><div class="level-infos"><h5>'+value.name+'</h5><span>3 hours ago</span><div class="buttons"><a href="/screen?level='+value.name+'" class="levelTreatment edit fa fa-pencil-square-o"></a><a href="#" class="levelTreatment delete fa fa-trash"></a></div></div></article>')
                    }
                    
                })
            })
        },
		newLevel: function(gameName){
            $.getJSON("/levels/new.json", null, function(newLevel){
                newLevel.name = gameName
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
		    // Pop up a confirmation dialog
		    var confirmation = confirm('Are you sure you want to delete this level?');

		    // Check and make sure the user confirmed
		    if (confirmation === true) {
		        // If they did, do our delete
		        $.ajax({
		            type: 'DELETE',
		            url: '/levels/deleteLevel/' + id
		        }).done(function( response ) {

		            // Check for a successful (blank) response
		            if (response.msg === '') {
                        console.log('delete successful')
                        Lobby.initUI();
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
		},
        renameLevel:function($li){
            var levelId = ($li.attr('id'));
            var levelOldName = ($li.children('.name').text());
            $li.children('a.levelTreatment').hide();
            $li.prepend('<span class="renameTreatment"><input type="text" value="'+levelOldName+'" /><a href="#" class="renameOk">ok</a><a href="#" class="renameCancel">&nbsp;cancel</a></span>')
            $li.on('click','.renameOk',function(){
                var newName = $li.children('.renameTreatment').children('input').val();
                // console.log($li.children('.renameTreatment').children('input'))
                console.log("new "+newName)
                $.ajax({
                    type: 'PUT',
                    url: '/levels/renameLevel/' + levelId,
                    data: {name: newName},
                }).done(function( response ) {
                    // Check for a successful (blank) response
                    if (response.msg === '') {
                        console.log('rename successful')
                        Lobby.initUI();
                    }
                    else {
                        alert('Error: ' + response.msg);
                    }
                });
            })
            $li.on('click','.renameCancel',function(){
                $li.children('.renameTreatment').remove()
                $li.children('a.levelTreatment').show();
            })
        }
    }
	Lobby.init();
})