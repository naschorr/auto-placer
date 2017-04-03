javascript:
	/* Change these three lines */
	let imageUrl = "https://i.imgur.com/9h8nYWL.jpg";
	let leftX = 50;
	let topY = 580;
	/* Change these three lines */

	let self = this;
	$.getScript("https://rawgit.com/naschorr/color-converter/master/converter.js");
	$.getScript("https://rawgit.com/naschorr/place-automator/master/code/place-automator.js");
	/* Lazy, but it works */
	setTimeout(function(){
		new PlaceAutomator(self.r.place, imageUrl, leftX, topY);
	}, 5 * 1000);
