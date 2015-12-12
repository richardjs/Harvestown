'use strict'

var TILE_WIDTH = 20
var TILE_HEIGHT = 20

class View{
	constructor(canvas, ctx, map){
		this.canvas = canvas
		this.ctx = ctx
		this.map = map
		this.offset = {x: 0, y: 0}
	}

	move(vector){
		this.offset.x += vector.x
		if(this.offset.x < 0){
			this.offset.x = 0
		}else if(this.offset.x + this.canvas.width >= this.map.width*TILE_WIDTH){
			this.offset.x = this.map.width*TILE_WIDTH - this.canvas.width - 2
		}
		this.offset.y += vector.y
		if(this.offset.y < 0){
			this.offset.y = 0
		}else if(this.offset.y + this.canvas.height >= this.map.height*TILE_HEIGHT){
			this.offset.y = this.map.height*TILE_HEIGHT - this.canvas.height - 2
		}
	}

	render(){
		var tileOffset = {
			x: Math.floor(this.offset.x / TILE_WIDTH),
			y: Math.floor(this.offset.y / TILE_HEIGHT)
		}
		var pixelOffset = {
			x: this.offset.x % TILE_WIDTH,
			y: this.offset.y % TILE_HEIGHT
		}
		for(var x = 0; x < this.map.width; x++){
			for(var y = 0; y < this.map.height; y++){
				if(!this.map.data[x+tileOffset.x]){
					continue
				}
				switch(this.map.data[x+tileOffset.x][y+tileOffset.y]){
					case 'water':
						this.ctx.fillStyle = 'blue'
						break
					case 'tree':
						this.ctx.fillStyle = '#840'
						break
					default:
						this.ctx.fillStyle = 'green'
				}
				this.ctx.fillRect(x*TILE_WIDTH - pixelOffset.x, y*TILE_HEIGHT - pixelOffset.y, TILE_WIDTH, TILE_HEIGHT);
			}
		}

	}
}

module.exports = View
