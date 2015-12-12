'use strict'

var C = require('./constants.js')
var I = require('./image.js')


class Villager{
	constructor(map, house){
		this.map = map
		this.house = house
		this.pos = {x: house.pos.x, y: house.pos.y}
		this.angle = 0
		this.path = []
		this.image = I.VILLAGER

		this.pixelTarget = null
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}

	goToTile(pos){
		this.path = []
		if(map.at(pos) === 'water'){
			return
		}
		var dijkstra = new ROT.Path.Dijkstra(pos.x, pos.y, (x, y) => {
			return this.map.at({x: x, y: y}) !== 'water'
		})
		dijkstra.compute(this.tile.x, this.tile.y, (x, y) => {
			this.path.push({x: x, y: y})
		})
		this.path.shift()
		this.nextPathNode()
	}

	setPixelTarget(pos){
		this.pixelTarget = pos
		this.angle = Math.atan2(
			this.pixelTarget.y - this.pos.y,
			this.pixelTarget.x - this.pos.x
		)
	}

	setMapTarget(pos){
		this.setPixelTarget({
			x: pos.x*this.map.tileWidth + this.map.tileWidth/2,
			y: pos.y*this.map.tileHeight + this.map.tileHeight/2
		})
	}

	nextPathNode(){
		if(this.path.length === 0){
			this.pixelTarget = null
			return
		}
		this.setMapTarget(this.path.shift())
	}

	update(delta){
		if(this.pixelTarget){
			var dx = Math.cos(this.angle) * C.VILLAGER_SPEED * delta/1000
			var dy = Math.sin(this.angle) * C.VILLAGER_SPEED * delta/1000

			if(Math.abs(this.pos.x - this.pixelTarget.x) < Math.abs(dx)){
				this.pos.x = this.pixelTarget.x
			}else{
				this.pos.x += dx
			}
			if(Math.abs(this.pos.y - this.pixelTarget.y) < Math.abs(dy)){
				this.pos.y = this.pixelTarget.y
			}else{
				this.pos.y += dy
			}

			if(this.pos.x === this.pixelTarget.x && this.pos.y === this.pixelTarget.y){
				this.nextPathNode()
			}
		}else{
			var wanderRange = 5
			this.goToTile({
				x: Math.round(this.map.pixelToTile(this.house.pos).x + (Math.random()*2*wanderRange - wanderRange)),
				y: Math.round(this.map.pixelToTile(this.house.pos).y + (Math.random()*2*wanderRange - wanderRange))
			})
		}
	}
}

module.exports = Villager
