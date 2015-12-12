'use strict'

var C = require('./constants.js')
var I = require('./image.js')
var Villager = require('./villager.js')

class House{
	constructor(map, pos, startingHouse){
		this.map = map
		this.pos = pos
		this.image = I.HOUSE

		this.food = 0
		if(startingHouse){
			this.food = C.HOUSE_STARTING_FOOD
		}

		this.map.entities.push(new Villager(this.map, this))
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}

	update(){}
}

module.exports = House
