$(function() {
  /************** плавный скролл до якоря ****************/
  $("a[href^='#']").click(function(){
    var _href = $(this).attr("href");
    
    $("html, body").animate({scrollTop: $(_href).offset().top+"px"}, 1500);
    return false;
  });
  
  /************** фиксированное мини-меню при скроле ****************/
  
  function miniMenu(scroll) {
    var scroll = scroll || $(document).scrollTop()
      , topHeightHide = 90;
      
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
      , scroll = scroll || $(document).scrollTop()
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
  
  activeSectionMenuScroll();
  
  /************** скролл события ****************/
  
  var counter = 0;
  
  $(window).scroll(function() {
    var scroll = $(document).scrollTop();
  
    miniMenu(scroll);
  
    const interval = setTimeout(function () { //нужно для сокращения количества запросов (экономия памяти)
      activeSectionMenuScroll(scroll);
      
      counter = 0;
    }, 120);
  
    counter++;
    
    if (counter > 1) {
      clearInterval(interval);
    }
  });
  
  
  /************** Validate form ****************/
  
  //https://github.com/cferdinandi/validate
  validate.init({
    selector: '[data-validate]',
    disableSubmit: true,
    onSubmit: function (form, fields) {
      alert('Form submitted successfully!');
      console.log('Data for PHP:', form, fields);
    },
  });

  /************** Animation ****************/
  new WOW().init();
  
 
});
