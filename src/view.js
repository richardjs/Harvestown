'use strict'

var VILLAGER_IMAGE = document.createElement('img')
VILLAGER_IMAGE.src = require('../img/villager.png')

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
		}else if(this.offset.x + this.canvas.width >= this.map.width*this.map.tileWidth){
			this.offset.x = this.map.width*this.map.tileWidth - this.canvas.width - 2
		}
		this.offset.y += vector.y
		if(this.offset.y < 0){
			this.offset.y = 0
		}else if(this.offset.y + this.canvas.height >= this.map.height*this.map.tileHeight){
			this.offset.y = this.map.height*this.map.tileHeight - this.canvas.height - 2
		}
	}

	render(){
		this.renderTiles()
		for(var entity of this.map.entities){
			this.ctx.drawImage(
				VILLAGER_IMAGE,
				entity.pos.x - this.offset.x - VILLAGER_IMAGE.width/2,
				entity.pos.y - this.offset.y - VILLAGER_IMAGE.height/2
			)
		}
	}

	renderTiles(){
		var tileOffset = {
			x: Math.floor(this.offset.x / this.map.tileWidth),
			y: Math.floor(this.offset.y / this.map.tileHeight)
		}
		var subTileOffset = {
			x: this.offset.x % this.map.tileWidth,
			y: this.offset.y % this.map.tileHeight
		}
		for(var x = 0; x < this.map.width; x++){
			for(var y = 0; y < this.map.height; y++){
				if(!this.map.data[x+tileOffset.x]){
					continue
				}
				switch(this.map.data[x+tileOffset.x][y+tileOffset.y]){
					case 'water':
						this.ctx.fillStyle = '#008'
						break
					case 'tree':
						this.ctx.fillStyle = '#840'
						break
					default:
						this.ctx.fillStyle = '#171'
				}
				this.ctx.fillRect(x*this.map.tileWidth - subTileOffset.x, y*this.map.tileHeight - subTileOffset.y, this.map.tileWidth, this.map.tileHeight);
				this.ctx.strokeRect(x*this.map.tileWidth - subTileOffset.x, y*this.map.tileHeight - subTileOffset.y, this.map.tileWidth, this.map.tileHeight);
			}
		}

	}
}

module.exports = View
