# place-automator
The simple, cooperative, non-committal drawing tool for /r/place and pxls.space.

### What?
First things first, check out [/r/place](https://www.reddit.com/r/place/) and [pxls.space](http://pxls.space/). They're these neat sort of territorial drawing experiments initially started by Reddit.

Secondly, place-automator is a potential solution to the problem of how to coordinate people into placing tiles to create interesting designs. It does this through a mostly passive system that doesn't require you to install any extra software, and runs on the browser that you're already running. There aren't any servers or connections to manage, configuration is easy, and distribution can be done with a simple bookmarklet.

### Running It
placer-automator needs three things for it to start working:
- A link to a raw source image (string)
- An x coordinate (integer)
- A y coordinate (integer)
  
The This image is used as a template for where everyone will draw their tiles. Its pixels will literally be converted one-to-one into tiles, so it's a good idea to keep sizes small. Also, don't worry about making sure image's pixels match up with the allowed color palette. Theres a handly conversion method that will try to find the closest color in the palette.

The coordinates define where the image will be created on the board. Specifically, they define the top-left corner of the image will be placed.

With that said, there are two main ways of running it:
- Via a bookmarklet that you or someone else has made (like so)
```
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
	$.getScript("https://rawgit.com/naschorr/place-automator/master/code/place-automator.js");
	setTimeout(function(){
		new PlaceAutomator(context, imageUrl, leftX, topY);
	}, 5 * 1000);
```
- Manually inputting commands into the dev console
```
$.getScript("https://rawgit.com/naschorr/color-converter/master/converter.js");
$.getScript("https://rawgit.com/naschorr/place-automator/master/code/place-automator.js");
new PlaceAutomator(window.App, "https://i.imgur.com/AxKGmnJ.jpg", 50, 580);
```

In Chrome, bookmarklets can be made by pressing ctrl-D, clicking on 'Edit...' and then pasting the code inside the URL box.

The above examples will start placing the tiles needed to create a 24x24 Javascript logo whose top-left corner is at coordinates (50, 580).

### Anything Else?
This was mostly hacked together in between working on other things, so it's pretty much in its most basic state. I'd like to add some test cases, and make the whole thing a bit more robust for the internet, but I'm not sure how long this thing (event?) will last. I'm also not very satisfied with the current bookmarklet, but it works okay enough.

Tested and working on Chrome 56. I'd guess that other modern browsers will work just fine.
