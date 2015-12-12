'use strict'

var I = require('./image.js')
var House = require('./house.js')

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

	renderImageAtTile(image, pos){
		var tilePos = map.pixelToTile(pos)
		this.ctx.drawImage(
			image,
			tilePos.x*this.map.tileWidth - this.offset.x + this.map.tileWidth/2 - image.width/2,
			tilePos.y*this.map.tileHeight - this.offset.y + this.map.tileHeight/2 - image.height/2
		)
	}

	render(){
		this.renderTiles()
		var houses = []
		for(var entity of this.map.entities){
			if(entity instanceof House){
				houses.push(entity)
				continue
			}
			this.ctx.save()
			this.ctx.translate(
				entity.pos.x - this.offset.x,
				entity.pos.y - this.offset.y
			)
			this.ctx.rotate(entity.angle)
			this.ctx.drawImage(entity.image, - entity.image.width/2, -entity.image.height/2)
			this.ctx.restore()
		}
		for(var entity of houses){
			this.ctx.save()
			this.ctx.translate(
				entity.pos.x - this.offset.x,
				entity.pos.y - this.offset.y
			)
			this.ctx.rotate(entity.angle)
			this.ctx.drawImage(entity.image, - entity.image.width/2, -entity.image.height/2)
			this.ctx.restore()
		}

		if(controller.placingHouse){
			var absPos = {x: controller.mousePos.x + this.offset.x, y: controller.mousePos.y + this.offset.y}
			if(map.atPixel(absPos) === undefined){
				this.renderImageAtTile(I.HOUSE, absPos)
			}
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
