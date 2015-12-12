'use strict'

var MAP_WIDTH = 100
var MAP_HEIGHT = 100

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

var map = new Map(MAP_WIDTH, MAP_HEIGHT)
global.view = new View(canvas, ctx, map)
var controller = new Controller()

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

	view.render(canvas, ctx)
	
	requestAnimationFrame(frame)
}
frame()
