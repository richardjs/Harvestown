'use strict'

var C = require('./constants.js')
var I = require('./image.js')
var Farm = require('./farm.js')
var House = require('./house.js')
var Villager = require('./villager.js')

class View{
	constructor(canvas, ctx, map){
		this.canvas = canvas
		this.ctx = ctx
		this.map = map
		this.offset = {x: 0, y: 0}

		this.tileImage = null
		this.treeType = []
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
		for(var tree of this.map.removedTrees){
			this.ctx.fillStyle = '#171'
			this.ctx.fillRect(tree.x*this.map.tileWidth - this.offset.x, tree.y*this.map.tileHeight - this.offset.y, this.map.tileWidth, this.map.tileHeight)
			this.ctx.strokeStyle = '#040'
			this.ctx.lineWidth = .5
			this.ctx.strokeRect(tree.x*this.map.tileWidth - this.offset.x, tree.y*this.map.tileHeight - this.offset.y , this.map.tileWidth, this.map.tileHeight)
		}

		var farms = []
		var villagers = []
		var houses = []
		var treesaplings = []
		for(var entity of this.map.entities){
			if(entity instanceof Farm){
				farms.push(entity)
			}else if(entity instanceof Villager){
				villagers.push(entity)
			}else if(entity instanceof House){
				houses.push(entity)
			}else if(entity.type === 'treesapling'){
				treesaplings.push(entity)
			}
		}

		for(var entity of farms){
			this.ctx.save()
			this.ctx.translate(
				entity.pos.x - this.offset.x,
				entity.pos.y - this.offset.y
			)
			this.ctx.drawImage(entity.image, -entity.image.width/2, -entity.image.height/2)
			this.ctx.restore()
		}

		for(var entity of treesaplings){
			this.ctx.save()
			this.ctx.translate(
				entity.pos.x - this.offset.x,
				entity.pos.y - this.offset.y
			)
			this.ctx.drawImage(entity.image, -entity.image.width/2, -entity.image.height/2)
			this.ctx.restore()
		}

		for(var entity of houses){
			if(entity.built){
				continue
			}
			this.ctx.save()
			this.ctx.translate(
				entity.pos.x - this.offset.x,
				entity.pos.y - this.offset.y
			)
			this.ctx.drawImage(entity.image, -entity.image.width/2, -entity.image.height/2)
			this.ctx.restore()
		}

		for(var entity of villagers){
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
			if(!entity.built){
				continue
			}
			this.ctx.save()
			this.ctx.translate(
				entity.pos.x - this.offset.x,
				entity.pos.y - this.offset.y
			)
			this.ctx.drawImage(entity.image, -entity.image.width/2, -entity.image.height/2)

			this.ctx.font = 'bold 25px arial'
			this.ctx.textAlign = 'center'
			this.ctx.textBaseline = 'middle'
			if(entity.food > C.HOUSE_MAX_FOOD * .5){
				this.ctx.fillStyle = 'green'
			}else if(entity.food > 0){
				this.ctx.fillStyle = 'yellow'
			}else if(entity.inactive){
				this.ctx.fillStyle = '#333'
			}else{
				this.ctx.fillStyle = 'red'
			}
			this.ctx.fillText(entity.food, 0, 1)
			this.ctx.restore()
		}

		this.renderTrees()

		if(controller.placingHouse){
			var absPos = {x: controller.mousePos.x + this.offset.x, y: controller.mousePos.y + this.offset.y}
			if(map.atPixel(absPos) === undefined && !map.entityAtPixel(absPos)){
				this.renderImageAtTile(I.HOUSE, absPos)
			}
		}
		if(controller.placingFarm){
			var absPos = {x: controller.mousePos.x + this.offset.x, y: controller.mousePos.y + this.offset.y}
			if(map.atPixel(absPos) === undefined && !map.entityAtPixel(absPos)){
				this.renderImageAtTile(I.FARM_BARE, absPos)
			}
		}
		if(controller.placingTree){
			var absPos = {x: controller.mousePos.x + this.offset.x, y: controller.mousePos.y + this.offset.y}
			if(map.atPixel(absPos) === undefined && !map.entityAtPixel(absPos)){
				this.renderImageAtTile(I.TREE, absPos)
			}
		}
		if(controller.deleting){
			var absPos = {x: controller.mousePos.x + this.offset.x, y: controller.mousePos.y + this.offset.y}
			var entity = map.entityAtPixel(absPos)
			if(entity && entity.type !== 'villager' && entity.type !== 'treesapling'){
				this.renderImageAtTile(I.DELETE, absPos)
			}
		}
	}

	renderTiles(){
		if(!this.tileImage){
			this.updateTileImage()
		}
		this.ctx.drawImage(this.tileImage, -this.offset.x, -this.offset.y)
	}

	renderTrees(){
		// Render tree layer
		for(var x = 0; x < this.map.width; x++){
			for(var y = 0; y < this.map.height; y++){
				if(this.map.data[x][y] !== 'tree'){
					continue
				}
				if(this.treeType[x] === undefined){
					this.treeType[x] = []
				}
				if(this.treeType[x][y] === undefined){
					var treeType = 'green'
					if(Math.random() < C.TREE_BROWN_PERCENT){
						treeType = 'brown'
					}
					this.treeType[x][y] = treeType
				}
				var treeImage = I.TREE
				if(this.treeType[x][y] === 'brown'){
					treeImage = I.TREE_BROWN
				}
				this.ctx.drawImage(
					treeImage,
					x*this.map.tileWidth - I.TREE.width/2 + this.map.tileWidth/2 - this.offset.x,
					y*this.map.tileHeight - I.TREE.height/2 + this.map.tileHeight/2 - this.offset.y
				)
			}
		}
	}

	updateTileImage(){
		var canvas = document.createElement('canvas')
		var ctx = canvas.getContext('2d')
		canvas.width = this.map.width * this.map.tileWidth
		canvas.height = this.map.height * this.map.tileHeight
		this.tileCanvas = canvas
		this.tileCtx = ctx

		for(var x = 0; x < this.map.width; x++){
			for(var y = 0; y < this.map.height; y++){
				switch(this.map.data[x][y]){
					case 'water':
						ctx.fillStyle = '#008'
						ctx.strokeStyle = '#22a'
						break
					case 'tree':
						ctx.fillStyle = '#171'
						ctx.strokeStyle = '#040'
						break
					default:
						ctx.fillStyle = '#171'
						ctx.strokeStyle = '#040'
				}
				ctx.fillRect(x*this.map.tileWidth, y*this.map.tileHeight, this.map.tileWidth, this.map.tileHeight)
				ctx.lineWidth = .5
				ctx.strokeRect(x*this.map.tileWidth, y*this.map.tileHeight, this.map.tileWidth, this.map.tileHeight)
			}
		}

		this.tileImage = new Image()
		this.tileImage.src = canvas.toDataURL()
	}
}

module.exports = View
