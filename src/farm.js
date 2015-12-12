'use strict'

var C = require('./constants.js')
var I = require('./image.js')

class Farm{
	constructor(map, pos){
		this.map = map
		this.pos = pos
		this.image = I.FARM_UNPLANTED
		this.state = 'unplanted'
		this.activeVillager = null
		
		this.growthTimer = 0
		this.growthTime = C.FARM_GROWTH_TIME - this.countWaterNeighbors()*C.FARM_WATER_REDUCTION
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}

	countWaterNeighbors(){
		var count = 0
		if(map.at({x: this.tile.x - 1, y: this.tile.y}) === 'water') count++
		if(map.at({x: this.tile.x + 1, y: this.tile.y}) === 'water') count++
		if(map.at({x: this.tile.x, y: this.tile.y - 1}) === 'water') count++
		if(map.at({x: this.tile.x, y: this.tile.y + 1}) === 'water') count++
		if(map.at({x: this.tile.x - 1, y: this.tile.y - 1}) === 'water') count++
		if(map.at({x: this.tile.x - 1, y: this.tile.y + 1}) === 'water') count++
		if(map.at({x: this.tile.x + 1, y: this.tile.y - 1}) === 'water') count++
		if(map.at({x: this.tile.x + 1, y: this.tile.y + 1}) === 'water') count++
		return count
	}
	
	plant(){
		this.state = 'planted'
		this.growthTimer = this.growthTime
		this.image = I.FARM_BARE
		this.activeVillager = null
	}

	update(delta){
		if(this.state !== 'planted'){
			return
		}

		if(this.growthTimer > 0){
			this.growthTimer -= delta
			if(this.growthTimer <= 0){
				this.state = 'matured'
				this.image = I.FARM_MATURED
				return
			}
		}

		if(this.growthTimer < this.growthTime*.66){
			this.image = I.FARM_SPROUTS
		}
		if(this.growthTimer < this.growthTime*.33){
			this.image = I.FARM_GROWING
		}
	}
}

module.exports = Farm
