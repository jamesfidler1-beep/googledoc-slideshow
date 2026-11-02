var wordcloud = wordcloud || {};

wordcloud.wordcloudChannel = new BroadcastChannel('wordcloud');

wordcloud.init = function() {
	wordcloud.wordcloudChannel.onmessage = function(e) {
		wordcloudEvent(e.data)
	};
	console.log("WordCloud Module Initialised")
} 

wordcloud.createWordCloud = function() {
	return "<canvas class='wordcloud' width='1178' height='650' style='width: 1178px; height: 650px;'></canvas>"
}