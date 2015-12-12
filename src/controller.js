'use strict'

class Controller{
	constructor(){
		this.mousePos = {x: 0, y: 0}
		this.draggingView = false
		this.mouseOut = false
		this.gameSpeed = 1

		document.addEventListener('mousedown', e => {
			switch(e.button){
				case 2:
					this.draggingView = true
					this.mousePos.x = e.clientX
					this.mousePos.y = e.clientY
					break
			}
		})
		document.addEventListener('mouseup', e => {
			switch(e.button){
				case 2:
					this.draggingView = false
					break
			}
		})
		document.addEventListener('mousemove', e => {
			if(this.draggingView){
				if(!this.mouseOut){
					view.move({
						x: this.mousePos.x - e.clientX,
						y: this.mousePos.y - e.clientY
					})
				}

				this.mousePos.x = e.clientX
				this.mousePos.y = e.clientY
				this.mouseOut = false
			}
		})
		document.addEventListener('mouseout', e => {
			this.mouseOut = true
		})
		document.addEventListener('mouseover', e => {
			if(e.buttons < 2){
				this.draggingView = false
			}
		})
		document.addEventListener('contextmenu', e => {
			e.preventDefault()
		})

		document.addEventListener('keydown', e => {
			//console.log(e.keyCode)
			switch(e.keyCode){
				case 49:
					this.gameSpeed = 1
					break
				case 50:
					this.gameSpeed = 5
					break
				case 51:
					this.gameSpeed = 20
					break
				case 52:
					this.gameSpeed = 100
					break
			}
		})
	}
}

module.exports = Controller
