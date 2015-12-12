'use strict'

var I = require('./image.js')

class Farm{
	constructor(map, pos){
		this.map = map
		this.pos = pos
		this.image = I.FARM_UNPLANTED
		this.state = 'unplanted'
		this.activeVillager = null
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}
	
	plant(){
		this.state = 'planted'
		this.image = I.FARM_BARE
		this.activeVillager = null
	}

	update(delta){

	}
}

module.exports = Farm
