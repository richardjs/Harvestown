'use strict'

class Controller{
	constructor(){
		this.mousePos = {x: 0, y: 0}
		this.draggingView = false
		this.mouseOut = false

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
	}
}

module.exports = Controller
