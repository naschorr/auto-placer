# place-automator
The simple, cooperative, non-committal drawing tool for /r/place.

### What?
First things first, check out [/r/place](https://www.reddit.com/r/place/). It's a neat sort of territorial drawing experiment on Reddit.

Secondly, place-automator is a potential solution to the problem of how to coordinate people into placing tiles to create interesting designs. It does this through a mostly passive system that doesn't require you to install any extra software, and runs on the browser that you're already running. There aren't any servers or connections to manage, configuration is easy, and distribution can be done with a simple bookmarklet.

### Running It
placer-automator needs three things for it to start working:
- A link to a raw source image (string)
- An x coordinate (integer)
- A y coordinate (integer)
  
The This image is used as a template for where everyone will draw their tiles. Its pixels will literally be converted one-to-one into tiles, so it's a good idea to keep sizes small. Also, don't worry about making sure image's pixels match up with the allowed color palette. Theres a handly conversion method that will try to find the closest color in the palette.

The coordinates define where the image will be created on the board. Specifically, they define the top-left corner of the image will be placed.

With that said, there are two main ways of running it:
- Executing a bookmarklet that you or someone else has made (ctrl-D > Edit > Paste the following in the URL box, then click on the bookmark to run it)
```
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
```
- Manually imputting commands into the dev console
```
$.getScript("https://rawgit.com/naschorr/color-converter/master/converter.js");
$.getScript("https://rawgit.com/naschorr/place-automator/master/code/place-automator.js");
new PlaceAutomator(this.r.place, "https://i.imgur.com/rGbyKNL.jpg", 103, 627);
```

### Anything Else?
This was mostly hacked together in between working on other things, so it's pretty much in its most basic state. I'd like to add some test cases, and make the whole thing a bit more robust for the internet, but I'm not sure how long this thing (event?) will last. I'm also not very satisfied with the current bookmarklet, but it works okay enough.

Tested and working on Chrome 56. I'd guess that other modern browsers will work just fine.
