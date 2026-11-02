var player = player || {
	C_PLAYER:"player", 
	C_PLAYER_PAUSED : "playerpaused",
	C_TRACK_POSITION_CONTROL : "trackprogressctl",
	C_TRACK_VOLUME_CONTROL :  "trackvolumectl",
	C_BUTTON_PLAY : "play",
	C_BUTTON_MUTE : "mute",
	C_TRACK_POSITION_DISPLAY : "trackprogress",
	C_TRACK_VOLUME : "trackvolume",
	C_TRACK_ART : "art",
	C_TRACK_TITLE : "title",
    C_TRACK_FILE : "file",
	C_PLAYER_CONTROLS : "trackcontrols",
	C_PLAYER_CONTROLS_TRACK : "tracknum",
	C_PLAYER_OPTIONS : "options",
	
	C_TRACK_LOADED : "loaded", 
	C_TRACK_SELECTED : "selected",
	C_TRACK_PAUSED : "paused",
	C_TRACK_MUTED : "muted",
	
	C_OPTION_AUTOPLAY : "AUTOPLAY ✓",
    C_OPTION_CONTINUE : "CONTINUE ✓",
    C_OPTION_LOOP : "LOOP ✓",
	
	V_PROGRESS_UPDATE_INTERVAL_MS : 100,
	
	BC_DRAG_PROGRESS : "P",
	BC_DRAG_VOLUME : "V",
	
};

player.vidChannel = new BroadcastChannel('vid');
player.audioChannel = new BroadcastChannel('audio');

player.draggingmap = new Map();
player.playingmap = new Map();

player.init = function() {
	
	player.vidChannel.onmessage = function(e) {
		player.playerVideoEvent(e.data)
	};
	
	player.audioChannel.onmessage = function(e) {
		player.playerAudioEvent(e.data)
	};
	
	console.log("Player Module Initialised")
} 

player.createPlayer = function(node,index) {
	utils.recurse(node,function(x) {x.attr( "style", "" );x.attr("class","");})
	$(node).addClass(player.C_PLAYER+" "+player.C_PLAYER_PAUSED);
	$(node).find("tbody").each(function(){ 
    if( $(this).contents().length == 0 )
        $(this).remove(); 
    });
	$(node).find("tbody tr").each(function( track ) {
			let controlshtml = "<tr class='"+slideshow.C_PLAYER_PLAYBAR+" "+player.C_TRACK_POSITION_CONTROL+"'><td><div class='"+slideshow.C_BUTTON+" "+player.C_BUTTON_PLAY+"' id='i_"+index+"_"+track+"' onclick='player.playPause("+index+","+track+")'></div><span class='"+player.C_TRACK_POSITION_DISPLAY+"'></span></td><td colspan=4><div><input type='range' min='0' max='1000' value='0' onmousedown='player.progressMouseDown("+index+","+track+")' onmouseup='player.progressMouseUp("+index+","+track+")' onmousemove='player.progressMouseMove("+index+","+track+")'></div></td></tr>"+
	           "<tr class='"+slideshow.C_PLAYER_PLAYBAR+" "+player.C_TRACK_VOLUME_CONTROL+"'><td><div class='"+slideshow.C_BUTTON+" "+player.C_BUTTON_MUTE+"' onclick='player.mute("+index+","+track+")'></div><span class='"+player.C_TRACK_VOLUME+"'></span></td><td colspan=4><div><input type='range' min='0' max='1000' value='500'  onmousedown='player.volumeMouseDown("+index+","+track+")' onmouseup='player.volumeMouseUp("+index+","+track+")' onmousemove='player.volumeMouseMove("+index+","+track+")'></div></td></tr>"
			let trackhtml = "<tbody><tr><td class='"+player.C_TRACK_ART+"'>"+$(this).find("td:eq(0)").html()+"<div class='"+slideshow.C_BUTTON+" "+player.C_BUTTON_PLAY+"' id='i_"+index+"_"+track+"' onclick='playPause("+index+","+track+")'></td><td colspan=4 class='"+player.C_TRACK_TITLE+"'>"+$(this).find("td:eq(1)").html()+"</td><td class='"+player.C_TRACK_FILE+"'><audio src=\""+$(this).find("td:eq(2) span").text()+"\" onloadeddata='player.audioLoaded("+index+","+track+")'/></td></tr>"+controlshtml+"</tbody>"
			$(node).append($(trackhtml));
	});
	$(node).find("tbody:eq(0)").remove();
	$(node).find("tbody").addClass(player.C_TRACK_PAUSED)
	$(node).find("thead tr").append("<td class='"+player.C_PLAYER_CONTROLS_TRACK+"'>0</td><td class='"+player.C_PLAYER_CONTROLS+"'><div class='"+player.C_BUTTON+" "+slideshow.C_PLAYER_CONTROLS_PREV+"' onclick='newTrack("+index+",-1)'></div><div class='"+slideshow.C_BUTTON+" "+slideshow.C_PLAYER_CONTROLS_NEXT+"' onclick='newTrack("+index+",1)'></div></td>")
	$(node).find("thead td:eq(2)").addClass(player.C_PLAYER_OPTIONS)
	player.loadTrack(node,index)
	return node
}

player.getAudio = function(index,track) {
	return player.getPlayerTrack(index,track).find("audio:eq(0)")[0]
}

player.loadTrack = function(node,index) {  
	    $(node).find("tbody").removeClass(player.C_TRACK_SELECTED)
		let track = $(node).find('.'+player.C_PLAYER_CONTROLS_TRACK).text()
		let p = $(node).find("tbody:eq("+track+")")
		$(p).addClass(player.C_TRACK_SELECTED);
		if (parseInt($(node).find('.'+player.C_PLAYER_CONTROLS_TRACK).text())==0) {
			$(node).find("."+slideshow.C_PLAYER_CONTROLS_PREV).addClass(player.C_BUTTON_DISABLED)
		} else {
			$(node).find("."+slideshow.C_PLAYER_CONTROLS_PREV).removeClass(player.C_BUTTON_DISABLED)
	    }
		if (parseInt($(node).find('.'+player.C_PLAYER_CONTROLS_TRACK).text())==$(node).find("tbody").length-1) {
			$(node).find("."+slideshow.C_PLAYER_CONTROLS_NEXT).addClass(player.C_BUTTON_DISABLED)
		} else {
			$(node).find("."+slideshow.C_PLAYER_CONTROLS_NEXT).removeClass(player.C_BUTTON_DISABLED)
	    }
   }
   
   
player.audioLoaded = function(index,track) {
	   //console.log("Track loaded "+index+" "+track);
	   let p = player.getPlayerTrack(index,track)
	   $(p).addClass(player.C_TRACK_LOADED)
	   player.updatePlayerControls(index,track)
	   //console.log("Options = "+getOptions(index).toUpperCase()+" "+$(p).hasClass(TRACK_SELECTED))
	   if ($(p).hasClass(player.C_TRACK_SELECTED) && player.getOptions(index).toUpperCase().includes(player.C_OPTION_AUTOPLAY)) {
	     player.playPause(index,track)
	   }
   }

player.playPause = function(index,track) {
      let a = player.getAudio(index,track)
	  let p = player.getPlayerTrack(index,track)
	  if (a.paused)  {
		a.play();
		p.removeClass(player.C_TRACK_PAUSED)
		player.playing(index,track)
	  } else {
		a.pause();
		p.addClass(player.C_TRACK_PAUSED)
		player.stopping(index,track);
	  }
	  player.checkAllPaused(index)
   }

	
player.getPlayerTrack = function(index,track) {
	   return $("table."+player.C_PLAYER+":eq("+index+") tbody:eq("+track+")")
   }
   
player.getDraggingMapKey = function(index,track) {
     return index+":"+track
}	
   
player.updatePlayerControls = function(index,track) {
	 let a = player.getAudio(index,track)
	 let p = player.getPlayerTrack(index,track)
	 if (player.draggingmap.get(player.getDraggingMapKey(index,track)) == undefined ) {
		if (a.paused && !isNaN(a.duration))  {
			p.addClass(player.C_TRACK_PAUSED)
			player.stopping(index,track)
			if (a.paused && a.currentTime==a.duration && player.getOptions(index).toUpperCase().includes(player.C_OPTION_CONTINUE)) {
			   a.currentTime=0
			   let nt = newTrack(index,1)
			   if (nt != undefined) {
				  player.playPause(index,nt)
			   }
			}
			player.checkAllPaused(index)
		}
		p.find("."+player.C_TRACK_POSITION_CONTROL+" input").val((a.currentTime/a.duration)*1000)
		//console.log(a.src+" "+toTime(a.currentTime)+" / "+toTime(a.duration)+" "+JSON.stringify(playingmap,(key, value) => (value instanceof Map ? [...value] : value)))
	 }
	 if (!isNaN(a.duration)) {
	   player.setVolume(index,track)
	   p.find("."+player.C_TRACK_POSITION_DISPLAY).text(utils.toTime(a.currentTime)+" / "+utils.toTime(a.duration))
	 }
   }
   
player.playing = function(index,track)  {
	   if (player.playingmap.get(player.getDraggingMapKey(index,track)) == undefined) {
		    //console.log("Adding "+getDraggingMapKey(index,track)+" to playing")
		    let i = setInterval(player.updatePlayerControls, player.V_PROGRESS_UPDATE_INTERVAL_MS,index,track)
			player.playingmap.set(player.getDraggingMapKey(index,track),i);
			//console.log("playing "+playingmap.get(getDraggingMapKey(index,track)))
	   }
   }
   

player.stopping = function(index,track) {
	   //console.log("stopping "+playingmap.get(getDraggingMapKey(index,track)))
	   clearInterval(player.playingmap.get(player.getDraggingMapKey(index,track)));
	   player.playingmap.delete(player.getDraggingMapKey(index,track))
	   //console.log("Removed "+getDraggingMapKey(index,track)+" from playing")
   }
   
player.checkAllPaused = function(index) {
	   if (player.playingmap.size==0) {
		  //console.log("Paused");
		   player.getPlayerRow(index).addClass(player.C_PLAYER_PAUSED)
	  } else {
		  //console.log("Playing");
		  player.getPlayerRow(index).removeClass(player.C_PLAYER_PAUSED)
	  }
   }
   
player.getPlayerRow = function (index) {
	   return $("table."+player.C_PLAYER+":eq("+index+")")
   }

player.setVolume = function(index,track) {
	  let a = player.getAudio(index,track)
	  let p = player.getPlayerTrack(index,track)
	  let v = 0
	  if (!p.hasClass( player.C_TRACK_MUTED)) {
		v = p.find("."+player.C_TRACK_VOLUME_CONTROL+" input").val()
	  }
	  if (!isNaN(a.volume)) {
		a.volume = (v/1000)
		p.find("."+player.C_TRACK_VOLUME).text(Math.floor(v/10))
	  }
   }
   
player.getOptions = function(index) {
		o = player.getPlayerRow(index).find("."+player.C_PLAYER_OPTIONS).text();
		console.log("Options "+o);
		return o;
	}
	
	
	   
player.progressMouseDown = function(index,track) {
	   player.draggingmap.set(player.getDraggingMapKey(index,track),player.BC_DRAG_PROGRESS)
   }
   
player.progressMouseUp = function(index,track) {
	   player.draggingmap.delete(player.getDraggingMapKey(index,track))
	   player.setProgressFromBar(index,track)
   }
   
player.progressMouseMove = function(index,track) {
	   if (player.draggingmap.get(player.getDraggingMapKey(index,track)) == player.BC_DRAG_PROGRESS ) {
		   player.setProgressFromBar(index,track)
	   }
   }
   
player.volumeMouseDown = function(index,track) {
	   player.draggingmap.set(player.getDraggingMapKey(index,track),player.BC_DRAG_VOLUME)
   }
   
player.volumeMouseUp = function(index,track) {
	   player.draggingmap.delete(player.getDraggingMapKey(index,track))
	   player.setVolume(index,track)
   }
   
player.volumeMouseMove = function(index,track) {
	   if (player.draggingmap.get(player.getDraggingMapKey(index,track)) == player.BC_DRAG_VOLUME ) {
		   player.setVolume(index,track)
	   }
   }
     
player.setProgressFromBar = function(index,track) {
	  let a = player.getAudio(index,track)
	  let p = player.getPlayerTrack(index,track)
	  let v = p.find("."+player.C_TRACK_POSITION_CONTROL+" input").val()
	  if (!isNaN(a.duration)) {
		a.currentTime = (v/1000)*a.duration
		p.find("."+player.C_TRACK_POSITION_DISPLAY).text(utils.toTime(a.currentTime)+" / "+utils.toTime(a.duration))
	  }
   }
   
   
player.mute = function(index,track) {
		let p = player.getPlayerTrack(index,track)
		if (p.hasClass( player.C_TRACK_MUTED)) {
			p.removeClass(player.C_TRACK_MUTED)
		} else {
			p.addClass(player.C_TRACK_MUTED)
		}
		player.setVolume(index,track) 
   }
   
   

player.playerAudioPlayPause = function() {
	player.audioChannel.postMessage("AP");
}

player.audioPlayPause = function() {
	$(".player .selected .play:eq(0)").each(function( index ) {
		 e = $(this).attr('id')
		 f = e.split("_")
		player.playPause(f[1],f[2])
	})
}  

player.playerAudioEvent = function(e) {
	console.log("Audio Event "+e)
	if (e.startsWith("AP")) {
		player.audioPlayPause()
	}
} 

   
//########################################


 player.playerVideoEvent = function(e) {
	console.log("Video Event "+e)
	if (e.startsWith("VL")) {
		$("tbody").addClass(TRACK_SELECTED+" "+TRACK_LOADED);
		p = e.split(":")
		player.updateVideoControls(parseFloat(p[1]),parseFloat(p[2]),p[3])
	} else if (e=="VP") {
		player.playerVideoPlayPause()
	} else if (e=="VS") {
		player.videoStopping()
	} else if (e.startsWith("VSK")) {
		$("video").each(function( index ) {
			p = e.split(":")
			sk = ""+(this.duration * parseFloat(p[1]))
			console.log("Seek #"+sk+"#")
			this.currentTime = sk
			if (this.paused) {
					pau = "PA"
			} else {
					pau="PL"
			}
			player.vidChannel.postMessage("VL:"+this.currentTime+":"+this.duration+":"+pau);
		})
	} else if (e.startsWith("VV")) {
		$("video").each(function( index ) {
			p = e.split(":")
			console.log("Volume "+parseFloat(p[1]))
			this.volume = parseFloat(p[1])
		})
	}
  }

   
player.videoPlayPause = function() {
	player.vidChannel.postMessage("VP");
}   


player.playerVideoPlayPause = function() {
		$("video").each(function( index ) {
			if (this.paused) {
				this.play()
				player.videoPlaying()
			} else {
				this.pause()	
			}
		})
   }