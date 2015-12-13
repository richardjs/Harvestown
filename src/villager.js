'use strict'

var C = require('./constants.js')
var I = require('./image.js')
var Farm = require('./farm.js')
var House = require('./house.js')

class Villager{
	constructor(map, house){
		this.type = 'villager'
		this.map = map
		this.house = house
		this.pos = {x: house.pos.x, y: house.pos.y}
		this.angle = 0
		this.path = []

		this.hungry = false
		this.hungerTimer = C.VILLAGER_HUNGER_TIME
		this.carryingFood = false
		this.depot = null

		this.image = I.VILLAGER

		this.pixelTarget = null
		this.activeFarm = null
		this.activeHouse = null
	}

	get tile(){
		return {x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight)}
	}

	goToTile(pos){
		this.path = []
		if(this.map.at(pos) !== undefined){
			return
		}
		var dijkstra = new ROT.Path.Dijkstra(pos.x, pos.y, (x, y) => {
			var at = this.map.at({x: x, y: y})
			return at === undefined
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

	wander(center){
		var wanderRange = C.VILLAGER_WANDER_RANGE
		this.goToTile({
			x: Math.round(this.map.pixelToTile(center).x + (Math.random()*2*wanderRange - wanderRange)),
			y: Math.round(this.map.pixelToTile(center).y + (Math.random()*2*wanderRange - wanderRange))
		})
	}

	update(delta){
		if(this.hungerTimer > 0){
			this.hungerTimer -= delta
		}else{
			this.hungry = true
		}

		if(this.pixelTarget){
			// We're going somewhere
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
			// We're stopped
			
			// If we're at the farm we were heading to, work it
			if(this.activeFarm){
				if(this.activeFarm.tile.x === this.tile.x && this.activeFarm.tile.y === this.tile.y){
					switch(this.activeFarm.state){
						case 'unplanted':
							this.activeFarm.plant()
							this.activeFarm = null
							break

						case 'matured':
							this.depot = null
							if(this.house.food < C.HOUSE_MAX_FOOD){
								this.depot = this.house
							}else{
								for(var entity of this.map.entities){
									if(entity instanceof House.constructor){
										if(!entity.built){
											continue
										}
										if(entity.food < C.HOUSE_MAX_FOOD){
											this.depot = entity
											break
										}
									}
								}
							}
							if(this.depot){
								this.activeFarm.harvest()
								this.activeFarm = null
								this.carryingFood = true
								this.goToTile(this.depot.tile)
							}else{
								this.wander(this.activeFarm.pos)
								this.activeFarm.activeVillager = null
								this.activeFarm = null
							}
							break
					}
				}else{
					this.goToTile(this.activeFarm.tile)
					if(this.path.length === 0){
						this.activeFarm.activeVillager = null
						this.activeFarm = null
					}
				}
				return
			}

			if(this.carryingFood){
				if(this.depot.tile.x === this.tile.x && this.depot.tile.y === this.tile.y){
					if(this.depot.food < C.HOUSE_MAX_FOOD){
						this.depot.food++
					}
				}
				this.depot = null
				this.carryingFood = false
				return
			}

			// If we're hungry, go home, or eat if we are home
			if(this.hungry){
				if(this.tile.x === this.house.tile.x && this.tile.y === this.house.tile.y){
					if(this.house.food > 0){
						this.hungry = false
						this.hungerTimer = C.VILLAGER_HUNGER_TIME
						this.house.food--
					}
				}else{
					this.goToTile(this.house.tile)
				}
				return
			}

			if(this.activeHouse){
				if(this.carryingLumber){
					if(this.tile.x === this.activeHouse.tile.x && this.tile.y === this.activeHouse.tile.y){
						this.activeHouse.build()
						this.carryingLumber = false
						if(this.activeHouse.built){
							this.activeHouse.activeVillager = null
							this.activeHouse = null
						}
					}else{
						this.carryingLumber = false
						this.activeHouse.activeVillager = null
						this.activeHouse = null
					}
					return
				}else{
					// If standing next to a tree, cut it down
					var tree = null
					if(map.at({x: this.tile.x - 1, y: this.tile.y - 1}) === 'tree') tree = {x: this.tile.x-1, y: this.tile.y-1} 
					if(map.at({x: this.tile.x - 1, y: this.tile.y + 1}) === 'tree') tree = {x: this.tile.x-1, y: this.tile.y+1}
					if(map.at({x: this.tile.x + 1, y: this.tile.y - 1}) === 'tree') tree = {x: this.tile.x+1, y: this.tile.y-1}
					if(map.at({x: this.tile.x + 1, y: this.tile.y + 1}) === 'tree') tree = {x: this.tile.x+1, y: this.tile.y+1}
					if(map.at({x: this.tile.x - 1, y: this.tile.y}) === 'tree') tree = {x: this.tile.x-1, y: this.tile.y}
					if(map.at({x: this.tile.x + 1, y: this.tile.y}) === 'tree') tree = {x: this.tile.x+1, y: this.tile.y}
					if(map.at({x: this.tile.x, y: this.tile.y - 1}) === 'tree') tree = {x: this.tile.x, y: this.tile.y-1}
					if(map.at({x: this.tile.x, y: this.tile.y + 1}) === 'tree') tree = {x: this.tile.x, y: this.tile.y+1}
					if(tree){
						map.data[tree.x][tree.y] = undefined
						view.updateTileImage(tree)
						this.carryingLumber = true
						this.goToTile(this.activeHouse.tile)
						return
					}

					// Search for a tree nearby
					var crumbs = []
					var queue = [this.tile]
					while(queue.length){
						var tile = queue.shift()
						if(map.at(tile) === 'tree'){
							break;
						}
						if(map.at(tile) !== undefined){
							continue;
						}

						if(crumbs[tile.x] === undefined){
							crumbs[tile.x] = []
						}
						if(crumbs[tile.x-1] === undefined){
							crumbs[tile.x-1] = []
						}
						if(crumbs[tile.x+1] === undefined){
							crumbs[tile.x+1] = []
						}
						crumbs[tile.x][tile.y] = true
						
						if(!crumbs[tile.x-1][tile.y]){
							queue.push({x: tile.x-1, y: tile.y, prev: tile})
							crumbs[tile.x-1][tile.y] = true
						}
						if(!crumbs[tile.x+1][tile.y]){
							queue.push({x: tile.x+1, y: tile.y, prev: tile})
							crumbs[tile.x+1][tile.y] = true
						}
						if(!crumbs[tile.x][tile.y-1]){
							queue.push({x: tile.x, y: tile.y-1, prev: tile})
							crumbs[tile.x][tile.y-1] = true
						}
						if(!crumbs[tile.x][tile.y+1]){
							queue.push({x: tile.x, y: tile.y+1, prev: tile})
							crumbs[tile.x][tile.y+1] = true
						}
						if(!crumbs[tile.x-1][tile.y-1]){
							queue.push({x: tile.x-1, y: tile.y-1, prev: tile})
							crumbs[tile.x-1][tile.y-1] = true
						}
						if(!crumbs[tile.x-1][tile.y+1]){
							queue.push({x: tile.x-1, y: tile.y+1, prev: tile})
							crumbs[tile.x-1][tile.y+1] = true
						}
						if(!crumbs[tile.x+1][tile.y-1]){
							queue.push({x: tile.x+1, y: tile.y-1, prev: tile})
							crumbs[tile.x+1][tile.y-1] = true
						}
						if(!crumbs[tile.x+1][tile.y+1]){
							queue.push({x: tile.x+1, y: tile.y+1, prev: tile})
							crumbs[tile.x+1][tile.y+1] = true
						}
					}
					this.goToTile(tile.prev)
					return
				}
			}else{
				for(var entity of this.map.entities){
					if(entity.type === 'house' && !entity.built && !entity.activeVillager){
						this.activeHouse = entity
						this.activeHouse.activeVillager = this
						return
					}
				}
			}

			// Look for farms to work
			for(var entity of this.map.entities){
				if(entity instanceof Farm){
					if(entity.state === 'unplanted' || entity.state === 'matured'){
						if(entity.activeVillager){
							continue
						}
						console.log('farming')
						entity.activeVillager = this
						this.activeFarm = entity
						this.goToTile(entity.tile)
						if(this.path.pixelTarget !== null){
							return
						}
					}
				}
			}

			// Else, wander around near our house
			this.wander(this.house.pos)
		}
	}
}

module.exports = Villager
