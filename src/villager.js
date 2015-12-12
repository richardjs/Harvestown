'use strict'

class Villager{
	constructor(map, pos){
		this.map = map
		this.pos = pos
		this.path = []
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}

	goToTile(pos){
		var dijkstra = new ROT.Path.Dijkstra(pos.x, pos.y, (x, y) => {
			return this.map.at({x: x, y: y}) !== 'water'
		})
		dijkstra.compute(this.tile.x, this.tile.y, (x, y) => {
			this.path.push({x: x, y: y})
		})
	}
}

module.exports = Villager
