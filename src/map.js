'use strict'

var C = require('./constants.js')
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
		this.entities.push(new House(this, {x: 50, y: 50}))
		this.entities.push(new House(this, {x: 70, y: 50}))
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

	in(pos){
		return !(pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height)
	}

	at(pos){
		if(!this.in(pos)){
			return 'water'
		}
		return this.data[pos.x][pos.y]
	}

	atPixel(pos){
		return this.data[Math.floor(pos.x / this.tileWidth)][Math.floor(pos.y / this.tileHeight)]
	}
}

module.exports = Map
