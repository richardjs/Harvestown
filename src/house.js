'use strict'

var Villager = require('./villager.js')

var HOUSE_IMAGE = new Image()
HOUSE_IMAGE.src = require('../img/house.png')

class House{
	constructor(map, pos){
		this.map = map
		this.pos = pos
		this.image = HOUSE_IMAGE

		this.map.entities.push(new Villager(this.map, {x: pos.x, y: pos.y}))
	}

	update(){}
}

module.exports = House
