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
		this.activeSapling = null

		this.pauseTimer = 0
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

	findDepot(){
		var depot = null
		if(this.house.food < C.HOUSE_MAX_FOOD){
			depot = this.house
		}else{
			var closestDepot = null
			var closestDistance = Infinity
			for(var entity of this.map.entities){
				if(entity.type === 'house' && entity.built && entity.food < C.HOUSE_MAX_FOOD){
					var distance = this.distanceTo(entity)
					if(distance < closestDistance){
						closestDepot = entity
						closestDistance = distance
					}
				}
			}
			depot = closestDepot
		}
		return depot
	}

	distanceTo(entity){
		return Math.sqrt(Math.pow(entity.pos.x - this.pos.x, 2) + Math.pow(entity.pos.y - this.pos.y, 2))
	}

	update(delta){
		if(this.carryingLumber){
			this.image = I.VILLAGER_LUMBER
		}else if(this.carryingFood){
			this.image = I.VILLAGER_FOOD
		}else{
			this.image = I.VILLAGER
		}

		// Grow hungry
		if(this.hungerTimer > 0){
			this.hungerTimer -= delta
		}else{
			this.hungry = true
		}

		// If we're walking somewhere, keep going
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

			return
		}
		
		// Past here, we've stopped walking, and thus need to make a decision about what to do
		
		// If we're hungry, go home, or eat if we are home
		if(this.hungry && !this.carryingLumber && !this.carryingFood && this.pauseTimer <= 0){
			// Abandon projects so someone else can work on them
			if(this.activeHouse){
				this.activeHouse.activeVillager = null
				this.activeHouse = null
			}
			if(this.activeFarm){
				this.activeFarm.activeVillager = null
				this.activeFarm = null
			}

			// If we're at home
			if(this.tile.x === this.house.tile.x && this.tile.y === this.house.tile.y){
				// If we have food, eat it
				if(this.house.food > 0){
					this.hungry = false
					this.hungerTimer = C.VILLAGER_HUNGER_TIME
					this.house.food--
				}
				// Else, become inactive
				else{
					this.house.inactive = true
					this.carryingFood = false
					this.carryingLumber = false
					this.pauseTimer = 0
				}
			}
			// Else, go home
			else{
				this.goToTile(this.house.tile)
				this.pauseTimer = C.VILLAGER_WORK_TIME
			}
			return
		}

		// If we're pausing, pause
		if(this.pauseTimer > 0){
			this.pauseTimer -= delta
			return
		}
		
			
		// activeFarm indicates we're working a farm
		if(this.activeFarm){
			// If we're at the farm, work it
			if(this.activeFarm.tile.x === this.tile.x && this.activeFarm.tile.y === this.tile.y){
				switch(this.activeFarm.state){
					// Plant the farm if unplanted
					case 'unplanted':
						this.activeFarm.plant()
						this.activeFarm = null
						break

					// Harvest the farm if matured (and there's a place to put it)
					case 'matured':
						// Depot is the place to take the food
						this.depot = this.findDepot()
						// If we have a depot, harvest the farm and walk to the depot
						if(this.depot){
							this.activeFarm.harvest()
							this.activeFarm = null
							this.carryingFood = true
							this.goToTile(this.depot.tile)
							this.pauseTimer = C.VILLAGER_WORK_TIME
						}
						// Else, forget about the farm
						else{
							this.activeFarm.activeVillager = null
							this.activeFarm = null
						}
						break
				}
			}
			
			// Else, we're not at the farm; go to it
			else{
				this.goToTile(this.activeFarm.tile)
				this.pauseTimer = C.VILLAGER_WORK_TIME
				// If there's no way to get to the farm, forget about it
				if(this.pixelTarget){
					this.activeFarm.activeVillager = null
					this.activeFarm = null
				}
			}
			return
		}

		// If we're carrying food, either drop it off at the depot or go to the depot
		if(this.carryingFood){
			// We're at the depot, drop food off
			if(this.depot.tile.x === this.tile.x && this.depot.tile.y === this.tile.y){
				// Only deposit if depot isn't full
				if(this.depot.food < C.HOUSE_MAX_FOOD){
					this.depot.food++
					this.depot.inactive = false
				}
				//Else if depot is full, try to find a new one
				else{
					var newDepot = this.findDepot()
					if(newDepot){
						this.depot = newDepot
						this.goToTile(newDepot.tile)
						this.pauseTimer = C.VILLAGER_WORK_TIME
						return
					}
				}
			}
			// Get rid of food if we're not at the depot (we tried to walk to it and failed)
			this.depot = null
			this.carryingFood = false
			return
		}

		// If we're building a house, find lumber or drop the lumber off
		if(this.activeHouse){
			// If we're carrying lumber, drop it off if we're at the house
			if(this.carryingLumber){
				// If we're at the house, drop it off
				if(this.tile.x === this.activeHouse.tile.x && this.tile.y === this.activeHouse.tile.y){
					this.activeHouse.build()
					this.carryingLumber = false
					// If the house is built, forget about it
					if(this.activeHouse.built){
						this.activeHouse.activeVillager = null
						this.activeHouse = null
					}
				}
				// If we're not at the house, forget about it (we tried to walk to it and failed)
				else{
					this.carryingLumber = false
					this.activeHouse.activeVillager = null
					this.activeHouse = null
				}
				return
			}
			
			// If we're not carrying lumber, find some
			else{
				// If standing next to a tree, cut it down and walk to the house
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
					map.removedTrees.push(tree)
					this.carryingLumber = true
					this.goToTile(this.activeHouse.tile)
					this.pauseTimer = C.VILLAGER_WORK_TIME
					return
				}

				// Else, search for a tree nearby
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
					tile = null
				}
				if(tile != null){
					this.goToTile(tile.prev)
					this.pauseTimer = C.VILLAGER_WORK_TIME
				}else{
					// We're out of trees. Forget about it.
					// This probably only happens if you use up all the trees on purpose.
					this.activeHouse.activeVillager = null
					this.activeHouse = null
				}
				return
			}
		}
		// If we're not buildling a house, see if there's one to work on
		else{
			for(var entity of this.map.entities){
				var closestHouse = null
				var closestDistance = Infinity
				if(entity.type === 'house' && !entity.built && !entity.activeVillager){
					var distance = this.distanceTo(entity)
					if(distance < closestDistance){
						closestHouse = entity
						closestDistance = distance
					}
				}
				if(closestHouse){
					this.activeHouse = closestHouse
					this.activeHouse.activeVillager = this
					return
				}
			}
		}

		// If we're planting a tree
		if(this.activeSapling){
			// We're at the sapligng location
			if(this.tile.x === this.activeSapling.tile.x && this.tile.y === this.activeSapling.tile.y){
				this.activeSapling.plant()
				this.activeSapling = null
				return
			}else{
				this.activeSapling.activeVillager = null
				this.activeSapling = null
			}
		}else{
			//Look for a sapling to work
			var closestSapling = null
			var closestDistance = Infinity
			for(var entity of this.map.entities){
				if(entity.type === 'treesapling' && !entity.activeVillager && entity.state === 'unplanted'){
					var distance = this.distanceTo(entity)
					if(distance < closestDistance){
						closestSapling = entity
						closestDistance = distance
					}
				}
			}
			if(closestSapling){
				this.activeSapling = closestSapling
				this.activeSapling.activeVillager = this
				this.goToTile(closestSapling.tile)
				this.pauseTimer = C.VILLAGER_WORK_TIME
				return
			}
		}

		// Look for farms to work
		var closestFarm = null
		var closestDistance = Infinity
		for(var entity of this.map.entities){
			if(entity.type === 'farm' && !entity.activeVillager && (entity.state === 'unplanted' || entity.state === 'matured')){
				if(entity.state === 'matured' && !this.findDepot()){
					continue
				}

				var distance = this.distanceTo(entity)
				if(distance < closestDistance){
					closestFarm = entity
					closestDistance = distance
				}
			}
		}
		if(closestFarm){
			closestFarm.activeVillager = this
			this.activeFarm = closestFarm
			this.goToTile(closestFarm.tile)
			this.pauseTimer = C.VILLAGER_WORK_TIME
			if(this.path.pixelTarget !== null){
				return
			}else{
				this.activeFarm.activeVillager = null
				this.activeFarm = null
			}
		}

		// If none of the above applies, wander about the house
		this.wander(this.house.pos)
	}
}

module.exports = Villager
