'use strict'

var VILLAGER_SPEED = 20

class Villager{
	constructor(map, pos){
		this.map = map
		this.pos = pos
		this.angle = 0
		this.path = []

		this.pixelTarget = null
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}

	goToTile(pos){
		this.path = []
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
			var dx = Math.cos(this.angle) * VILLAGER_SPEED * delta/1000
			var dy = Math.sin(this.angle) * VILLAGER_SPEED * delta/1000

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
		}
	}
}

module.exports = Villager
