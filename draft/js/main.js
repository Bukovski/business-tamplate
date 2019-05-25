$(function() {
  /************** плавный скролл до якоря ****************/
  $("a[href^='#']").click(function(){
    var _href = $(this).attr("href");
    
    $("html, body").animate({scrollTop: $(_href).offset().top+"px"});
    return false;
  });
  
  /************** фиксированное мини-меню при скроле ****************/
  
  function miniMenu(scroll) {
    var topHeightHide = 90;

    if (scroll > topHeightHide) {
      $('.header__main').addClass('header__main--fixed');
    } else {
      $('.header__main').removeClass('header__main--fixed');
    }
  }
  
  miniMenu();
  
  /************** подсветка активных пунктов меню при скроле ****************/

  function activeSectionMenuScroll(scroll) {
    var sections = $('section, header')
      , nav = $('nav')
      , navHeight = nav.outerHeight();

    sections.each(function () {
      var topSection = $(this).offset().top - navHeight
        , bottomSection = topSection + $(this).outerHeight();
  
      if (scroll >= topSection && scroll <= bottomSection) {
        nav.find('li').removeClass('header__item--active');
        nav.find('a[href="#' + $(this).attr('id') + '"]').parent().addClass('header__item--active');
      }
    });
  }
  
  $(window).scroll(function() {
    var scroll = $(document).scrollTop();
  
    miniMenu(scroll);
    activeSectionMenuScroll(scroll)
  });
});
