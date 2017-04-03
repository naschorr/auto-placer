class PlaceAutomator {
	constructor(place, imageUrl, x, y){
		this.place = place;
		this.x = x;
		this.y = y;

		this.colors = this.place.DEFAULT_COLOR_PALETTE;
		this.waitTime = 300;	// 5 minutes

		this.canvas = this.buildSourceCanvas(imageUrl);
	}

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
		img.crossOrigin = "Anonymous";
		img.src = imageUrl;

		return ctx;
	}

	rgbToPlaceColorIndex(r, g, b){
		// Assumes that converter.js is already fetched/imported

		let distToHex = function(hexString){
			let hex = new Hex();
			hex.hex = hexString.slice(1);
			let rgb = hex.toRGB();

			let _r = Math.pow((rgb.r - r), 2);
			let _g = Math.pow((rgb.g - g), 2);
			let _b = Math.pow((rgb.b - b), 2);

			let sqrt = Math.sqrt(_r + _g + _b);

			return sqrt;
		};

		let closest = {
			distance: distToHex(this.colors[0]),
			index: 0
		};

		this.colors.forEach(function(element, index){
			let distance = distToHex(element);
			if(distance < closest.distance){
				closest.distance = distance;
				closest.index = index;
			}
		});

		return closest.index;
	}

	drawTile(placeColorIndex, x, y){
		this.place.setColor(placeColorIndex);
		this.place.drawTile(x, y);
	}

	drawRandomTile(){
		let randInclusive = function(min, max){
			return Math.floor(Math.random() * (max - min)) + min;
		};

		let x = randInclusive(0, this.canvas.canvas.clientWidth);
		let y = randInclusive(0, this.canvas.canvas.clientHeight);
		let pixel = this.canvas.getImageData(x, y, 1, 1).data;

		// Make sure the pixel isn't transparent
		if(pixel[3] === 255){
			this.drawTile(this.rgbToPlaceColorIndex(pixel[0], pixel[1], pixel[2]), this.x + x, this.y - y);
		}
	}

	getSecondsInTimer(){
		let timer = document.getElementById("place-timer").textContent;

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

	main(){
		let self = this;
		let timer_seconds = this.getSecondsInTimer();
		if(timer_seconds > 0){
			console.log("Waiting", timer_seconds, "seconds to place a tile...");
			setTimeout(function(){
				self.drawRandomTile();
			}, (timer_seconds + 1) * 1000);
		}
		else{
			self.drawRandomTile();
			var id = setInterval(function(){
				let waitTime = self.waitTime;
				self.drawRandomTile();
				console.log("Tile placed, waiting", waitTime, "seconds.");
			}, (this.waitTime + 1) * 1000);
		}
	}
}