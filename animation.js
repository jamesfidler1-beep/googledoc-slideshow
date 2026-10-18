function createAnimationControls(t) {
	recurse(t,function(x) {x.attr( "style", "" );x.attr("class","");})
	$(t).addClass("player animation")
	$(t).prepend("<thead></thead>")
	$(t).find("tbody tr:eq(0)").prependTo($(t).find("thead"))
	$(t).find("thead tr td:eq(0)").addClass("playername")
	$(t).find("tbody tr").removeClass().wrap('<tbody></tbody>')
	$(t).find("tbody>tbody").appendTo($(t))
	$(t).find("tbody:eq(0)").remove()
	$(t).find("thead tr:eq(0) td:eq(1)").append("<div class='"+BUTTON+" "+PLAYER_CONTROLS_PREV+"' onclick='newStage(-1)'></div><div class='"+BUTTON+"' style='background-image:none; overflow: auto;'><span class='anim-stage'>1</span><span>/</span><span class='anim-stages'>"+$(t).find("tbody").length+"</span></div><div class='"+BUTTON+" "+PLAYER_CONTROLS_NEXT+"' onclick='newStage(1)'></div>")
    $(t).find("tbody").on("click", function(){clickStage($(this))})
	newStage(0)
	updateAnimationControls(t)
}

function updateAnimationControls(t) {
   stage = parseInt($(t).find(".anim-stage").text())
   console.log("Anim stage = "+stage)
   $(t).find("tbody").each(function( index ) {
		$(this).removeClass().addClass("loaded")
		if (index==(stage-1)) {
			$(this).addClass("selected")
		}
   })
}

function newStage(d) {
	t = $(".animation")
	r = false
	if (t.length>0) {
		s = $(t).find(".anim-stage")
		stage = parseInt(s.text())
		stages = parseInt($(t).find(".anim-stages").text())
		if (stage+d>=1 && stage+d<=stages) { 
			s.text(stage+d)
			info = ""
			console.log("New stage "+(stage+d))
			  if (stage+d==1) {
				info = " start"
			  } else if (stage+d==stages) {
				info = " end"
			  }
			animationChannel.postMessage($(t).find("tbody:eq("+(stage+d-1)+") span:eq(0)").text()+info);
			r = true
		}
		updateAnimationControls(t)
	}
	return r;
}

function clickStage(c) {
	t = $(".animation")
	s = $(t).find(".anim-stage")
	stages = parseInt($(t).find(".anim-stages").text())
	console.log("Click stage "+c.text())
	$(t).find("tbody").each(function( index ) {
	  if (c.is($(this))) {
		  s.text(index+1)
		  info = ""
		  if (index==0) {
			info = " start"
		  } else if (index==(stages-1)) {
			info = " end"
		  }
		  animationChannel.postMessage(c.find("span:eq(0)").text()+info);
	  }
	})
	updateAnimationControls(t)
}

function animationProcessEvent(e) {
	console.log("animationProcessEvent "+e)
	if ($("svg .animationContext").length>0) { 
		$("svg .animationContext").removeClass().addClass("animationContext "+e)
	} else {
		newStage(e)
	}		
}

function animationNext(d) {
	console.log("AnimationNext "+d)
	if (newStage(d)) {
		console.log("AnimationNext newStage")
		return true;
	}
	if ($("svg .animationContext").length>0) {
		console.log("AnimationNext d="+d+" sc="+$("svg .animationContext.start").length+" ec="+$("svg .animationContext.start").length)
		if (($("svg .animationContext.start").length==0 && d==-1) || ($("svg .animationContext.end").length==0 && d==1)) {
			animationChannel.postMessage(d)
			return true;
		}
	}
	
	return false;
}