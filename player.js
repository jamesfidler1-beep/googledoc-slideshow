  const playingmap = new Map();
  const draggingmap = new Map();
  
  const PLAYER = "player"
  const PLAYER_PAUSED = "playerpaused"
  const PLAYER_CONTROLS = "trackcontrols"
  const PLAYER_CONTROLS_TRACK = "tracknum"
  const PLAYER_CONTROLS_PREV = "trackprev"
  const PLAYER_CONTROLS_NEXT = "tracknext"
  const PLAYER_CONTROLS_START = "trackstart"
  const PLAYER_CONTROLS_END = "trackend"
  const PLAYER_OPTIONS = "options"
  
  const PLAYER_PLAYBAR = "playbar"
  
  const TRACK_LOADED = "loaded" 
  const TRACK_SELECTED = "selected"
  const TRACK_PAUSED = "paused"
  const TRACK_MUTED = "muted"
  
  const TRACK_VOLUME = "trackvolume"
  const TRACK_VOLUME_CONTROL = "trackvolumectl"
  const TRACK_POSITION_DISPLAY = "trackprogress"
  const TRACK_POSITION_CONTROL = "trackprogressctl"
  const TRACK_TITLE = "title"
  const TRACK_FILE = "file"
  const TRACK_ART = "art"
  
  const OPTION_AUTOPLAY = "A"
  const OPTION_CONTINUE = "C"
  const OPTION_LOOP = "L"
  
  const BUTTON = "playerbutton"
  const BUTTON_PLAY = "play"
  const BUTTON_MUTE = "mute"
  const BUTTON_DISABLED = "disabled"
  
  const DRAG_PROGRESS = "P"
  const DRAG_VOLUME = "V"
  
  const PROGRESS_UPDATE_INTERVAL_MS = 100
	
	
  function recurse(node,f) {
	f($(node))
	$(node).children().each(function( index ) {
	  f($(this))
	  recurse(this,f)
	});
  }	  
	
  function createPlayer(node,index) {
	recurse(node,function(x) {x.attr( "style", "" );x.attr("class","");})
	$(node).addClass(PLAYER+" "+PLAYER_PAUSED);
	$(node).find("tbody").each(function(){ 
    if( $(this).contents().length == 0 )
        $(this).remove(); 
    });
	$(node).find("tbody tr").each(function( track ) {
			let controlshtml = "<tr class='"+PLAYER_PLAYBAR+" "+TRACK_POSITION_CONTROL+"'><td><div class='"+BUTTON+" "+BUTTON_PLAY+"' onclick='playPause("+index+","+track+")'></div><span class='"+TRACK_POSITION_DISPLAY+"'></span></td><td colspan=4><div><input type='range' min='0' max='1000' value='0' onmousedown='progressMouseDown("+index+","+track+")' onmouseup='progressMouseUp("+index+","+track+")' onmousemove='progressMouseMove("+index+","+track+")'></div></td></tr>"+
	           "<tr class='"+PLAYER_PLAYBAR+" "+TRACK_VOLUME_CONTROL+"'><td><div class='"+BUTTON+" "+BUTTON_MUTE+"' onclick='mute("+index+","+track+")'></div><span class='"+TRACK_VOLUME+"'></span></td><td colspan=4><div><input type='range' min='0' max='1000' value='500'  onmousedown='volumeMouseDown("+index+","+track+")' onmouseup='volumeMouseUp("+index+","+track+")' onmousemove='volumeMouseMove("+index+","+track+")'></div></td></tr>"
			let trackhtml = "<tbody><tr><td class='"+TRACK_ART+"'>"+$(this).find("td:eq(0)").html()+"<div class='"+BUTTON+" "+BUTTON_PLAY+"' onclick='playPause("+index+","+track+")'></td><td colspan=4 class='"+TRACK_TITLE+"'>"+$(this).find("td:eq(1)").html()+"</td><td class='"+TRACK_FILE+"'><audio src=\""+$(this).find("td:eq(2) span").text()+"\" onloadeddata='audioLoaded("+index+","+track+")'/></td></tr>"+controlshtml+"</tbody>"
			$(node).append($(trackhtml));
	});
	$(node).find("tbody:eq(0)").remove();
	$(node).find("tbody").addClass(TRACK_PAUSED)
	$(node).find("thead tr").append("<td class='"+PLAYER_CONTROLS_TRACK+"'>0</td><td class='"+PLAYER_CONTROLS+"'><div class='"+BUTTON+" "+PLAYER_CONTROLS_PREV+"' onclick='newTrack("+index+",-1)'></div><div class='"+BUTTON+" "+PLAYER_CONTROLS_NEXT+"' onclick='newTrack("+index+",1)'></div></td>")
	$(node).find("thead td:eq(2)").addClass(PLAYER_OPTIONS)
	loadTrack(node,index)
	return node
  }
  
   function audioLoaded(index,track) {
	   //console.log("Track loaded "+index+" "+track);
	   let p = getPlayerTrack(index,track)
	   $(p).addClass(TRACK_LOADED)
	   updatePlayerControls(index,track)
	   //console.log("Options = "+getOptions(index).toUpperCase()+" "+$(p).hasClass(TRACK_SELECTED))
	   if ($(p).hasClass(TRACK_SELECTED) && getOptions(index).toUpperCase().includes(OPTION_AUTOPLAY)) {
	     playPause(index,track)
	   }
   }

   function loadTrack(node,index) {  
	    $(node).find("tbody").removeClass(TRACK_SELECTED)
		let track = $(node).find('.'+PLAYER_CONTROLS_TRACK).text()
		let p = $(node).find("tbody:eq("+track+")")
		$(p).addClass(TRACK_SELECTED);
		if (parseInt($(node).find('.'+PLAYER_CONTROLS_TRACK).text())==0) {
			$(node).find("."+PLAYER_CONTROLS_PREV).addClass(BUTTON_DISABLED)
		} else {
			$(node).find("."+PLAYER_CONTROLS_PREV).removeClass(BUTTON_DISABLED)
	    }
		if (parseInt($(node).find('.'+PLAYER_CONTROLS_TRACK).text())==$(node).find("tbody").length-1) {
			$(node).find("."+PLAYER_CONTROLS_NEXT).addClass(BUTTON_DISABLED)
		} else {
			$(node).find("."+PLAYER_CONTROLS_NEXT).removeClass(BUTTON_DISABLED)
	    }
   }
   
   function mute(index,track) {
		let p = getPlayerTrack(index,track)
		if (p.hasClass( TRACK_MUTED)) {
			p.removeClass(TRACK_MUTED)
		} else {
			p.addClass(TRACK_MUTED)
		}
		setVolume(index) 
   }
   
   function getPlayerTrack(index,track) {
	   return $("table."+PLAYER+":eq("+index+") tbody:eq("+track+")")
   }
   
   function getPlayerRow(index) {
	   return $("table."+PLAYER+":eq("+index+")")
   }
   
   function getOptions(index) {
		return getPlayerRow(index).find("."+PLAYER_OPTIONS).text()
   }
   
   function getAudio(index,track) {
	   return getPlayerTrack(index,track).find("audio:eq(0)")[0]
   }
   
   function playPause(index,track) {
      let a = getAudio(index,track)
	  let p = getPlayerTrack(index,track)
	  if (a.paused)  {
		a.play();
		p.removeClass(TRACK_PAUSED)
		playing(index,track)
	  } else {
		a.pause();
		p.addClass(TRACK_PAUSED)
		stopping(index,track);
	  }
	  checkAllPaused(index)
	  
   }
   
   function checkAllPaused(index) {
	   if (playingmap.size==0) {
		  //console.log("Paused");
		   getPlayerRow(index).addClass(PLAYER_PAUSED)
	  } else {
		  //console.log("Playing");
		  getPlayerRow(index).removeClass(PLAYER_PAUSED)
	  }
   }
   
   function playing(index,track)  {
	   if (playingmap.get(getDraggingMapKey(index,track)) == undefined) {
		    //console.log("Adding "+getDraggingMapKey(index,track)+" to playing")
		    let i = setInterval(updatePlayerControls, PROGRESS_UPDATE_INTERVAL_MS,index,track)
			playingmap.set(getDraggingMapKey(index,track),i);
			//console.log("playing "+playingmap.get(getDraggingMapKey(index,track)))
	   }
   }
   
   function stopping(index,track) {
	   //console.log("stopping "+playingmap.get(getDraggingMapKey(index,track)))
	   clearInterval(playingmap.get(getDraggingMapKey(index,track)));
	   playingmap.delete(getDraggingMapKey(index,track))
	   //console.log("Removed "+getDraggingMapKey(index,track)+" from playing")
   }
   
   
   function updatePlayerControls(index,track) {
	 let a = getAudio(index,track)
	 let p = getPlayerTrack(index,track)
	 if (draggingmap.get(getDraggingMapKey(index,track)) == undefined ) {
		if (a.paused && !isNaN(a.duration))  {
			p.addClass(TRACK_PAUSED)
			stopping(index,track)
			if (a.paused && a.currentTime==a.duration && getOptions(index).toUpperCase().includes(OPTION_CONTINUE)) {
			   a.currentTime=0
			   let nt = newTrack(index,1)
			   if (nt != undefined) {
				  playPause(index,nt)
			   }
			}
			checkAllPaused(index)
		}
		p.find("."+TRACK_POSITION_CONTROL+" input").val((a.currentTime/a.duration)*1000)
		//console.log(a.src+" "+toTime(a.currentTime)+" / "+toTime(a.duration)+" "+JSON.stringify(playingmap,(key, value) => (value instanceof Map ? [...value] : value)))
	 }
	 if (!isNaN(a.duration)) {
	   setVolume(index,track)
	   p.find("."+TRACK_POSITION_DISPLAY).text(toTime(a.currentTime)+" / "+toTime(a.duration))
	 }
   }
   
   function toTime(s) {
        let minutes = Math.floor(s / 60);
        let seconds = Math.floor(s % 60);    
        let formattedMinutes = minutes.toString().padStart(2, '0');
        let formattedSeconds = seconds.toString().padStart(2, '0');
        return formattedMinutes+":"+formattedSeconds;
   }
	   
	   
   function getDraggingMapKey(index,track) {
     return index+":"+track
   }	 
   
   function progressMouseDown(index,track) {
	   draggingmap.set(getDraggingMapKey(index,track),DRAG_PROGRESS)
   }
   
   function progressMouseUp(index,track) {
	   draggingmap.delete(getDraggingMapKey(index,track))
	   setProgressFromBar(index,track)
   }
   
   function progressMouseMove(index,track) {
	   if (draggingmap.get(getDraggingMapKey(index,track)) == DRAG_PROGRESS ) {
		   setProgressFromBar(index,track)
	   }
   }
   
   function volumeMouseDown(index,track) {
	   draggingmap.set(getDraggingMapKey(index,track),DRAG_VOLUME)
   }
   
   function volumeMouseUp(index,track) {
	   draggingmap.delete(getDraggingMapKey(index,track))
	   setVolume(index,track)
   }
   
   function volumeMouseMove(index,track) {
	   if (draggingmap.get(getDraggingMapKey(index,track)) == DRAG_VOLUME ) {
		   setVolume(index,track)
	   }
   }
		  
   function setProgressFromBar(index,track) {
	  let a = getAudio(index,track)
	  let p = getPlayerTrack(index,track)
	  let v = p.find("."+TRACK_POSITION_CONTROL+" input").val()
	  if (!isNaN(a.duration)) {
		a.currentTime = (v/1000)*a.duration
		p.find("."+TRACK_POSITION_DISPLAY).text(toTime(a.currentTime)+" / "+toTime(a.duration))
	  }
   }
   
   function setVolume(index,track) {
	  let a = getAudio(index,track)
	  let p = getPlayerTrack(index,track)
	  let v = 0
	  if (!p.hasClass( TRACK_MUTED)) {
		v = p.find("."+TRACK_VOLUME_CONTROL+" input").val()
	  }
	  if (!isNaN(a.volume)) {
		a.volume = (v/1000)
		p.find("."+TRACK_VOLUME).text(Math.floor(v/10))
	  }
   }
   
  function newTrack(index,d) {
	   //console.log("track "+d)
	   let p = getPlayerRow(index)
	   let track,pl
	   do {
		   track = parseInt($(p).find('.'+PLAYER_CONTROLS_TRACK).text())+d
           if (parseInt(track)==$(p).find("tbody").length) {
			   if (getOptions(index).toUpperCase().includes(OPTION_LOOP)) {
					track=0
			   } else {
					return undefined
			   }
	       }
		   //console.log("new track ="+track)
		   $(p).find('.'+PLAYER_CONTROLS_TRACK).text(track)
		   loadTrack(p,index)
	       pl = $(p).find("tbody:eq("+track+")")
	   } while (!$(pl).hasClass(TRACK_LOADED))
       playing(index,track)   
	   setProgressFromBar(index,track)
	   return track
   }
   
   // ####################################### VIDEO ##############################################
   
   
  function createVideoControls(name) {
	node = $("<table class='"+PLAYER+" "+PLAYER_PAUSED+"'><thead><tr><td><h2><span>VIDEO</span></h2></td><td colspan=3><span>"+name+"</span></td><td colspan=1><span>ACLF</span></td></tr></thead><tr class='"+PLAYER_PLAYBAR+"'><td><div class='"+BUTTON+" "+BUTTON_PLAY+"' onclick='videoPlayPause()'></div><span class='"+TRACK_POSITION_DISPLAY+"'>00:00 / 00:00</span></td><td colspan=4><div><input class='"+TRACK_POSITION_CONTROL+"' type='range' min='0' max='1000' value='0' onmousedown='videoProgressMouseDown()' onmouseup='videoProgressMouseUp()' onmousemove='videoProgressMouseMove()'></div></td></tr><tr class='"+PLAYER_PLAYBAR+" "+TRACK_VOLUME_CONTROL+"'><td><div class='"+BUTTON+" "+BUTTON_MUTE+"' onclick='videoMute()'></div><span class='"+TRACK_VOLUME+"'></span></td><td colspan=4><div><input type='range' min='0' max='1000' value='500' onmousedown='videoVolumeMouseDown()' onmouseup='videoVolumeMouseUp()' onmousemove='videoVolumeMouseMove()'></div></td></tr></table>")
	return node
  }
  
  function videoLoadCheck() {
	$("video").each(function( index ) {
		$(this).on('loadeddata', function() {
			if (this.readyState >= 3) {
				console.log('Video Ready.');
				if (!this.paused) {
					videoPlaying()
				}
			}
		});
	})
  }
  
  function videoPlaying()  {
	   if (playingmap.get("V") == undefined) {
		    let i = setInterval(videoPlayMessage, PROGRESS_UPDATE_INTERVAL_MS)
			playingmap.set("V",i);
	   }
   }
   
   function videoStopping() {
	   clearInterval(playingmap.get("V"));
	   playingmap.delete("V")
   }
   
   function videoPlayMessage() {
		$("video").each(function( index ) {
			if (this.paused) {
					pau = "PA"
					videoStopping()
			} else {
					pau="PL"
			}
			vidChannel.postMessage("VL:"+this.currentTime+":"+this.duration+":"+pau);
		})
   }
  
  function playerVideoEvent(e) {
	console.log("Video Event "+e)
	if (e.startsWith("VL")) {
		$("tbody").addClass(TRACK_SELECTED+" "+TRACK_LOADED);
		p = e.split(":")
		updateVideoControls(parseFloat(p[1]),parseFloat(p[2]),p[3])
	} else if (e=="VP") {
		$("video").each(function( index ) {
			if (this.paused) {
				this.play()
				videoPlaying()
			} else {
				this.pause()	
			}
		})	
	} else if (e=="VS") {
		videoStopping()
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
			vidChannel.postMessage("VL:"+this.currentTime+":"+this.duration+":"+pau);
		})
	} else if (e.startsWith("VV")) {
		$("video").each(function( index ) {
			p = e.split(":")
			console.log("Volume "+parseFloat(p[1]))
			this.volume = parseFloat(p[1])
		})
	}
  }
  
  function updateVideoControls(pos,dur,pau) {
	console.log('Update Video Controls');
	p = $("table."+PLAYER)
	if (draggingmap.get("V") == undefined ) {
		console.log('Update Video Controls - not dragging '+pos+' '+dur);
		if (pau=="PA")  {
			p.addClass(TRACK_PAUSED)
			vidChannel.postMessage("VS");
		} else {
			p.removeClass(TRACK_PAUSED)
		}
		p.find("input."+TRACK_POSITION_CONTROL).val((pos/dur)*1000)
	 }
	 p.find("."+TRACK_POSITION_DISPLAY).text(toTime(pos)+" / "+toTime(dur))
   }
   
   function videoPlayPause() {
	   vidChannel.postMessage("VP");
   }
   
   function videoProgressMouseDown() {
	   draggingmap.set("V",DRAG_PROGRESS)
   }
   
   function videoProgressMouseUp() {
	   draggingmap.delete("V")
	   videoSetProgressFromBar()
   }
   
   function videoProgressMouseMove() {
	   if (draggingmap.get("V") == DRAG_PROGRESS ) {
		   videoSetProgressFromBar()
	   }
   }
   
   function videoVolumeMouseDown() {
	   draggingmap.set("V",DRAG_VOLUME)
   }
   
   function videoVolumeMouseUp() {
	   draggingmap.delete("V")
	   videoSetVolume()
   }
   
   function videoVolumeMouseMove() {
	   if (draggingmap.get("V") == DRAG_VOLUME ) {
		   videoSetVolume()
	   }
   }
   
   function videoSetProgressFromBar() {
	  p = $("table."+PLAYER)
	  let v = p.find("input."+TRACK_POSITION_CONTROL).val()/1000
	  vidChannel.postMessage("VSK:"+v);
   }
   
   function videoSetVolume() {
	  p = $("table."+PLAYER)
	  let v = 0
	  if (!p.hasClass( TRACK_MUTED)) {
		v = p.find("."+TRACK_VOLUME_CONTROL+" input").val()
	  }
	  vidChannel.postMessage("VV:"+(v/1000));
	  p.find("."+TRACK_VOLUME).text(Math.floor(v/10))
   }
   
   function videoMute() {
		let p = $("table."+PLAYER)
		if (p.hasClass( TRACK_MUTED)) {
			p.removeClass(TRACK_MUTED)
		} else {
			p.addClass(TRACK_MUTED)
		}
		videoSetVolume() 
   }