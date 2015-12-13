'use strict'

var C = require('./constants.js')
var I = require('./image.js')

class TreeSapling{
	constructor(map, pos){
		this.type = 'treesapling'
		this.map = map
		this.pos = pos
		this.image = I.TREE_UNPLANTED
		this.state = 'unplanted'
		this.activeVillager = null

		this.growthTimer = 0
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}

	plant(){
		this.state = 'growing'
		this.growthTimer = C.TREE_GROWTH_TIME
		this.activeVillager = null
	}

	update(delta){
		if(this.state !== 'growing'){
			return
		}

		if(this.growthTimer > 0){
			this.growthTimer -= delta
		}else{
			this.map.data[this.tile.x][this.tile.y] = 'tree'
			this.map.entities.splice(this.map.entities.indexOf(this), 1)
			return
		}

		if(this.growthTimer < C.TREE_GROWTH_TIME*.7){
			this.image = I.TREE_GROWING
		}
	}
}

module.exports = TreeSapling
