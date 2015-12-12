'use strict'

var WATER_CELL_RANDOM_START_CHANCE = .47
var WATER_GENERATIONS = 50
var TREE_CELL_RANDOM_START_CHANCE = .43
var TREE_GENERATIONS = 100

class Map{
	constructor(width, height){
		this.width = width
		this.height = height

		this.data = []
		for(var i = 0; i < width; i++){
			this.data.push([])
		}

		var map = new ROT.Map.Cellular(width, height)
		map.randomize(TREE_CELL_RANDOM_START_CHANCE)
		for(var i = 0; i < TREE_GENERATIONS; i++){
			map.create()
		}
		map.create((x, y, value) => {
			if(value){
				this.data[x][y] = 'tree'
			}
		})

		map = new ROT.Map.Cellular(width, height)
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
}

module.exports = Map
