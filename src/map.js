'use strict'

var C = require('./constants.js')
var Farm = require('./farm.js')
var House = require('./house.js')
var Villager = require('./villager.js')

class Map{
	constructor(width, height, tileWidth, tileHeight){
		this.width = width
		this.height = height
		this.tileWidth = tileWidth
		this.tileHeight = tileHeight

		this.generateGeography()

		this.entities = []
		this.removedTrees = []
	}

	generateGeography(){
		this.data = []
		for(var i = 0; i < this.width; i++){
			this.data.push([])
		}
		var map = new ROT.Map.Cellular(this.width, this.height)
		map.randomize(C.TREE_CELL_RANDOM_START_CHANCE)
		for(var i = 0; i < C.TREE_GENERATIONS; i++){
			map.create()
		}
		map.create((x, y, value) => {
			if(value){
				this.data[x][y] = 'tree'
			}
		})

		map = new ROT.Map.Cellular(this.width, this.height)
		map.randomize(C.WATER_CELL_RANDOM_START_CHANCE)
		for(var i = 0; i < C.WATER_GENERATIONS; i++){
			map.create()
		}
		map.create((x, y, value) => {
			if(value){
				this.data[x][y] = 'water'
			}
		})
	}

	placeFarm(pos){
		var farmPos = this.tileToPixel(this.pixelToTile(pos))
		if(this.atPixel(farmPos) !== undefined){
			return
		}
		for(var entity of this.entities){
			if(entity instanceof Villager){
				continue
			}
			if(entity.pos.x === farmPos.x && entity.pos.y === farmPos.y){
				return
			}
		}
		this.entities.push(new Farm(this, farmPos))
	}

	placeHouse(pos){
		var housePos = this.tileToPixel(this.pixelToTile(pos))
		if(this.atPixel(housePos) !== undefined){
			return
		}
		var firstHouse = true
		for(var entity of this.entities){
			if(entity.type !== 'house'){
				continue
			}
			firstHouse = false
			if(entity.pos.x === housePos.x && entity.pos.y === housePos.y){
				return
			}
		}
		this.entities.push(new House(this, housePos, firstHouse))
	}

	in(pos){
		return !(pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height)
	}

	at(pos){
		if(!this.in(pos)){
			return 'out'
		}
		return this.data[pos.x][pos.y]
	}

	atPixel(pos){
		return this.data[Math.floor(pos.x / this.tileWidth)][Math.floor(pos.y / this.tileHeight)]
	}

	pixelToTile(pos){
		return {x: Math.floor(pos.x / this.tileWidth), y: Math.floor(pos.y / this.tileHeight)}
	}

	tileToPixel(pos){
		return {x: pos.x*this.tileWidth + this.tileWidth/2, y: pos.y*this.tileHeight + this.tileHeight/2}
	}
}

module.exports = Map
