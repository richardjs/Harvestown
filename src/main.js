'use strict'

var C = require('./constants.js')
var Map = require('./map.js')
var View = require('./view.js')
var Controller = require('./controller.js')

var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')

document.body.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight
window.addEventListener('resize', e => {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
})

global.map = new Map(C.MAP_WIDTH, C.MAP_HEIGHT, C.TILE_WIDTH, C.TILE_HEIGHT)
global.view = new View(canvas, ctx, map)
global.controller = new Controller(map)

var lastTime = null;
function frame(time){
	if(lastTime === null){
		var delta = time - lastTime
		lastTime = time
		requestAnimationFrame(frame)
		return
	}

	var delta = time - lastTime
	lastTime = time

	delta *= controller.gameSpeed

	while(delta > 0){
		var frameDelta = Math.min(delta, C.MAX_FRAME_DELTA)
		delta -= frameDelta
		for(var entity of map.entities){
			entity.update(frameDelta)
		}
	}

	view.render(canvas, ctx)
	
	requestAnimationFrame(frame)
}
frame()
