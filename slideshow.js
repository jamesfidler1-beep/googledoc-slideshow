var slideshow = slideshow || {
	C_BUTTON : "playerbutton",
	C_PLAYER_PLAYBAR : "playbar",
	C_PLAYER_CONTROLS_PREV : "trackprev",
	C_PLAYER_CONTROLS_NEXT : "tracknext",
};

slideshow.pageChannel = new BroadcastChannel('page');
slideshow.styleChannel = new BroadcastChannel('style');

slideshow.init = function() {
	
	$(".page").text(slideshow.getCookie("page"));
		
		fetch("config.txt",{cache: "no-store"})
        .then((res) => res.text())
        .then((text) => {
			console.log("Slideshow Config Loaded")
			$(".topbar .start").text($.trim(text))
			slideshow.getSlideInfo()
			slideshow.initialiseWithConfig()
        })
        .catch((e) => console.error(e));
	console.log("Slideshow Module Initialised")
} 
		
slideshow.initialiseWithConfig = function() {
		
	slideshow.pageChannel.onmessage = function(e) {
		if ($(".page").text() != e.data && isLocked()) {
			$(".page").text(e.data)
			slideshow.loadSlide(1)
		}
	};
	
	slideshow.styleChannel.onmessage = function(e) {
		$(".slide").addClass(e.data);
	};
	
	window.onload = slideshow.displayClock();
	setTimeout(slideshow.updateClock, 10000); 
	slideshow.displayClock()
	
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
		 slideshow.nextSlidePlease(-1)
	 }
	 else if(event.keyCode == 34) {
		 // PageDown was pressed
		 console.log("pagedown")
		 slideshow.nextSlidePlease(1)
	 } else if(event.code === 'KeyB') {
		 // pause was pressed
		 console.log("pause")
		 if (typeof player !== "undefined") {
		 player.videoPlayPause()
		 player.playerVideoPlayPause()
		 player.audioPlayPause()
		 player.playerAudioPlayPause()
		 }
	 }
	});
	console.log("Css = "+$(".content").contents().find("html").find("#contents style").html());
	$('head').append($(".content").contents().find("html").find("#contents style"));		
	slideshow.loadSlide(1);	
};
	
slideshow.nextSlidePlease = function(d) {
	  if (typeof animation === "undefined" || !animation.animationNext(d)) {
		  if ((parseInt($(".page").text())+d>=0) && (parseInt($(".page").text())+d<=$(".content").contents().find("html").find('.doc-content > table').length-1) && ($('.slide1').length==0)) {
			$(".page").text(parseInt($(".page").text())+d)
			slideshow.loadSlide(d)
		  }
	  }
	};
	
slideshow.togglelock = function() {
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
	
slideshow.displayClock = function() {
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
				slideshow.nextSlidePlease(1)
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
	
slideshow.loadSlide = function(d) {
		page = $(".page").text()
	    if (window.name=="Notes") {
		  type = "1"
		} else {
		    type = "0"
		    tt = slideshow.getSlideOption(page,"Transition").toLowerCase();
			x = $(".slide0").clone()
			x.addClass('slide1')
			x.removeClass('slide0')
			x.appendTo("body")
			$(".slide0").removeClass().addClass("slide slide0")
			if (slideshow.getSlideOption(page,"Theme") != "") {
				console.log("Slide theme "+slideshow.getSlideOption(page,"Theme"));
				$(".slide0").addClass(slideshow.getSlideOption(page,"Theme").toLowerCase());
			}
			$(".slide0").addClass(tt+d)   
			$(".slide0 .scont").html("")
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
			slideshow.pageChannel.postMessage($(".page").text());
		}
		
		$(".slide0 .scont").find("span:textEquals('Widget - Music Player')").each(function( index ) {
			if (typeof player !== "undefined") {
				$(this).text("PLAYER")
				t = $( this ).parents('table:eq(0)')
				$(t).replaceWith(player.createPlayer(t,index));
			} else {
				console.error("Player Module not loaded")
			}
		});
		
		
		if (window.name=="Notes") {
			$(".slide0 .scont").find("span:textEquals('Widget - Word Cloud')").each(function( index ) {
				if (typeof wordcloud !== "undefined") {
					$(this).text("WORD CLOUD")
					t = $( this ).parents('table:eq(0)')
					wordcloud.createWordcloudControls(t)
				} else {
					console.error("WordCloud Module not loaded")
				}
			});
		} else {
			$(".slide0 .scont").find("span:textEquals('Widget - Word Cloud')").each(function( index ) {
				if (typeof wordcloud !== "undefined") {
				$(this).replaceWith(wordcloud.createWordCloud());
				wordcloud.initialiseWordCloud();
				} else {
					console.error("WordCloud Module not loaded")
				}
			});
		}
		
		$(".slide0 .scont").find("span:textEquals('Widget - Animation')").each(function( index ) {
			if (typeof animation !== "undefined") {
				t = $( this ).parents('table:eq(0)')
				$(this).text("ANIMATION")
				$(this).addClass("playername")
				animation.createAnimationControls(t)
			}
		});

		if (type=="0") {
			$(".slide0 .scont").find("a").each(function( index ) {
				a = $(this)
				x = a.text()
				if (x.endsWith('.mp4')) {
					$(this).replaceWith(`<video autoplay ><source src='${x}' type='video/mp4'></video>`);
					videoLoadCheck()
				} else if (x.endsWith('.svg')) {
					 console.log("SVG Image found")
					 $.get("/"+x, function(data) {
						  console.log("SVG Image loaded")
						  a.replaceWith($(data).find("svg"));
					 });
				}
			});
			if (slideshow.getSlideOption(page,"Scale") == "Auto") {
				slideshow.resize()
			}
		} else {
			$(".content").contents().find("html").find('.doc-content > table:eq('+page+') > tbody > tr:eq(1) > td:eq(0) a').each(function( index ) {
				x = $(this).text()
				if (x.endsWith('.mp4')) {
					$(".slide0 .scont").append(createVideoControls(x))
				}
			});		
		}
		slideshow.setCookie("page",page,7)
		slideshow.populateTags()
		slideshow.displayClock()
	};
	
slideshow.resize = function () {
	$(".slide0 .scont").css('scale', "1")
	$(".slide0 .scont").css('width', "90%")
	sh = $(".slide0")[0].getBoundingClientRect().height-200
	sw = $(".slide0")[0].getBoundingClientRect().width*0.9
	sch = $(".slide0 .scont")[0].getBoundingClientRect().height
	scw = $(".slide0 .scont")[0].getBoundingClientRect().width
	sc = sh/sch
	console.log("Resize info "+sh+" "+sw+" "+sch+" "+scw+" "+sc)
	slideshow.scaler(1,sc,scw,0)
}	

	
slideshow.scaler = function(start,max,width,x) {
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
			slideshow.scaler(start,mid,width,x+1)
		} else {
			slideshow.scaler(mid,max,width,x+1)
		}				
	} else {
		return
	}
}

	

slideshow.getSlideInfo = function() {
	  $(".sinfo table").html($(".content").contents().find("html .doc-content > table").find("tr:eq(0)").clone())
	  utils.recurse($(".sinfo table"),function(x) {x.attr( "style", "" );x.attr("class","");})
	  console.log("Start Date/Time = #"+$(".start").text()+"#")
	  last_start = Date.parse($(".start").text())
	  last_end = last_start
	  $(".sinfo tr").each(function( index ) {
		  console.log("sinf")
		  tags = $(this).clone()
		  $( this ).attr("id",index)
		  $(this).empty();
		  d = utils.getTagValue(tags,"Slide Duration")
		  if (d!="") {
			last_start = last_end  
			last_start_d = new Date(last_start)
			if (d.includes(":")) {
				console.log("d:="+d)
				e = d.split(':')
				console.log("e="+e)
				l = parseInt(e[0])
				s = parseInt(e[1])
			} else {				
				l = parseInt(d)
				s = 0
			}
			last_end = last_start + ( l*60*1000) + (s*1000)
			last_end_d = new Date(last_end) 
		  } else {
			l=0
			s=0
		  }
		  $(this).append("<td class='name'>"+utils.getTagValue(tags,"Slide Name")+"</td>");
		  $(this).append("<td class='start'>"+last_start_d.toISOString().split('T')[0]+"T"+last_start_d.toLocaleTimeString()+"</td>");
		  $(this).append("<td class='end'>"+last_end_d.toISOString().split('T')[0]+"T"+last_end_d.toLocaleTimeString()+"</td>");
		  $(this).append("<td class='duration'>"+d+"</td>");
		  $(this).append("<td class='disabled'>"+(utils.getTag(tags,"Slide Disabl")=="e")+"</td>");
		  $(this).append("<td class='transition'>"+utils.getTag(tags,"Transition")+"</td>");
		  $(this).append("<td class='theme'>"+utils.getTag(tags,"Theme")+"</td>");
		  $(this).append("<td class='advance'>"+utils.getTag(tags,"Advance")+"</td>");
		  $(this).append("<td class='scale'>"+utils.getTag(tags,"Scale")+"</td>");
      });
	}
	
slideshow.populateTags = function() {
		page = parseInt($(".page").text())
	    pagestart = new Date($(".sinfo #"+page+" > .start").text())
	    pageend = new Date($(".sinfo #"+page+" > .end").text())
		pes = pageend.toLocaleTimeString("en-GB")
		$(".tag_next_start").text(pes)
		$(".tag_this_len").text($(".sinfo #"+page+" .duration").text().trim())
	}
	
slideshow.setCookie = function(cname, cvalue, exdays) {
	  const d = new Date();
	  d.setTime(d.getTime() + (exdays*24*60*60*1000));
	  let expires = "expires="+ d.toUTCString();
	  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

slideshow.getCookie = function(cname) {
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
	
slideshow.getSlideOption = function(page,optionName) {
		console.log("getSlideOption "+page+" on="+optionName.toLowerCase()+" v="+ $(".sinfo tr:eq("+page+") td."+optionName.toLowerCase()).text())
		return $(".sinfo tr:eq("+page+") td."+optionName.toLowerCase()).text();
	}	
	
slideshow.setStyle = function () {
		slideshow.styleChannel.postMessage($(".style").val());
}
	
	
	
var utils = utils || {};

utils.recurse = function(node,f) {
	f($(node))
	$(node).children().each(function( index ) {
	  f($(this))
	  utils.recurse(this,f)
	});
}	 
	
utils.getTag = function(t,name) {
	return $(t).find("span:contains('"+name+"')").text().replace(name,"").trim()
} 

 
utils.getTagValue = function(t,name) {
	return $(t).find("span:contains('"+name+"')").next().text()
}

utils.toTime = function(s) {
        let minutes = Math.floor(s / 60);
        let seconds = Math.floor(s % 60);    
        let formattedMinutes = minutes.toString().padStart(2, '0');
        let formattedSeconds = seconds.toString().padStart(2, '0');
        return formattedMinutes+":"+formattedSeconds;
   }
   
utils.tryModule = function(name,f) {
	try {
		f();
	} catch (e) {
		if (e instanceof ReferenceError) {
		  console.warn("Module "+name+" not found")
		} else {
			raise
		}			
	}
}   