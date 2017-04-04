javascript:
	/* Change these three lines */
	let imageUrl = "https://i.imgur.com/AxKGmnJ.jpg";
	let leftX = 50;
	let topY = 580;
	/* Change these three lines */

	let context = window.App;
	if(window.location.hostname.includes("reddit.com")){
		context = this.r.place;
	}

	$.getScript("https://rawgit.com/naschorr/color-converter/master/converter.js");
	$.getScript("https://rawgit.com/naschorr/auto-placer/master/code/auto-placer.js");
	/* Lazy, but it works */
	setTimeout(function(){
		new AutoPlacer(context, imageUrl, leftX, topY);
	}, 5 * 1000);
