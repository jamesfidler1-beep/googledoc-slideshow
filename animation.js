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
	s = $(t).find(".anim-stage")
	stage = parseInt(s.text())
	stages = parseInt($(t).find(".anim-stages").text())
	if (stage+d>=1 && stage+d<=stages) { 
		s.text(stage+d)
		animationChannel.postMessage($(t).find("tbody:eq("+(stage+d-1)+") span:eq(0)").text());
	}
	updateAnimationControls(t)
}

function clickStage(c) {
	t = $(".animation")
	s = $(t).find(".anim-stage")
	console.log("Click stage "+c.text())
	$(t).find("tbody").each(function( index ) {
	  if (c.is($(this))) {
		  s.text(index+1)
		  animationChannel.postMessage(c.find("span:eq(0)").text());
	  }
	})
	updateAnimationControls(t)
}

function animationProcessEvent(e) {
	cc = $("svg .animationContext").attr('class').replace("animationContext","")
	console.log("APE - "+e+" "+cc)
	
	$("svg .animationContext").switchClass(cc,e,1000)  
}