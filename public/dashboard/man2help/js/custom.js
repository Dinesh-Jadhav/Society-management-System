/*back to top */
$(document).ready(function(){
	$("#scroll-up").hide();
	$(function () {
		$(window).scroll(function(){
		if ($(window).scrollTop()>50){
		$("#scroll-up").fadeIn(1500);
		}
		else
		{
		$("#scroll-up").fadeOut(1500);
		}
		});
		
		$("#scroll-up").click(function(){
		$('body,html').animate({scrollTop:0},500);
		return false;
		});
		});	
		
		$(".select").selectbox();
		
	var owl = $("#home-slider");

      owl.owlCarousel({
        navigation : false,
        singleItem : true,
		autoPlay: 5000,
		pagination : false,
        transitionStyle : "fade",
        touchDrag:false,
        mouseDrag: false
      });

	
		});


				
		