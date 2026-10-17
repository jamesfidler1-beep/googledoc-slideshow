    const pageChannel = new BroadcastChannel('page');
	const vidChannel = new BroadcastChannel('vid');
	const audioChannel = new BroadcastChannel('audio');
	const styleChannel = new BroadcastChannel('style');
	
	function initialiseSlideShow() {
		
		$(".page").text(getCookie("page"));
		
		fetch("config.txt",{cache: "no-store"})
        .then((res) => res.text())
        .then((text) => {
			$(".topbar .start").text($.trim(text))
			try {
				getSlideInfo()
			} catch (exceptionVar) {
			}
			initialiseSlideShow2()
        })
        .catch((e) => console.error(e));
		
	}
	
	function initialiseSlideShow2() {
		
		pageChannel.onmessage = function(e) {
			if ($(".page").text() != e.data && isLocked()) {
				$(".page").text(e.data)
				loadSlide(1)
			}
		};
		
		vidChannel.onmessage = function(e) {
			videoEvent(e.data)
		};
		
		audioChannel.onmessage = function(e) {
			audioEvent(e.data)
		};
		
		styleChannel.onmessage = function(e) {
			$("body").removeClass().addClass("slides").addClass(e.data);
		};
		
		window.onload = displayClock();
		setTimeout(updateClock, 10000); 
		displayClock()
		
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
		 } else if(event.code === 'KeyB') {
			 // pause was pressed
			 console.log("pause")
			 videoPlayPause()
			 playerVideoPlayPause()
			 audioPlayPause()
			 playerAudioPlayPause()
		 }
		});
		console.log("Css = "+$(".content").contents().find("html").find("#contents style").html());
		$('head').append($(".content").contents().find("html").find("#contents style"));		
		loadSlide(1);	

	
	};
	
	function videoEvent(e) {
		playerVideoEvent(e)
	}
	
	function audioEvent(e) {
		playerAudioEvent(e)
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
		  $(this).append("<span class='slideOptions'>"+$(".content").contents().find("html .doc-content > table:eq("+index+") > tbody > tr:eq(0) > td:eq(1)").html()+"</span>");
      });
	}
	
	function getSlideOption(page,optionName) {
		return $(".sinfo > span:eq("+page+") > span.slideOptions span:contains('"+optionName+" ')").text().replace(new RegExp('^' + optionName+' *'),  '');
	}
	
	
	function nextSlidePlease(d) {
	  if ((parseInt($(".page").text())+d>=0) && (parseInt($(".page").text())+d<=$(".content").contents().find("html").find('.doc-content > table').length-1) && ($('.slide1').length==0)) {
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
	  var hour = nn.toLocaleTimeString("en-GB", {hour: '2-digit'});
	  var minute = nn.toLocaleTimeString("en-GB", {hour: '2-digit',minute: '2-digit'}).substring(3);
	  $(".clock .clockvalue").html(hour+"<span class='flash-hard'>:</span>"+minute);
	  
	  if (!(isNaN(pagestart) || isNaN(pagestart))) {
		  
		  endDiff = Math.floor(((nn-pageend)/1000)/60)
		  startDiff = Math.floor(((nn-pagestart)/1000)/60)
		  
		  console.log("nn= "+nn)
		  console.log("startDiff= "+ startDiff);
		  console.log("endDiff= "+ endDiff);
		  $(".tag_this_left").text(-endDiff)
		  if (endDiff>=0) {
			  
			if (getSlideOption(page,"Advance") == "Auto") {
				nextSlidePlease(1)
			}				
			 			  
			if (endDiff<=3) {
			  dc = "dc"+endDiff
			  ed = ""
			} else {
			  dc = "dcn"
			  ed = endDiff
			}
			$(".clock").removeClass("ahead")
			$(".clock").addClass("behind")
			$(".clock").removeClass("dc1 dc2 dc3 dcn")	
			$(".clock").addClass(dc)
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
		page = $(".page").text()
	    if (window.name=="Notes") {
		  type = "1"
		} else {
		    type = "0"
		    tt = getSlideOption(page,"Transition").toLowerCase();
			x = $(".slide0").clone()
			x.addClass('slide1')
			x.removeClass('slide0')
			x.appendTo("body")
			$(".slide0").addClass(tt+d)   
			$(".slide0 .scont").html("")
			if (getSlideOption(page,"Theme") != "") {
				console.log("Slide theme "+getSlideOption(page,"Theme"));
				$(".slide0").removeClass().addClass("slide slide0").addClass(getSlideOption(page,"Theme").toLowerCase());
			}
		}
		
		$(".slide0 .scont").html($(".content").contents().find("html").find('.doc-content > table:eq('+page+') > tbody > tr:eq(1) > td:eq('+type+')').html())
		
		$(".slide0 .scont").html(function(index, oldHtml) {
			return oldHtml.replace(/&lt;!([^\>]*)&gt;/g, "<span class='tag tag_$1'>#ERR#</span>");
		});
		
		if (type=="0") {
			console.log("transition "+tt+d)
			$(".slide0").switchClass(tt+d,tt+"0",1000)
			$(".slide1").switchClass(tt+"0",tt+(-d),1000,function() {$(".slide1").remove()})
		}
		
		
		$(".slide0 .prev").prop("disabled",parseInt(page)==0)
		$(".slide0 .next").prop("disabled",parseInt(page)>$(".content").contents().find("html").find('.doc-content > table').length-2)
		if (isLocked()) {
			pageChannel.postMessage($(".page").text());
		}
		$(".slide0 .scont").find("thead span:textEquals('Widget - Music Player')").each(function( index ) {
			$(this).text("PLAYER")
			t = $( this ).parents('table:eq(0)')
			$(t).replaceWith(createPlayer(t,index));
		});
		if (type=="0") {
			$(".slide0 .scont").find("a").each(function( index ) {
				x = $(this).text()
				$(this).replaceWith(`<video autoplay ><source src='${x}' type='video/mp4'></video>`);
				videoLoadCheck()
			});
			if (getSlideOption(page,"Scale") == "Auto") {
				resize()
			}
		} else {
			$(".content").contents().find("html").find('.doc-content > table:eq('+page+') > tbody > tr:eq(1) > td:eq(0) a').each(function( index ) {
				$(".slide0 .scont").append(createVideoControls($(this).text()))
			});		
		}
		setCookie("page",page,7)
		populateTags()
		displayClock()
	};
	
	function populateTags() {
		page = parseInt($(".page").text())
	    pagestart = new Date($(".sinfo #"+page+" > .start").text())
	    pageend = new Date($(".sinfo #"+page+" > .end").text())
		pes = pageend.toLocaleTimeString("en-GB")
		$(".tag_next_start").text(pes)
		$(".tag_this_len").text($(".sinfo #"+page).contents().not($(".sinfo #"+page).children()).text().trim())
	}
	
	
	function resize() {
		 $(".slide0 .scont").css('scale', "1")
		 $(".slide0 .scont").css('width', "90%")
		 sh = $(".slide0")[0].getBoundingClientRect().height-200
		 sw = $(".slide0")[0].getBoundingClientRect().width*0.9
		 sch = $(".slide0 .scont")[0].getBoundingClientRect().height
		 scw = $(".slide0 .scont")[0].getBoundingClientRect().width
		 sc = sh/sch
		 console.log("Resize info "+sh+" "+sw+" "+sch+" "+scw+" "+sc)
		 scaler(1,sc,scw,0)
	}
	
	function scaler(start,max,width,x) {
		if (x>20) {
			return
		} 
		scaleup = start<max
		if (!scaleup) {
			$(".slide0 .scont").css("position","absolute")
			$(".slide0 .scont").css("top","100px")
			$(".slide0 .scont").css("left","50px")
			$(".slide0 .scont").css("transform-origin","top left");
		}
		$(".slide0 .scont").css('scale', max.toString())
		$(".slide0 .scont").css('width', width*(1/max).toString()+"px")
		sh = $(".slide0")[0].getBoundingClientRect().height-200
		sch = $(".slide0 .scont")[0].getBoundingClientRect().height
		if ((scaleup && sch>sh) || (!scaleup && sch<sh)) {
			console.log("Oversize = "+sh+" "+sch+" "+x)
			mid = (start+max)/2
			$(".slide0 .scont").css('scale', mid.toString())
			$(".slide0 .scont").css('width', width*(1/mid).toString()+"px")
		    sh = $(".slide0")[0].getBoundingClientRect().height-200
		    sch = $(".slide0 .scont")[0].getBoundingClientRect().height
		    if ((scaleup && sch>sh) || (!scaleup && sch<sh)) {
				scaler(start,mid,width,x+1)
			} else {
				scaler(mid,max,width,x+1)
			}				
		} else {
			return
		}
	}
	
	function setStyle() {
		styleChannel.postMessage($(".style").val());
	}

	function setCookie(cname, cvalue, exdays) {
	  const d = new Date();
	  d.setTime(d.getTime() + (exdays*24*60*60*1000));
	  let expires = "expires="+ d.toUTCString();
	  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}
	
	function getCookie(cname) {
		  let name = cname + "=";
		  let decodedCookie = decodeURIComponent(document.cookie);
		  let ca = decodedCookie.split(';');
		  for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
			  c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
			  return c.substring(name.length, c.length);
			}
		  }
		  return "";
	}