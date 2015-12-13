'use strict'

var C = require('./constants.js')
var Farm = require('./farm.js')
var House = require('./house.js')
var Villager = require('./villager.js')
var TreeSapling = require('./treesapling.js')

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
		if(this.atPixel(farmPos) !== undefined || this.entityAtPixel(farmPos)){
			return
		}
		this.entities.push(new Farm(this, farmPos))
	}

	placeHouse(pos){
		var housePos = this.tileToPixel(this.pixelToTile(pos))
		if(this.atPixel(housePos) !== undefined || this.entityAtPixel(housePos)){
			return
		}
		var firstHouse = true
		for(var entity of this.entities){
			if(entity.type === 'house'){
				firstHouse = false
				break
			}
		}
		this.entities.push(new House(this, housePos, firstHouse))
	}

	placeTree(pos){
		var treePos = this.tileToPixel(this.pixelToTile(pos))
		if(this.atPixel(treePos) !== undefined || this.entityAtPixel(treePos)){
			return
		}
		this.entities.push(new TreeSapling(this, treePos))
	}

	deleteEntity(pos){
		pos = this.tileToPixel(this.pixelToTile(pos))
		var entity = this.entityAtPixel(pos)
		if(entity && entity.type !== 'villager' && entity.type !== 'treesapling'){
			if(entity.activeVillager){
				entity.activeVillager.activeFarm = null
				entity.activeVillager.activeHouse = null
				entity.activeVillager.activeSapling = null
				entity.activeVillager.carryingFood = false
				entity.activeVillager.carryingLumber = false
				entity.activeVillager.path = []
				entity.activeVillager.pixelTarget = null
			}
			if(entity.villager){
				this.entities.splice(this.entities.indexOf(entity.villager), 1)
			}
			this.entities.splice(this.entities.indexOf(entity), 1)
		}
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

	entityAt(pos){
		for(var entity of this.entities){
			if(entity.tile && entity.type !== 'villager'){
				if(entity.tile.x === pos.x && entity.tile.y === pos.y){
					return entity
				}
			}
		}
		return false
	}

	entityAtPixel(pos){
		var tile = this.pixelToTile(pos)
		return this.entityAt(tile)
	}

	pixelToTile(pos){
		return {x: Math.floor(pos.x / this.tileWidth), y: Math.floor(pos.y / this.tileHeight)}
	}

	tileToPixel(pos){
		return {x: pos.x*this.tileWidth + this.tileWidth/2, y: pos.y*this.tileHeight + this.tileHeight/2}
	}
}

module.exports = Map
