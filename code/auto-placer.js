/* eslint no-case-declarations: "ignore" */
/* eslint no-indent: "ignore" */

class AutoPlacer {
	constructor(place, imageUrl, x, y){
		this.place = place;
		this.x = x;
		this.y = y;

		this.REDDIT = "reddit.com";
		this.PIXLS = "pxls.space";
		this.system = window.location.hostname;
		this.isReddit = this.system.includes(this.REDDIT);
		this.isPxls = this.system.includes(this.PIXLS);

		this.colors = this.getPaletteColors();

		this.canvasCtx = this.buildSourceCanvas(imageUrl);
	}

	/* Gets the array of palette colors available */
	getPaletteColors(){
		if(this.isReddit){
			return this.place.DEFAULT_COLOR_PALETTE;
		}else{
			return this.place.palette;
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
			console.log(`Unspecified system in getPlaceCanvasCtx()`);
		}
	}

	/* Compares two pixels, returns true if equal, false if not */
	comparePixels(pixelA, pixelB){
		/* http://stackoverflow.com/a/14853974 */
		if(!pixelA || !pixelB){
			return false;
		}

		if(pixelA.length !== pixelB.length){
			return false;
		}

		for(let index = 0; index < pixelA.length; index++){
			if(pixelA[index] !== pixelB[index]){
				return false;
			}
		}

		return true;
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
			console.log(`Unspecified system in chooseColor()`);
		}
	}


	/* Places a tile at the specified coordinates */
	placeTile(x, y){
		if(this.isReddit){
			this.place.drawTile(x, y);
		}else if(this.isPxls){
			this.place.place(x, y);
		}else{
			console.log(`Unspecified system in placeTile()`);
		}
	}

	/* Places a random tile on the board */
	placeRandomTile(){
		let randInclusive = function(min, max){
			return Math.floor(Math.random() * (max - min)) + min;
		};

		let canvasWidth = this.canvasCtx.canvas.clientWidth;
		let canvasHeight = this.canvasCtx.canvas.clientHeight;
		let attemptCounter = 0;
		let attemptLimit = canvasWidth * canvasHeight;

		do{
			var x = randInclusive(0, canvasWidth);
			var y = randInclusive(0, canvasHeight);
			var pixel = this.getPixelFromCanvasCtx(this.canvasCtx, x, y);
			var placeX = x + this.x;
			var placeY = y + this.y;
			var canvasPixel = this.getPixelFromCanvasCtx(this.getPlaceCanvasCtx(), placeX, placeY);
			attemptCounter += 1;
		}while((this.comparePixels(pixel, canvasPixel) || pixel[3] !== 255) && attemptCounter < attemptLimit);

		if(attemptCounter < attemptLimit){
			this.chooseColor(this.getColorIndexFromRGB(pixel[0], pixel[1], pixel[2]));
			this.placeTile(placeX, placeY);
			return [placeX, placeY];
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
			console.log(`Unspecified system in getTimerText()`);
		}
	}

	/* Gets the time in seconds until the next tile can be placed */
	getSecondsInTimer(){
		let timer = this.getTimerText();

		if(timer === ""){
			return 0;
		}

		let seconds = 0;
		let timer_elements = timer.split(":");
		timer_elements.forEach(function(element, index){
			let position = timer_elements.length - index - 1;
			if(position > 0){
				seconds += position * 60 * parseInt(element, 10);
			}else{
				seconds += parseInt(element, 10);
			}
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
			console.log(`Unspecified system in reconnect()`);
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
			console.log(`Unspecified system in getConnectionState()`);
		}
	}

	/* Returns an int on whether or not the script will be able to place a tile (0 = no, 1 = yes, 2 = wait) */
	getConnectionState(){
		if(this.isReddit){
			console.log("/r/Place shut down, so I'm not going to bother with this logic");
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
			console.log(`Unspecified system. ${arguments.callee.toString()}, (${arguments}.toString())`);
		}
	}

	/* Main execution loop */
	main(){
		let self = this;
		setTimeout(function(){
			let timer_seconds = self.getSecondsInTimer();
			console.log(`Waiting ${timer_seconds} s`);
			setTimeout(function(){
				switch(self.getConnectionState()){
					case 0:
						self.reconnect();
						break;
					case 1:
						let result = self.placeRandomTile();
						if(result){
							console.log(`Placing tile at (${result[0]}, ${result[1]})`);
						}
						break;
					case 2:
						break;
					default:
						break;
				}
				self.main();
			}, (timer_seconds + 1) * 1000);
		}, 1000);
	}
}