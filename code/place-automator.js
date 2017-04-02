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
		console.log(this.canvas);

		this.main();
	}

	buildSourceCanvas(imageUrl){
		let canvas = document.createElement("canvas");
		let ctx = canvas.getContext("2d");
		let img = new Image();
		img.onload = function(){
			ctx.drawImage(img, 0, 0);
		};
		img.src = imageUrl;

		return ctx;
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
		this.place.setColor(placeColorIndex);
		this.place.drawTile(x, y);
	}

	drawRandomTile(){
		let randInclusive = function(min, max){
			return Math.floor(Math.random() * (max - min)) + min;
		};

		let x = randInclusive(0, this.canvas.canvas.clientWidth);
		let y = randInclusive(0, this.canvas.canvas.clientHeight);
		let pixel = this.getPixelAt(x, y).data;

		// Make sure the pixel isn't transparent
		if(pixel[3] === 255){
			this.drawTile(this.rgbToPlaceColorIndex(pixel[0], pixel[1], pixel[2]), this.x + x, this.y + y);
		}
	}

	main(){
		while(true){
			if(this.place.enabled){
				this.drawRandomTile();
				if(!(this.place.enabled)){
					setTimeout(function(){}, this.longWait * 1000);
				}
			}
			setTimeout(function(){}, this.shortWait * 1000);
		}
	}
}