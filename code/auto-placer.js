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

		this.canvas = this.buildSourceCanvas(imageUrl);
	}

	/* Gets the array of palette colors available */
	getPaletteColors(){
		if(this.isReddit){
			return this.place.DEFAULT_COLOR_PALETTE;
		}else{
			/* No explicit javascript method to get pxls.space's color palette? */
			/* eslint-disable indent */
			return ["#FFFFFF", "#E4E4E4", "#888888", "#222222", "#FFA7D1",
					"#E50000", "#E59500", "#A06A42", "#E5D900", "#94E044",
					"#02BE01", "#00D3DD", "#0083C7", "#0000EA", "#CF6EE4",
					"#820080"];
			/* eslint-enable indent */
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
			self.main();
		};
		/* Kind of sketchy, but should be fine with known good image hosts */
		img.crossOrigin = "Anonymous";
		img.src = imageUrl;

		return ctx;
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
			console.log(`Unspecified system. ${arguments.callee.toString()}, (${arguments}.toString())`);
		}
	}


	/* Places a tile at the specified coordinates */
	placeTile(x, y){
		if(this.isReddit){
			this.place.drawTile(x, y);
		}else if(this.isPxls){
			this.place.place(x, y);
		}else{
			console.log(`Unspecified system. ${arguments.callee.toString()}, (${arguments}.toString())`);
		}
	}

	/* Places a random tile on the board */
	placeRandomTile(){
		let randInclusive = function(min, max){
			return Math.floor(Math.random() * (max - min)) + min;
		};

		let x = randInclusive(0, this.canvas.canvas.clientWidth);
		let y = randInclusive(0, this.canvas.canvas.clientHeight);
		let pixel = this.canvas.getImageData(x, y, 1, 1).data;

		// Make sure the pixel isn't transparent
		if(pixel[3] === 255){
			this.chooseColor(this.getColorIndexFromRGB(pixel[0], pixel[1], pixel[2]));
			this.placeTile(this.x + x, this.y + y);
			return [this.x + x, this.y + y];
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
			console.log(`Unspecified system. ${arguments.callee.toString()}, (${arguments}.toString())`);
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
				let socket = self.place.socket;
				if(socket.readyState === socket.CLOSING || socket.readyState === socket.CLOSED){
					self.reconnect();
				}else if(socket.readyState === socket.OPEN){
					let result = self.placeRandomTile();
					if(result){
						console.log(`Placed tile at (${result[0]}, ${result[1]})`);
					}
				}
				self.main();
			}, (timer_seconds + 1) * 1000);
		}, 1000);
	}
}