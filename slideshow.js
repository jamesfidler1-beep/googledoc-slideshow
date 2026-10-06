    const pageChannel = new BroadcastChannel('page');
	const vidChannel = new BroadcastChannel('vid');
	const styleChannel = new BroadcastChannel('style');
	
	function initialiseSlideShow() {
		
		fetch("config.txt",{cache: "no-store"})
        .then((res) => res.text())
        .then((text) => {
			$(".start").text($.trim(text))
			getSlideInfo()
        })
        .catch((e) => console.error(e));
		
	
		pageChannel.onmessage = function(e) {
			if ($(".page").text() != e.data && isLocked()) {
				$(".page").text(e.data)
				loadSlide(1)
			}
		};
		
		vidChannel.onmessage = function(e) {
			videoEvent(e.data)
		};
		
		styleChannel.onmessage = function(e) {
			$("body").removeClass().addClass("slides").addClass(e.data);
		};
		
		window.onload = displayClock();
		setTimeout(updateClock, 10000); 
		
		if (window.name!="Notes") {
			document.title = "The Pearl - Slideshow"
			window.open(window.location, 'Notes','',true);
			$(".lock").hide()
			$("body").addClass("slides")
		} else {
			document.title = "The Pearl - Notes"
			$("body").addClass("notes")
		}
		
		$.expr[':'].textEquals = $.expr.createPseudo(function(arg) {
		return function( elem ) {
			return $(elem).text().match("^" + arg + "$");
		};
		});
		
		document.addEventListener('keydown', function(event) {
		 if(event.keyCode == 33) {
			 // PageUp was pressed
			 nextSlidePlease(-1)
		 }
		 else if(event.keyCode == 34) {
			 // PageDown was pressed
			 console.log("pagedown")
			 nextSlidePlease(1)
		 }
		});
		
		
		
		loadSlide(1)
		console.log("Css = "+$(".content").contents().find("html").find("#contents style").html())
		$('head').append($(".content").contents().find("html").find("#contents style"))
	
	};
	
	function videoEvent(e) {
		playerVideoEvent(e)
	}
	
	function getSlideInfo() {
	  $(".sinfo").html($(".content").contents().find("html .doc-content > table").find("tr:eq(0) > td:eq(0) > p > span"))
	  console.log("Start Date/Time = #"+$(".start").text()+"#")
	  p = Date.parse($(".start").text())
	  $(".sinfo span").each(function( index ) {
		  $( this ).attr("id",index)
		  console.log("Slide time = "+new Date(p))
		  l = parseInt($(this).text())
		  console.log("Slide length = "+l)
		  pp = new Date(p)
		  $(this).append("<span class='start'>"+pp.toISOString().split('T')[0]+"T"+pp.toLocaleTimeString()+"</span>");
		  p = p + ( l*60*1000)
		  pp = new Date(p)
		  $(this).append("<span class='end'>"+pp.toISOString().split('T')[0]+"T"+pp.toLocaleTimeString()+"</span>");
      });
	}
	
	function nextSlidePlease(d) {
	  if ((parseInt($(".page").text())+d>=0) && (parseInt($(".page").text())+d<=$(".content").contents().find("html").find('.doc-content > table').length-1) && (!$('#slide0').is(':animated'))) {
		$(".page").text(parseInt($(".page").text())+d)
		loadSlide(d)
	  }
	};
	
	function toggleLock() {
		l = $(".lock")
		console.log("lock="+l.attr("value"));
		if (isLocked()) {
			l.attr("value","unlocked")
			l.removeClass("locked").addClass("unlocked");			
		} else {
			l.attr("value","locked")
			l.removeClass("unlocked").addClass("locked");
		}
	};
	
	function isLocked() {
	  return $(".lock").attr("value") != "unlocked"
	}
	
	function updateClock() {
		displayClock();
		setTimeout(updateClock, 10000); 
	}
	
	function displayClock(){
	  page = parseInt($(".page").text())
	  pagestart = Date.parse($(".sinfo #"+page+" > .start").text())
	  pageend = Date.parse($(".sinfo #"+page+" > .end").text())
	  
	  console.log("Current page = "+page)
      console.log("Current page start = "+new Date(pagestart))	
	  console.log("Current page end= "+new Date(pageend))	
	  
	  nn = new Date()
	  var display = nn.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
	  $(".clock .clockvalue").text(display);
	  
	  if (!(isNaN(pagestart) || isNaN(pagestart))) {
		  
		  endDiff = Math.floor(((nn-pageend)/1000)/60)
		  startDiff = Math.floor(((nn-pagestart)/1000)/60)
		  
		  console.log("nn= "+nn)
		  console.log("startDiff= "+ startDiff);
		  console.log("endDiff= "+ endDiff);
		  if (endDiff>=0) {
			if (endDiff<=3) {
			  dc = "dc"+endDiff
			  ed = ""
			} else {
			  dc = "dcn"
			  ed = endDiff
			}
			$(".clock").removeClass("ahead")
			$(".clock").addClass("behind")
			$(".clock .clocksuffix").text(ed);
			$(".clock .clocksuffix").removeClass("dc1 dc2 dc3 dcn")
			$(".clock .clocksuffix").addClass("active "+dc)
			$(".clock .clockprefix").text("");
			$(".clock .clockprefix").removeClass("active")
		  } else {
			$(".clock .clocksuffix").text("");  
			$(".clock .clocksuffix").removeClass("active")
			if (startDiff<0) {
				if (startDiff>=-3) {
					dc = "dc"+(-startDiff)
					ed = ""
				} else {
					dc = "dcn"
					ed = -startDiff
				}
				$(".clock").removeClass("behind")
				$(".clock").addClass("ahead")
				$(".clock .clockprefix").text(ed);
				$(".clock .clockprefix").removeClass("dc1 dc2 dc3 dcn")
				$(".clock .clockprefix").addClass("active "+dc)
			} else {
				$(".clock").removeClass("ahead")
				$(".clock").removeClass("behind")
				$(".clock .clockprefix").text("");
				$(".clock .clockprefix").removeClass("active")
			}
		  }
	  }
	 
	}
	
	
	function loadSlide(d) {
		
	    if (window.name=="Notes") {
		  type = "1"
		} else {
		  type = "0"
		    tt = "fade"
			x = $("#slide0").clone()
			x.prop('id', 'slide1' )
			x.appendTo("body")
			$("#slide0").addClass(tt+d)   
			$("#slide0 .scont").html("")
			$("#slide0").switchClass(tt+d,tt+"0",1000)
			$("#slide1").switchClass(tt+"0",tt+(-d),1000,function() {$("#slide1").remove()})
		}
		
		$("#slide0 .scont").html($(".content").contents().find("html").find('.doc-content > table:eq('+$(".page").text()+') > tbody > tr:eq(1) > td:eq('+type+')').html())
		$("#slide0 .prev").prop("disabled",parseInt($(".page").text())==0)
		$("#slide0 .next").prop("disabled",parseInt($(".page").text())>$(".content").contents().find("html").find('.doc-content > table').length-2)
		if (isLocked()) {
			pageChannel.postMessage($(".page").text());
		}
		$("#slide0 .scont").find("thead span:textEquals(PLAYER)").each(function( index ) {
			t = $( this ).parents('table:eq(0)')
			$(t).replaceWith(createPlayer(t,index));
		});
		if (type=="0") {
			$("#slide0 .scont").find("a").each(function( index ) {
				x = $(this).text()
				$(this).replaceWith(`<video autoplay ><source src='${x}' type='video/mp4'></video>`);
				videoLoadCheck()
			});
		} else {
			$(".content").contents().find("html").find('.doc-content > table:eq('+$(".page").text()+') > tbody > tr:eq(1) > td:eq(0) a').each(function( index ) {
				$("#slide0 .scont").append(createVideoControls($(this).text()))
			});		
		}
		displayClock()
	};
	
	function setStyle() {
		styleChannel.postMessage($(".style").val());
	}
	
	
	