'use strict'

var Villager = require('./villager.js')

var WATER_CELL_RANDOM_START_CHANCE = .47
var WATER_GENERATIONS = 50
var TREE_CELL_RANDOM_START_CHANCE = .43
var TREE_GENERATIONS = 100

class Map{
	constructor(width, height, tileWidth, tileHeight){
		this.width = width
		this.height = height
		this.tileWidth = tileWidth
		this.tileHeight = tileHeight

		this.data = []
		for(var i = 0; i < width; i++){
			this.data.push([])
		}
		this.generateGeography()

		this.entities = []
		this.entities.push(new Villager(this, {x: 50, y: 50}))
	}

	generateGeography(){
		var map = new ROT.Map.Cellular(this.width, this.height)
		map.randomize(TREE_CELL_RANDOM_START_CHANCE)
		for(var i = 0; i < TREE_GENERATIONS; i++){
			map.create()
		}
		map.create((x, y, value) => {
			if(value){
				this.data[x][y] = 'tree'
			}
		})

		map = new ROT.Map.Cellular(this.width, this.height)
		map.randomize(WATER_CELL_RANDOM_START_CHANCE)
		for(var i = 0; i < WATER_GENERATIONS; i++){
			map.create()
		}
		map.create((x, y, value) => {
			if(value){
				this.data[x][y] = 'water'
			}
		})
	}

	at(pos){
		if(pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height){
			return 'water'
		}
		return this.data[pos.x][pos.y]
	}

	atPixel(pos){
		return this.data[Math.floor(pos.x / this.tileWidth)][Math.floor(pos.y / this.tileHeight)]
	}
}

module.exports = Map
