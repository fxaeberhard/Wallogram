jQuery(function($) {
  'use strict';

  var Navigation;

  Navigation = {
    init: function(){
      Navigation.initActions();
    },
    initActions:function(){
      $('body').on('click','.nav-container-left .buttons a:first-child',function(){
          $('.nav-container-left nav').toggle()
          $('.nav-container-left .buttons a:first-child i').toggle()
      })
      $('body').on('click','.nav-container-right a.toggle-settings',function(){
          $('.nav-container-right .user-settings ul').toggle()
          $('.nav-container-right a.toggle-settings i').toggle()
      })
      if($.cookie('wallolocale') == "en"){
        $('.english').addClass('current-language')
      }else{
        $('.french').addClass('current-language')
      }
    }
  }

  Navigation.init()

})