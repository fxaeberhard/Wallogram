jQuery(function($) {
  'use strict';

  var HomePage;

  HomePage = {
    init: function(){
      HomePage.initActions();
    },
    initActions:function(){
      $('body .game img').hide();
      $('#choose-img').fadeOut(3000,function(){});
      $('body').on('mouseenter','.game',function(){
        $(this).children().children('img').show()
      })
      $('body').on('mouseleave','.game',function(){
        $(this).children().children('img').hide()
      })
    }
  }

  HomePage.init()

})