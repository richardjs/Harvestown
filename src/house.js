'use strict'

var C = require('./constants.js')
var I = require('./image.js')
var Villager = require('./villager.js')

class House{
	constructor(map, pos, startingHouse){
		this.type = 'house'
		this.map = map
		this.pos = pos
		this.image = I.HOUSE_FOUNDATION

		this.villager = null

		this.lumber = 0

		this.food = 0
		if(startingHouse){
			this.lumber = C.HOUSE_REQUIRED_LUMBER
			this.food = C.HOUSE_STARTING_FOOD
			this.image = I.HOUSE
			this.spawnVillager()
		}

		this.inactive = false
	
		this.activeVillager = null
	}

	get built(){
		return this.lumber === C.HOUSE_REQUIRED_LUMBER
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}

	build(){
		this.lumber++
		if(this.built){
			this.image = I.HOUSE
			this.spawnVillager()
		}
	}

	spawnVillager(){
		this.villager = new Villager(this.map, this)
		this.map.entities.push(this.villager)
	}

	update(){}
}

module.exports = House
