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
	var View = __webpack_require__(4);
	var Controller = __webpack_require__(5);

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
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Villager = __webpack_require__(2);

	var WATER_CELL_RANDOM_START_CHANCE = .47;
	var WATER_GENERATIONS = 50;
	var TREE_CELL_RANDOM_START_CHANCE = .43;
	var TREE_GENERATIONS = 100;

	var Map = (function () {
		function Map(width, height) {
			_classCallCheck(this, Map);

			this.width = width;
			this.height = height;

			this.data = [];
			for (var i = 0; i < width; i++) {
				this.data.push([]);
			}
			this.generateGeography();

			this.entities = [];
			this.entities.push(new Villager({ x: 50, y: 50 }));
		}

		_createClass(Map, [{
			key: 'generateGeography',
			value: function generateGeography() {
				var _this = this;

				var map = new ROT.Map.Cellular(this.width, this.height);
				map.randomize(TREE_CELL_RANDOM_START_CHANCE);
				for (var i = 0; i < TREE_GENERATIONS; i++) {
					map.create();
				}
				map.create(function (x, y, value) {
					if (value) {
						_this.data[x][y] = 'tree';
					}
				});

				map = new ROT.Map.Cellular(this.width, this.height);
				map.randomize(WATER_CELL_RANDOM_START_CHANCE);
				for (var i = 0; i < WATER_GENERATIONS; i++) {
					map.create();
				}
				map.create(function (x, y, value) {
					if (value) {
						_this.data[x][y] = 'water';
					}
				});
			}
		}]);

		return Map;
	})();

	module.exports = Map;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Villager = function Villager(pos) {
		_classCallCheck(this, Villager);

		this.pos = pos;
	};

	module.exports = Villager;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAaCAYAAAD1wA/qAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAFiQAABYkBbWid+gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAASESURBVFiFtZhbbBRlFMd/Z3Zmy25LC3W3tFuwhUSqRhq8YKhA3BcvJAY2RiQkElvAS2KMsTH6ZIpBH0wUw0NNMBIl0YhAUghBy4uiqVCjIJQAlSZAsXTthYUu23Znd2c+HwBpYK/t9Pc0M9/5zvmfmfOd+WZgGglVVgZDlZXBTOdOok+H0/+xrJabR4fTnjuI3DpQu98uT1rSouBJhI/ca7fuFUHl62i13/8hmnbYbRjHU6YZskU2CCwDEJG4giGUmgegRFbtHxg4UKhYtf1VI1Fa0gxqoxKttWh85nZp2hwHEKWQ5PfN623FJwL+CSmeArbkm9DqqqpnxLLaAQtwZVekUkrTWtyG8dmevr7xfJIY/+6doIb9OfDAhMv/KJFPi8ZnbhdzV/PHKN7N5ECgyb1u69fZgqzy+QKayD5EluQjKg2b9w0OfpBp0NzVvAbF7iwaW3Wl1Cy5XWFprMSdTcHz5eVzlaZ1KqjOR3EaoinL+jKbgSCzVZaisFGGNsngAKyZO9dj6/r+KSQBUKq7XD811tbOmIqWvLtWPcGHijGfKyVZs5bjsSuG8diZ0bElVw29eCoCbrIwfj0W3TLD82d13PxtL4u9ETyXw8w63MvBI/k4yJhIYsyk/8RFzrWfWLcD7Y0vxFrUyQKpJQIKzhZ7uWo4173jLs0YcekN1ZgNF6ScbuZQxjg7lNZ16P1dkYXPLiawuBa3tyh3IrZlc6mzh4tHuvn31CWspAUQFLhrFZVbKSIYjiUCMNNK3XVNoH6oJ8xQTxiX4aKqvoaahjruXXofmuv2ytABlFJc7Oima28nscGRvILGtOwddjL0ejzMi5sZx62kRd+x8/QdO8/JPUepf2EptcvqQECPR+PG0dYfCXddKijodd35RCKGTsfsMrxjMUjMyWobG7jGkdZ2LnScZcWbK3W9Y9vB5YNn+goOOq5NqeFlJGIYePVRSORnHz7Zy6/bfliuXekJ1xYSqNiIcXRWGbZkefdMgbrRMYbHsj+NOxnqvjxfs5L2H9OiaBK4laJudKzgeVbS/l2zsDYBA/lOGk2W0HBthHsSyYID5mIyPgXCCmuT9gqcVdiPCHwL2Pk6mBePFxw0F5Vm5o6VBhv4JoH96Eb4WwPYCP1N2C9p2PXATiCay0tVIomovHf5ORGlqDTzWuFRYCfYizZgr38NwnDHC7ERToPd+BW8buNaKaiQwAoF8+/0NqK7UA4ueCXCiKHjS19e54EOQdrAam+Cu8oh7R7jhqHVBrQB7ICApqz3FsjwUyUkvMD1c17Pg4CjPfic12P7EsnTxSSKa4gkiyTVlVT2W7fuejYmfUt3gysGgctFRYv+KivbaYNvMn40pYYfjkZfrjbNUyXQ/+KND7OCcaQ2Vvl8AU3T2oDHC51r6XrNgf7+wrYVaXCsyEOBwNOkUocUWJLrUxdS3CzrfYODjmhwrsZTqSfEtoMp0/SjVBPQMXFYwbBAmyjVSCLhF9sOIvKLY/Gnk5Df/3OookKFKipacltPDee3sBO4v7S0F6V6s/1YcIr/AFQrspV27UJwAAAAAElFTkSuQmCC"

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TILE_WIDTH = 20;
	var TILE_HEIGHT = 20;

	var VILLAGER_IMAGE = document.createElement('img');
	VILLAGER_IMAGE.src = __webpack_require__(3);

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
				this.renderTiles();
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = this.map.entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var entity = _step.value;

						this.ctx.drawImage(VILLAGER_IMAGE, entity.pos.x - this.offset.x, entity.pos.y - this.offset.y, 20, 20 / VILLAGER_IMAGE.width * VILLAGER_IMAGE.height);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}
		}, {
			key: 'renderTiles',
			value: function renderTiles() {
				var tileOffset = {
					x: Math.floor(this.offset.x / TILE_WIDTH),
					y: Math.floor(this.offset.y / TILE_HEIGHT)
				};
				var subTileOffset = {
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
								this.ctx.fillStyle = '#008';
								break;
							case 'tree':
								this.ctx.fillStyle = '#840';
								break;
							default:
								this.ctx.fillStyle = '#171';
						}
						this.ctx.fillRect(x * TILE_WIDTH - subTileOffset.x, y * TILE_HEIGHT - subTileOffset.y, TILE_WIDTH, TILE_HEIGHT);
					}
				}
			}
		}]);

		return View;
	})();

	module.exports = View;

/***/ },
/* 5 */
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
		document.addEventListener('mouseover', function (e) {
			if (e.buttons < 2) {
				_this.draggingView = false;
			}
		});
		document.addEventListener('contextmenu', function (e) {
			e.preventDefault();
		});
	};

	module.exports = Controller;

/***/ }
/******/ ]);