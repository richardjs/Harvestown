'use strict'

// Map size
exports.MAP_WIDTH = 100
exports.MAP_HEIGHT = 100

// Tile size (game pixels, not view pixels)
exports.TILE_WIDTH = 20
exports.TILE_HEIGHT = 20

// Villager parameters
exports.VILLAGER_SPEED = 20
exports.VILLAGER_WANDER_RANGE = 5
exports.VILLAGER_HUNGER_TIME = 60*1000

//Farm parameters
exports.FARM_GROWTH_TIME = 60*3.5*1000
exports.FARM_WATER_REDUCTION = exports.FARM_GROWTH_TIME*.1

// House parameters
exports.HOUSE_STARTING_FOOD = 3
exports.HOUSE_MAX_FOOD = 5
exports.HOUSE_REQUIRED_LUMBER = 5

// Map generation parameters
exports.WATER_CELL_RANDOM_START_CHANCE = .47
exports.WATER_GENERATIONS = 50
exports.TREE_CELL_RANDOM_START_CHANCE = .43
exports.TREE_GENERATIONS = 100
exports.TREE_BROWN_PERCENT = .30

// Technical engine parameters
exports.MAX_FRAME_DELTA = 100
