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
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}
	
	plant(){
		this.state = 'planted'
		this.growthTimer = C.FARM_GROWTH_TIME
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

		if(this.growthTimer < C.FARM_GROWTH_TIME*.66){
			this.image = I.FARM_SPROUTS
		}
		if(this.growthTimer < C.FARM_GROWTH_TIME*.33){
			this.image = I.FARM_GROWING
		}
	}
}

module.exports = Farm
