'use strict'

var I = require('./image.js')
var Villager = require('./villager.js')

class House{
	constructor(map, pos){
		this.map = map
		this.pos = pos
		this.image = I.HOUSE

		this.map.entities.push(new Villager(this.map, this))
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}

	update(){}
}

module.exports = House
