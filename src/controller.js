'use strict'

class Controller{
	constructor(map){
		this.map = map
		this.mousePos = {x: 0, y: 0}

		this.draggingView = false
		this.placingHouse = false
		this.placingFarm = false

		this.mouseOut = false
		this.gameSpeed = 1

		document.addEventListener('mousedown', e => {
			switch(e.button){
				case 0:
					if(this.placingHouse){
						this.placingHouse = false
						this.map.placeHouse({x: this.mousePos.x + view.offset.x, y: this.mousePos.y + view.offset.y})
					}
					if(this.placingFarm){
						this.placingFarm = false
						this.map.placeFarm({x: this.mousePos.x + view.offset.x, y: this.mousePos.y + view.offset.y})
					}
					if(this.placingTree){
						this.placingTree = false
						this.map.placeTree({x: this.mousePos.x + view.offset.x, y: this.mousePos.y + view.offset.y})
					}
					if(this.deleting){
						this.deleting = false
						this.map.deleteEntity({x: this.mousePos.x + view.offset.x, y: this.mousePos.y + view.offset.y})
					}
					break
				case 2:
					this.draggingView = true
					this.mousePos.x = e.clientX
					this.mousePos.y = e.clientY
					this.placingFarm = false
					this.placingHouse = false
					this.placingTree = false
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
			}
			this.mousePos.x = e.clientX
			this.mousePos.y = e.clientY
			this.mouseOut = false
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
			//alert(e.keyCode)
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
				
				case 70:
					this.placingFarm = true
					this.placingHouse = false
					this.placingTree = false
					this.deleting = false
					break
				case 72:
					this.placingHouse = true
					this.placingFarm = false
					this.placingTree = false
					this.deleting = false
					break
				case 84:
					this.placingTree = true
					this.placingFarm = false
					this.placingHouse = false
					this.deleting = false
					break
				case 68:
				case 88:
					this.deleting = true
					this.placingFarm = false
					this.placingHouse = false
					this.placingTree = false
					break
				case 27:
					this.placingFarm = false
					this.placingHouse = false
					this.placingTree = false
					this.deleting = false
					if(helpOn){
						helpBox.style.display = 'none'
						helpOn = false
					}
					break

				case 173:
					music.volume(Math.max(music.volume() - .05, 0))
					localStorage.setItem('ld34_music_volume', music.volume())
					break
				case 61:
					music.volume(Math.min(music.volume() + .05, 1))
					localStorage.setItem('ld34_music_volume', music.volume())
					break
				case 77:
					if(music.paused){
						music.play()
						music.paused = false
					}else{
						music.pause()
						music.paused = true
					}
					break

				case 191:
					e.preventDefault()
					if(helpOn){
						helpBox.style.display = 'none'
						helpOn = false
					}else{
						helpBox.style.display = 'block'
						helpOn = true
					}
			}
		})
	}
}

module.exports = Controller
