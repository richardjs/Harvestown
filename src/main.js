'use strict'

var C = require('./constants.js')
var Map = require('./map.js')
var View = require('./view.js')
var Controller = require('./controller.js')

var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')

function properHeight(){
	// Thanks http://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
	if(helpOn){
		return Math.max(
			document.body.scrollHeight,
			document.body.offsetHeight, 
			document.documentElement.clientHeight,
			document.documentElement.scrollHeight,
			document.documentElement.offsetHeight,
			window.innerHeight
		)
	}else{
		return window.innerHeight
	}
}

document.body.appendChild(canvas)
global.resizeCanvas = function(){
	canvas.width = window.innerWidth
	canvas.height = properHeight()
}
window.addEventListener('resize', resizeCanvas)
window.addEventListener('load', resizeCanvas)

global.map = new Map(C.MAP_WIDTH, C.MAP_HEIGHT, C.TILE_WIDTH, C.TILE_HEIGHT)
global.view = new View(canvas, ctx, map)
global.controller = new Controller(map)
global.helpBox = document.getElementById('instructions')
global.helpOn = true

var musicVolume = localStorage.getItem('ld34_music_volume') || .25
global.music = new Howl({
	urls: ['bgm/music.ogg'],
	volume: musicVolume,
	loop: true
}).play()

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
