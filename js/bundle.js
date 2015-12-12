/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var MAP_WIDTH = 100;
	var MAP_HEIGHT = 100;

	var Map = __webpack_require__(1);
	var View = __webpack_require__(2);
	var Controller = __webpack_require__(3);

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

	document.body.appendChild(canvas);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	window.addEventListener('resize', function (e) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	});

	var map = new Map(MAP_WIDTH, MAP_HEIGHT);
	global.view = new View(canvas, ctx, map);
	var controller = new Controller();

	var lastTime = null;
	function frame(time) {
		if (lastTime === null) {
			var delta = time - lastTime;
			lastTime = time;
			requestAnimationFrame(frame);
			return;
		}

		var delta = time - lastTime;
		lastTime = time;

		view.render(canvas, ctx);

		requestAnimationFrame(frame);
	}
	frame();
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var WATER_CELL_RANDOM_START_CHANCE = .47;
	var WATER_GENERATIONS = 50;
	var TREE_CELL_RANDOM_START_CHANCE = .43;
	var TREE_GENERATIONS = 100;

	var Map = function Map(width, height) {
		var _this = this;

		_classCallCheck(this, Map);

		this.width = width;
		this.height = height;

		this.data = [];
		for (var i = 0; i < width; i++) {
			this.data.push([]);
		}

		var map = new ROT.Map.Cellular(width, height);
		map.randomize(TREE_CELL_RANDOM_START_CHANCE);
		for (var i = 0; i < TREE_GENERATIONS; i++) {
			map.create();
		}
		map.create(function (x, y, value) {
			if (value) {
				_this.data[x][y] = 'tree';
			}
		});

		map = new ROT.Map.Cellular(width, height);
		map.randomize(WATER_CELL_RANDOM_START_CHANCE);
		for (var i = 0; i < WATER_GENERATIONS; i++) {
			map.create();
		}
		map.create(function (x, y, value) {
			if (value) {
				_this.data[x][y] = 'water';
			}
		});
	};

	module.exports = Map;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TILE_WIDTH = 20;
	var TILE_HEIGHT = 20;

	var View = (function () {
		function View(canvas, ctx, map) {
			_classCallCheck(this, View);

			this.canvas = canvas;
			this.ctx = ctx;
			this.map = map;
			this.offset = { x: 0, y: 0 };
		}

		_createClass(View, [{
			key: 'move',
			value: function move(vector) {
				this.offset.x += vector.x;
				if (this.offset.x < 0) {
					this.offset.x = 0;
				} else if (this.offset.x + this.canvas.width >= this.map.width * TILE_WIDTH) {
					this.offset.x = this.map.width * TILE_WIDTH - this.canvas.width - 2;
				}
				this.offset.y += vector.y;
				if (this.offset.y < 0) {
					this.offset.y = 0;
				} else if (this.offset.y + this.canvas.height >= this.map.height * TILE_HEIGHT) {
					this.offset.y = this.map.height * TILE_HEIGHT - this.canvas.height - 2;
				}
			}
		}, {
			key: 'render',
			value: function render() {
				var tileOffset = {
					x: Math.floor(this.offset.x / TILE_WIDTH),
					y: Math.floor(this.offset.y / TILE_HEIGHT)
				};
				var pixelOffset = {
					x: this.offset.x % TILE_WIDTH,
					y: this.offset.y % TILE_HEIGHT
				};
				for (var x = 0; x < this.map.width; x++) {
					for (var y = 0; y < this.map.height; y++) {
						if (!this.map.data[x + tileOffset.x]) {
							continue;
						}
						switch (this.map.data[x + tileOffset.x][y + tileOffset.y]) {
							case 'water':
								this.ctx.fillStyle = 'blue';
								break;
							case 'tree':
								this.ctx.fillStyle = '#840';
								break;
							default:
								this.ctx.fillStyle = 'green';
						}
						this.ctx.fillRect(x * TILE_WIDTH - pixelOffset.x, y * TILE_HEIGHT - pixelOffset.y, TILE_WIDTH, TILE_HEIGHT);
					}
				}
			}
		}]);

		return View;
	})();

	module.exports = View;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Controller = function Controller() {
		var _this = this;

		_classCallCheck(this, Controller);

		this.mousePos = { x: 0, y: 0 };
		this.draggingView = false;
		this.mouseOut = false;

		document.addEventListener('mousedown', function (e) {
			switch (e.button) {
				case 2:
					_this.draggingView = true;
					_this.mousePos.x = e.clientX;
					_this.mousePos.y = e.clientY;
					break;
			}
		});
		document.addEventListener('mouseup', function (e) {
			switch (e.button) {
				case 2:
					_this.draggingView = false;
					break;
			}
		});
		document.addEventListener('mousemove', function (e) {
			if (_this.draggingView) {
				if (!_this.mouseOut) {
					view.move({
						x: _this.mousePos.x - e.clientX,
						y: _this.mousePos.y - e.clientY
					});
				}

				_this.mousePos.x = e.clientX;
				_this.mousePos.y = e.clientY;
				_this.mouseOut = false;
			}
		});
		document.addEventListener('mouseout', function (e) {
			_this.mouseOut = true;
		});
		document.addEventListener('contextmenu', function (e) {
			e.preventDefault();
		});
	};

	module.exports = Controller;

/***/ }
/******/ ]);