'use strict'

var VILLAGER_IMAGE = document.createElement('img')
VILLAGER_IMAGE.src = require('../img/villager.png')

class View{
	constructor(canvas, ctx, map){
		this.canvas = canvas
		this.ctx = ctx
		this.map = map
		this.offset = {x: 0, y: 0}

		this.tileImage = null
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
			this.ctx.save()
			this.ctx.translate(
				entity.pos.x - this.offset.x,
				entity.pos.y - this.offset.y
			)
			this.ctx.rotate(entity.angle)
			this.ctx.drawImage(VILLAGER_IMAGE, - VILLAGER_IMAGE.width/2, -VILLAGER_IMAGE.height/2)
			this.ctx.restore()
		}
	}

	renderTiles(){
		if(!this.tileImage){
			this.updateTileImage()
		}
		this.ctx.drawImage(this.tileImage, -this.offset.x, -this.offset.y)
	}

	updateTileImage(){
		var canvas = document.createElement('canvas')
		var ctx = canvas.getContext('2d')
		canvas.width = this.map.width * this.map.tileWidth
		canvas.height = this.map.height * this.map.tileHeight

		for(var x = 0; x < this.map.width; x++){
			for(var y = 0; y < this.map.height; y++){
				switch(this.map.data[x][y]){
					case 'water':
						ctx.fillStyle = '#008'
						break
					case 'tree':
						ctx.fillStyle = '#840'
						break
					default:
						ctx.fillStyle = '#171'
				}
				ctx.fillRect(x*this.map.tileWidth, y*this.map.tileHeight, this.map.tileWidth, this.map.tileHeight)
				ctx.strokeStyle = '#040'
				ctx.lineWidth = .5
				ctx.strokeRect(x*this.map.tileWidth, y*this.map.tileHeight, this.map.tileWidth, this.map.tileHeight)
			}
		}

		this.tileImage = new Image()
		this.tileImage.src = canvas.toDataURL()
	}
}

module.exports = View
