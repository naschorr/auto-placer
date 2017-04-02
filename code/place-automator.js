class PlaceAutomator {
	constructor(place, imageUrl, x, y){
		this.place = place;
		this.x = x;
		this.y = y;

		this.name = "automate-place";
		this.colors = this.getPlaceColors();
		this.shortWait = 5;		// 5 seconds
		this.longWait = 300;	// 5 minutes

		this.canvas = this.buildSourceCanvas(imageUrl);
	}

	buildSourceCanvas(imageUrl){
		let canvasElement = document.getElementById(this.name + "-canvas");
		let canvas = canvasElement.getContext("2d");
		let image = new Image();
		image.onload = function(){
			canvas.drawImage(image, 0, 0);
		};
		image.src = imageUrl;

		return canvas;
	}

	getPixelAt(x, y){
		return this.canvas.getImageData(x, y, 1, 1);
	}

	getPlaceColors(){
		return this.place.DEFAULT_COLOR_PALETTE;
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
		place.setColor(placeColorIndex);
		place.drawTile(x, y);
	}

	drawRandomTile(){
		let randInclusive = function(min, max){
			return Math.floor(Math.random() * (max - min)) + min;
		};

		let x = randInclusive(0, this.canvas.canvas.clientWidth);
		let y = randInclusive(0, this.canvas.canvas.clientHeight);
		let pixel = this.getPixelAt(x, y);

		// Make sure the pixel isn't transparent
		if(pixel[3] < 255){
			this.drawRandomTile();
		}
		else{
			this.drawTile(this.rgbToPlaceColorIndex(pixel[0], pixel[1], pixel[2]), x, y);
		}
	}

	main(){
		if(place.enabled){
			this.drawRandomTile();
			setTimeout(this.main(), this.longWait * 1000);
		}
		else{
			setTimeout(this.main(), this.shortWait * 1000);
		}
	}
}