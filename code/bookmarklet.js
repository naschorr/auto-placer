javascript:
	/* Change these three lines */
	let imageUrl = "https://i.imgur.com/rGbyKNL.jpg";
	let leftX = 103;
	let topY = 627;
	/* Change these three lines */

	let self = this;
	$.getScript("https://rawgit.com/naschorr/color-converter/master/converter.js");
	$.getScript("https://rawgit.com/naschorr/place-automator/master/code/place-automator.js");
	/* Lazy, but it works */
	setTimeout(function(){
		new PlaceAutomator(self.r.place, imageUrl, leftX, topY);
	}, 5 * 1000);
