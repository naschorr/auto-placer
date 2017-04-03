class PlaceAutomator {
	constructor(place, imageUrl, x, y){
		this.place = place;
		this.x = x;
		this.y = y;

		this.colors = this.place.DEFAULT_COLOR_PALETTE;

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
			let rgb = new Hex(hexString.slice(1)).toRGB();

			return Math.sqrt(Math.pow((rgb.r - r), 2) + Math.pow((rgb.g - g), 2) + Math.pow((rgb.b - b), 2));
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
		timer_elements = timer.split(":");
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
		let timer_seconds = this.getSecondsInTimer();
		if(timer_seconds > 0){
			setTimeout(function(){
				this.drawRandomTile();
			}, (timer_seconds + 1) * 1000);
		}
		else{
			setInterval(function(){
				this.drawRandomTile();
			}, (this.getSecondsInTimer() + 1) * 1000);
		}
	}
}