/* eslint no-case-declarations: "ignore" */
/* eslint no-indent: "ignore" */

class AutoPlacer {
	constructor(place, imageUrl, x, y){
		/* Check for required libraries */
		if(!(this.requirementsLoaded())){
			return;
		}

		/* Arg handling */
		this.place = place;
		this.x = x;
		this.y = y;

		/* Literals */
		this.RECAPTCHA_TITLE = "recaptcha challenge";
		this.REDDIT = "reddit.com";
		this.PIXLS = "pxls.space";

		/* Init the needed members */
		this.WAIT_TIME = 3;
		this.captchaVisible = undefined;
		this.checkCaptchaRecovered = false;
		this.system = window.location.hostname;
		this.isReddit = this.system.includes(this.REDDIT);
		this.isPxls = this.system.includes(this.PIXLS);
		this.colors = this.getPaletteColors();

		/* Set up the canvas and start placing */
		this.canvasCtx = this.buildSourceCanvas(imageUrl);
	}

	/* Checks to make sure required libraries are loaded */
	requirementsLoaded(){
		let checkRequirement = function(moduleName){
			try{
				return !!(eval(moduleName));
			}
			catch(e){
				if(e instanceof ReferenceError){
					/* Explicitly return false on ReferenceError */
					console.error(`${moduleName} isn't loaded.`)
					return false;
				}else{
					/* But, if some other error popped, something else is probably very wrong */
					console.error(`Unexpected error, checking ${moduleName}.`)
					return false;
				}
			}
		}

		return (checkRequirement("jQuery") && checkRequirement("Color"));
	}

	/* Gets the array of palette colors available */
	getPaletteColors(){
		if(this.isReddit){
			return this.place.DEFAULT_COLOR_PALETTE;
		}else if(this.isPxls){
			return this.place.palette;
		}else{
			console.error("Unspecified system in getPaletteColors()");
		}
	}

	/* Builds a canvas that will be used to hold and retrieve pixel data for the reference image */
	buildSourceCanvas(imageUrl){
		let self = this;

		let canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
		let ctx = canvas.getContext("2d");

		let img = new Image();
		img.onload = function(){
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			/* Go into the main loop once the image is drawn onto the canvas */
			self.main();
		};
		/* Kind of sketchy, but should be fine with known good image hosts */
		img.crossOrigin = "Anonymous";
		img.src = imageUrl;

		return ctx;
	}

	/* Gets the canvas context of the place board */
	getPlaceCanvasCtx(){
		if(this.isReddit){
			console.log("/r/Place shut down, so I'm not going to bother with this logic");
		}else if(this.isPxls){
			return this.place.elements.board[0].getContext("2d");
		}else{
			console.error("Unspecified system in getPlaceCanvasCtx()");
		}
	}

	/* Gets a single pixel's RGBA array from the given canvas context */
	getPixelFromCanvasCtx(canvasCtx, x, y){
		let canvasWidth = canvasCtx.canvas.clientWidth;
		let canvasHeight = canvasCtx.canvas.clientHeight
		if(0 > x || x >= canvasWidth){
			throw new Error(`X coordinate (${x}) is out of bounds on canvas with width (${canvasWidth})`);
		}
		if(0 > y || y >= canvasHeight){
			throw new Error(`Y coordinate (${y}) is out of bounds on canvas with height (${canvasHeight})`);
		}

		return canvasCtx.getImageData(x, y, 1, 1).data;
	}

	/* Converts r, g, and b values into a single color index (for this.colors) */
	getColorIndexFromRGB(r, g, b){
		// Assumes that converter.js is already fetched/imported

		let distToHex = function(hexString){
			let hex = new Hex();
			hex.hex = hexString.slice(1);
			let rgb = hex.toRGB();

			/* Basic euclidan distance */
			let _r = Math.pow((rgb.r - r), 2);
			let _g = Math.pow((rgb.g - g), 2);
			let _b = Math.pow((rgb.b - b), 2);
			return Math.sqrt(_r + _g + _b);
		};

		let closest = {
			distance: distToHex(this.colors[0]),
			index: 0
		};

		/* Try to find the shortest distance between the r, g, b, arguments and
		   a single color in the color palette (this.colors) */
		this.colors.forEach(function(element, index){
			let distance = distToHex(element);
			if(distance < closest.distance){
				closest.distance = distance;
				closest.index = index;
			}
		});

		return closest.index;
	}

	/* Sets the color of the next tile to be placed */
	chooseColor(colorIndex){
		if(this.isReddit){
			this.place.setColor(colorIndex);
		}else if(this.isPxls){
			this.place.switchColor(colorIndex);
		}else{
			console.error("Unspecified system in chooseColor()");
		}
	}


	/* Places a tile at the specified coordinates */
	placeTile(x, y){
		if(this.isReddit){
			this.place.drawTile(x, y);
		}else if(this.isPxls){
			this.place.attemptPlace(x, y);
		}else{
			console.error("Unspecified system in placeTile()");
		}
	}

	/* Places the next tile on the board (left -> right, top -> bottom) */
	placeNextTile(){
		let canvasWidth = this.canvasCtx.canvas.clientWidth;
		let canvasHeight = this.canvasCtx.canvas.clientHeight;

		for(let y = 0; y < canvasHeight; y++){
			for(let x = 0; x < canvasWidth; x++){
				let pixel = this.getPixelFromCanvasCtx(this.canvasCtx, x, y);
				if(pixel[3] < 255){
					continue;
				}

				let boardX = x + this.x;
				let boardY = y + this.y;
				let boardPixel = this.getPixelFromCanvasCtx(this.getPlaceCanvasCtx(), boardX, boardY);
				let pixelColorIndex = this.getColorIndexFromRGB(pixel[0], pixel[1], pixel[2]);
				let boardPixelColorIndex = this.getColorIndexFromRGB(boardPixel[0], boardPixel[1], boardPixel[2]);

				if(pixelColorIndex !== boardPixelColorIndex){
					this.chooseColor(pixelColorIndex);
					this.placeTile(boardX, boardY);
					return [boardX, boardY];	// break
				}
			}
		}

		return false;
	}

	/* Gets the text content of a timer, and returns it */
	getTimerText(){
		if(this.isReddit){
			return document.getElementById("place-timer").textContent;
		}else if(this.isPxls){
			return document.body.getElementsByClassName("cooldown-timer")[0].textContent;
		}else{
			console.error("Unspecified system in getTimerText()");
		}
	}

	/* Gets the time in seconds until the next tile can be placed */
	getSecondsInTimer(){
		let timer = this.getTimerText();

		if(timer === ""){
			return 0;
		}

		let seconds = 0;
		let timer_elements = timer.split(":").slice(-2);
		timer_elements.forEach(function(element, index){
			let position = timer_elements.length - index;
			seconds += Math.pow(60, position - 1) * parseInt(element, 10);
		});

		return seconds;
	}

	/* Attempts to reconnect to the host if a socket closes */
	reconnect(){
		if(this.isReddit){
			console.log("/r/Place shut down, so I'm not going to bother with this logic");
		}else if(this.isPxls){
			let self = this;
			setTimeout(function(){
				self.place.initSocket();
			}, 5 * 1000);
		}else{
			console.error("Unspecified system in reconnect()");
		}
	}

	/* Returns an int on whether or not the script will be able to place a tile (0 = no, 1 = yes, 2 = wait) */
	getConnectionState(){
		if(this.isReddit){
			console.log("/r/Place shut down, so I'm not going to bother with this logic");
			return 1;
		}else if(this.isPxls){
			let socket = this.place.socket;
			if(socket.readyState === socket.CLOSING || socket.readyState === socket.CLOSED){
				return 0;
			}else if(socket.readyState === socket.OPEN){
				return 1;
			}else{
				return 2;
			}
		}else{
			console.error("Unspecified system in getConnectionState()");
		}
	}

	/* Detects if a captcha is currently on screen or not, execute a callback if it's hidden */
	checkCaptchaVisibility(onHidden, onVisible){
		/* Reddit didn't have captchas, so just ignore the check and run the callback */
		if(this.isReddit){
			onHidden();
			return;
		}

		/* 	Captcha hierarchy is:
			<div>
				<div></div>
				<div>
					<iframe></iframe>
				</div>
			</div

			This gets the actual iframe captcha element, to get the topmost div, which has a
			'visibility' style tag that toggles when the captcha is activated/decativated.
		*/
		let iframeJqObj = $(`iframe[title$='${this.RECAPTCHA_TITLE}']`);
		let iframeGrandparentElement = iframeJqObj.parent().parent().get(0);

		try{
			let visibility;
			if(iframeGrandparentElement.style.visibility === "hidden"){
				onHidden();
				visibility = false;
			}else{
				onVisible();
				visibility = true;
			}

			/* Reset the flag on successful captcha check */
			this.checkCaptchaRecovered = false;

			return visibility;
		}
		catch (e){
			if (e instanceof TypeError){
				console.error("TypeError in checkCaptchaVisibility(), the element probably isn't in the DOM yet. Attempting to recover...");

				/* This gives the captcha a chance to recover instead of just quitting or infinitely looping */
				if(!(this.checkCaptchaRecovered)){
					try{
						grecaptcha.reset();
					}
					catch (e){
						if(e instanceof ReferenceError){
							console.error("ReferenceError when attempting grecaptcha.reset()");
						}else{
							console.error("Unhandled error when attempting grecaptcha.reset()");
						}
					}
					finally{
						this.checkCaptchaRecovered = true;
					}

				}else{
					throw new Error("Too many TypeErrors in checkCaptchaVisibility()");
				}

			}else{
				throw new Error(`Unhandled error in checkCaptchaVisibility(): ${e}`);
			}
		}
	}

	/* Main execution loop */
	main(){
		let self = this;
		setTimeout(function(){
			let waitSeconds = self.getSecondsInTimer() + 1;	// Extra second to make sure timer has fully elapsed
			if(waitSeconds > 1){
				console.log(`Waiting ${waitSeconds} s`);
			}
			setTimeout(function(){
				switch(self.getConnectionState()){
					case 0:
						self.reconnect();
						break;
					case 1:
						self.captchaVisible = self.checkCaptchaVisibility(function(){
							let result = self.placeNextTile();
							if(result){
								console.log(`Attempting to place tile at (${result[0]}, ${result[1]})`);
							}else{
								console.log("Unable to place tile, the image may be complete");
							}
						}, function(){
							if(!(self.captchaVisible)){
								console.log("Captcha visible");
							}
						});
						break;
					case 2:
						break;
					default:
						break;
				}
				self.main();
			}, waitSeconds * 1000);
		}, self.WAIT_TIME * 1000);
	}
}