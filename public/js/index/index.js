jQuery(function($) {
  'use strict';

  var HomePage;

  HomePage = {
    init: function(){
      HomePage.initActions();
      if(CSS.supports("(shape-outside: polygon(0 0, 100% 0, 70% 100%, 0 100%))")){
        HomePage.initUI();
      }
    },
    initUI: function(){
      $('body .wrapper').addClass('diagonal')
    },
    initActions:function(){
      /* REMOVE BELOW */
      $(".user-settings").hide();
      /* REMOVE ABOVE */
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