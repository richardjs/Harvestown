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

	var C = __webpack_require__(1);
	var Map = __webpack_require__(2);
	var View = __webpack_require__(8);
	var Controller = __webpack_require__(9);

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

	document.body.appendChild(canvas);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	window.addEventListener('resize', function (e) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	});

	global.map = new Map(C.MAP_WIDTH, C.MAP_HEIGHT, C.TILE_WIDTH, C.TILE_HEIGHT);
	global.view = new View(canvas, ctx, map);
	global.controller = new Controller(map);

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

		delta *= controller.gameSpeed;

		while (delta > 0) {
			var frameDelta = Math.min(delta, C.MAX_FRAME_DELTA);
			delta -= frameDelta;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = map.entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var entity = _step.value;

					entity.update(frameDelta);
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

		view.render(canvas, ctx);

		requestAnimationFrame(frame);
	}
	frame();
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	// Map size

	exports.MAP_WIDTH = 100;
	exports.MAP_HEIGHT = 100;

	// Tile size (game pixels, not view pixels)
	exports.TILE_WIDTH = 20;
	exports.TILE_HEIGHT = 20;

	// Villager parameters
	exports.VILLAGER_SPEED = 20;
	exports.VILLAGER_WANDER_RANGE = 10;
	exports.VILLAGER_HUNGER_TIME = 60 * 1000;

	// House parameters
	exports.HOUSE_STARTING_FOOD = 3;
	exports.HOUSE_MAX_FOOD = 5;

	// Technical map generation parameters
	exports.WATER_CELL_RANDOM_START_CHANCE = .47;
	exports.WATER_GENERATIONS = 50;
	exports.TREE_CELL_RANDOM_START_CHANCE = .43;
	exports.TREE_GENERATIONS = 100;

	// Technical engine parameters
	exports.MAX_FRAME_DELTA = 100;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var C = __webpack_require__(1);
	var Farm = __webpack_require__(11);
	var House = __webpack_require__(3);
	var Villager = __webpack_require__(7);

	var Map = (function () {
		function Map(width, height, tileWidth, tileHeight) {
			_classCallCheck(this, Map);

			this.width = width;
			this.height = height;
			this.tileWidth = tileWidth;
			this.tileHeight = tileHeight;

			this.generateGeography();

			this.entities = [];
		}

		_createClass(Map, [{
			key: 'generateGeography',
			value: function generateGeography() {
				var _this = this;

				this.data = [];
				for (var i = 0; i < this.width; i++) {
					this.data.push([]);
				}
				var map = new ROT.Map.Cellular(this.width, this.height);
				map.randomize(C.TREE_CELL_RANDOM_START_CHANCE);
				for (var i = 0; i < C.TREE_GENERATIONS; i++) {
					map.create();
				}
				map.create(function (x, y, value) {
					if (value) {
						_this.data[x][y] = 'tree';
					}
				});

				map = new ROT.Map.Cellular(this.width, this.height);
				map.randomize(C.WATER_CELL_RANDOM_START_CHANCE);
				for (var i = 0; i < C.WATER_GENERATIONS; i++) {
					map.create();
				}
				map.create(function (x, y, value) {
					if (value) {
						_this.data[x][y] = 'water';
					}
				});
			}
		}, {
			key: 'placeFarm',
			value: function placeFarm(pos) {
				var farmPos = this.tileToPixel(this.pixelToTile(pos));
				if (this.atPixel(farmPos) !== undefined) {
					return;
				}
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = this.entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var entity = _step.value;

						if (entity instanceof Villager) {
							continue;
						}
						if (entity.pos.x === farmPos.x && entity.pos.y === farmPos.y) {
							return;
						}
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

				this.entities.push(new Farm(this, farmPos));
			}
		}, {
			key: 'placeHouse',
			value: function placeHouse(pos) {
				var housePos = this.tileToPixel(this.pixelToTile(pos));
				if (this.atPixel(housePos) !== undefined) {
					return;
				}
				var firstHouse = true;
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = this.entities[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var entity = _step2.value;

						if (!(entity instanceof House)) {
							continue;
						}
						firstHouse = false;
						if (entity.pos.x === housePos.x && entity.pos.y === housePos.y) {
							return;
						}
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				this.entities.push(new House(this, housePos, firstHouse));
			}
		}, {
			key: 'in',
			value: function _in(pos) {
				return !(pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height);
			}
		}, {
			key: 'at',
			value: function at(pos) {
				if (!this.in(pos)) {
					return 'water';
				}
				return this.data[pos.x][pos.y];
			}
		}, {
			key: 'atPixel',
			value: function atPixel(pos) {
				return this.data[Math.floor(pos.x / this.tileWidth)][Math.floor(pos.y / this.tileHeight)];
			}
		}, {
			key: 'pixelToTile',
			value: function pixelToTile(pos) {
				return { x: Math.floor(pos.x / this.tileWidth), y: Math.floor(pos.y / this.tileHeight) };
			}
		}, {
			key: 'tileToPixel',
			value: function tileToPixel(pos) {
				return { x: pos.x * this.tileWidth + this.tileWidth / 2, y: pos.y * this.tileHeight + this.tileHeight / 2 };
			}
		}]);

		return Map;
	})();

	module.exports = Map;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var C = __webpack_require__(1);
	var I = __webpack_require__(4);
	var Villager = __webpack_require__(7);

	var House = (function () {
		function House(map, pos, startingHouse) {
			_classCallCheck(this, House);

			this.map = map;
			this.pos = pos;
			this.image = I.HOUSE;

			this.food = 0;
			if (startingHouse) {
				this.food = C.HOUSE_STARTING_FOOD;
			}

			this.map.entities.push(new Villager(this.map, this));
		}

		_createClass(House, [{
			key: 'update',
			value: function update() {}
		}, {
			key: 'tile',
			get: function get() {
				return { x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight) };
			}
		}]);

		return House;
	})();

	module.exports = House;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.VILLAGER = new Image();
	exports.VILLAGER.src = __webpack_require__(5);

	exports.HOUSE = new Image();
	exports.HOUSE.src = __webpack_require__(6);

	exports.FARM_UNPLANTED = new Image();
	exports.FARM_UNPLANTED.src = __webpack_require__(12);
	exports.FARM_BARE = new Image();
	exports.FARM_BARE.src = __webpack_require__(10);

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAATCAYAAACp65zuAAAABHNCSVQICAgIfAhkiAAAAAFzUkdCAK7OHOkAAAAEZ0FNQQAAsY8L/GEFAAAACXBIWXMAAAIhAAACIQE+ERCTAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAedJREFUOE91Uk1rE1EUPfdNMh1Ga9KYNhBq0biwUqQYKW40FWsEXbiRCq0oFNz4AyyCgrpx49deBLtypQu3CgpCqUGoS4kfSJVCmoxVQsLUSTLX+6bh0Wo98ODcc8+97+M+wgbMAXuV4yzkjg5bYzMTtUik8FnP1INrm4yPQU8ZdBainro9jdTuAS13WpY1qCKH4BGQEtOZKGDg65sP65Qxv/3cnYox/kRyvAk7Lgt6Lb769FEa51ttNanzZusxjL/8RskTtgoQhLZuynu4kiyhVNf5WOQSnHTf7Qil7rPrYme7BcVMg0FwoORjXufpmJj7MpmUCsPlDpEp1BDzSptotF6t/lD9IyMS8/u/TRohUUYusag9KvC8g3KebDe3FbJrnpdXxDy76TG3gHSdUER0Wbg0/T/k/K6KpdO/hPvr0r+Q3Zb6a7WbaluzqTgWK1rMnW7OQLS6jObWQ6Bljnfddd/KCA8vOQ5+Wwq7fB8J4PiNRuO1zm+YTOHFMiWKmjvWGvyOw0NcNZMxxivITiXgP+mGQI/9ZXbu/GSc6TtN3/OMUf8eBVURGtfx8Ok8Dl0oCKMFu9x7xPyeS8CqvNLzKJDyXGF/REXLN3KNtDFqKPDVuGOv7CuOrvYNDZTBVBb5fu/Fu9U/sZCgVMn4yYgAAAAASUVORK5CYII="

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAZCAYAAAArK+5dAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAFZQAABWUB/iX64wAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFuSURBVEiJ7ZTLTsJAFIb/mU6HTgVsAWOoRoO3gJelcWN8HV/Eh1O3RgzeEhUkEi4FhLbMMHVrIhpZqCHx35/vy59zcgg+hrtzvDifMEpzCdOLY72VsgyHEeJ1ArVxWHC0I8z7SOlqvRf5oPFtsyerlWZ0XfMHZQDyPYztLCZPktzIh2O9mbKYaxrwlEYma5sAAD9QcAQDAGgNVcjaLJ/mywCQaTOsZgQAoNIYQJhGK5DjWq0b+o5gN8+96InlUuaxK8zce5AfqAnFvo7FKFZcKwsgazGK1Yw4mm8FVTo1aZrEID8rAPAv+FsBIbO+5BjxjDcAZn0H/6/i7wVk9q+IkF9ooMbxj8EDqQm7rPv7aZHYtRjfex2pPDfoWqh0McHokjCp9R1QeyDVc2/UGkh9HSh11+iPamdP3fJtU56Sz4ZsG96C4Ac25dtJm+U5idc7oSodFlydFuxqKMf3VT986fTlxWNjdP4wHNYncd4AEvqPtXQfPg8AAAAASUVORK5CYII="

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var C = __webpack_require__(1);
	var I = __webpack_require__(4);
	var Farm = __webpack_require__(11);

	var Villager = (function () {
		function Villager(map, house) {
			_classCallCheck(this, Villager);

			this.map = map;
			this.house = house;
			this.pos = { x: house.pos.x, y: house.pos.y };
			this.angle = 0;
			this.path = [];

			this.state = 'idle';
			this.hungerTimer = C.VILLAGER_HUNGER_TIME;

			this.image = I.VILLAGER;

			this.pixelTarget = null;
			this.activeFarm = null;
		}

		_createClass(Villager, [{
			key: 'goToTile',
			value: function goToTile(pos) {
				var _this = this;

				this.path = [];
				if (map.at(pos) === 'water') {
					return;
				}
				var dijkstra = new ROT.Path.Dijkstra(pos.x, pos.y, function (x, y) {
					return _this.map.at({ x: x, y: y }) !== 'water';
				});
				dijkstra.compute(this.tile.x, this.tile.y, function (x, y) {
					_this.path.push({ x: x, y: y });
				});
				this.path.shift();
				this.nextPathNode();
			}
		}, {
			key: 'setPixelTarget',
			value: function setPixelTarget(pos) {
				this.pixelTarget = pos;
				this.angle = Math.atan2(this.pixelTarget.y - this.pos.y, this.pixelTarget.x - this.pos.x);
			}
		}, {
			key: 'setMapTarget',
			value: function setMapTarget(pos) {
				this.setPixelTarget({
					x: pos.x * this.map.tileWidth + this.map.tileWidth / 2,
					y: pos.y * this.map.tileHeight + this.map.tileHeight / 2
				});
			}
		}, {
			key: 'nextPathNode',
			value: function nextPathNode() {
				if (this.path.length === 0) {
					this.pixelTarget = null;
					return;
				}
				this.setMapTarget(this.path.shift());
			}
		}, {
			key: 'update',
			value: function update(delta) {
				if (this.hungerTimer > 0) {
					this.hungerTimer -= delta;
				} else {
					this.state = 'hungry';
				}

				if (this.pixelTarget) {
					// We're going somewhere
					var dx = Math.cos(this.angle) * C.VILLAGER_SPEED * delta / 1000;
					var dy = Math.sin(this.angle) * C.VILLAGER_SPEED * delta / 1000;

					if (Math.abs(this.pos.x - this.pixelTarget.x) < Math.abs(dx)) {
						this.pos.x = this.pixelTarget.x;
					} else {
						this.pos.x += dx;
					}
					if (Math.abs(this.pos.y - this.pixelTarget.y) < Math.abs(dy)) {
						this.pos.y = this.pixelTarget.y;
					} else {
						this.pos.y += dy;
					}

					if (this.pos.x === this.pixelTarget.x && this.pos.y === this.pixelTarget.y) {
						this.nextPathNode();
					}
				} else {
					// We've reacher our destination
					if (this.activeFarm) {
						if (this.activeFarm.tile.x === this.tile.x && this.activeFarm.tile.y === this.tile.y) {
							if (this.activeFarm.state === 'unplanted') {
								this.activeFarm.plant();
								this.activeFarm = null;
							}
						}
					}

					switch (this.state) {
						case 'idle':
							var _iteratorNormalCompletion = true;
							var _didIteratorError = false;
							var _iteratorError = undefined;

							try {
								for (var _iterator = this.map.entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
									var entity = _step.value;

									if (entity instanceof Farm) {
										if (entity.state === 'unplanted') {
											if (entity.activeVillager) {
												continue;
											}
											entity.activeVillager = this;
											this.activeFarm = entity;
											this.goToTile(entity.tile);
											//this.state = 'planting'
											return;
										}
									}
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

							if (this.state === 'idle') {
								var wanderRange = C.VILLAGER_WANDER_RANGE;
								this.goToTile({
									x: Math.round(this.map.pixelToTile(this.house.pos).x + (Math.random() * 2 * wanderRange - wanderRange)),
									y: Math.round(this.map.pixelToTile(this.house.pos).y + (Math.random() * 2 * wanderRange - wanderRange))
								});
							}
							break;

						case 'hungry':
							if (this.tile.x === this.house.tile.x && this.tile.y === this.house.tile.y) {
								if (this.house.food > 0) {
									this.state = 'idle';
									this.hungerTimer = C.VILLAGER_HUNGER_TIME;
									this.house.food--;
								}
							} else {
								this.goToTile(this.house.tile);
							}
					}
				}
			}
		}, {
			key: 'tile',
			get: function get() {
				return { x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight) };
			}
		}]);

		return Villager;
	})();

	module.exports = Villager;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var C = __webpack_require__(1);
	var I = __webpack_require__(4);
	var Farm = __webpack_require__(11);
	var House = __webpack_require__(3);
	var Villager = __webpack_require__(7);

	var View = (function () {
		function View(canvas, ctx, map) {
			_classCallCheck(this, View);

			this.canvas = canvas;
			this.ctx = ctx;
			this.map = map;
			this.offset = { x: 0, y: 0 };

			this.tileImage = null;
		}

		_createClass(View, [{
			key: 'move',
			value: function move(vector) {
				this.offset.x += vector.x;
				if (this.offset.x < 0) {
					this.offset.x = 0;
				} else if (this.offset.x + this.canvas.width >= this.map.width * this.map.tileWidth) {
					this.offset.x = this.map.width * this.map.tileWidth - this.canvas.width - 2;
				}
				this.offset.y += vector.y;
				if (this.offset.y < 0) {
					this.offset.y = 0;
				} else if (this.offset.y + this.canvas.height >= this.map.height * this.map.tileHeight) {
					this.offset.y = this.map.height * this.map.tileHeight - this.canvas.height - 2;
				}
			}
		}, {
			key: 'renderImageAtTile',
			value: function renderImageAtTile(image, pos) {
				var tilePos = map.pixelToTile(pos);
				this.ctx.drawImage(image, tilePos.x * this.map.tileWidth - this.offset.x + this.map.tileWidth / 2 - image.width / 2, tilePos.y * this.map.tileHeight - this.offset.y + this.map.tileHeight / 2 - image.height / 2);
			}
		}, {
			key: 'render',
			value: function render() {
				this.renderTiles();

				var farms = [];
				var villagers = [];
				var houses = [];
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = this.map.entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var entity = _step.value;

						if (entity instanceof Farm) {
							farms.push(entity);
						} else if (entity instanceof Villager) {
							villagers.push(entity);
						} else if (entity instanceof House) {
							houses.push(entity);
							continue;
						}
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

				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = farms[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var entity = _step2.value;

						this.ctx.save();
						this.ctx.translate(entity.pos.x - this.offset.x, entity.pos.y - this.offset.y);
						this.ctx.drawImage(entity.image, -entity.image.width / 2, -entity.image.height / 2);
						this.ctx.restore();
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = villagers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var entity = _step3.value;

						this.ctx.save();
						this.ctx.translate(entity.pos.x - this.offset.x, entity.pos.y - this.offset.y);
						this.ctx.rotate(entity.angle);
						this.ctx.drawImage(entity.image, -entity.image.width / 2, -entity.image.height / 2);
						this.ctx.restore();
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}

				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = houses[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var entity = _step4.value;

						this.ctx.save();
						this.ctx.translate(entity.pos.x - this.offset.x, entity.pos.y - this.offset.y);
						this.ctx.drawImage(entity.image, -entity.image.width / 2, -entity.image.height / 2);

						this.ctx.font = 'bold 25px arial';
						this.ctx.textAlign = 'center';
						this.ctx.textBaseline = 'middle';
						if (entity.food > C.HOUSE_MAX_FOOD * .5) {
							this.ctx.fillStyle = 'green';
						} else if (entity.food > 0) {
							this.ctx.fillStyle = 'yellow';
						} else {
							this.ctx.fillStyle = 'red';
						}
						this.ctx.fillText(entity.food, 0, 1);
						this.ctx.restore();
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}

				if (controller.placingHouse) {
					var absPos = { x: controller.mousePos.x + this.offset.x, y: controller.mousePos.y + this.offset.y };
					if (map.atPixel(absPos) === undefined) {
						this.renderImageAtTile(I.HOUSE, absPos);
					}
				}
				if (controller.placingFarm) {
					var absPos = { x: controller.mousePos.x + this.offset.x, y: controller.mousePos.y + this.offset.y };
					if (map.atPixel(absPos) === undefined) {
						this.renderImageAtTile(I.FARM_BARE, absPos);
					}
				}
			}
		}, {
			key: 'renderTiles',
			value: function renderTiles() {
				if (!this.tileImage) {
					this.updateTileImage();
				}
				this.ctx.drawImage(this.tileImage, -this.offset.x, -this.offset.y);
			}
		}, {
			key: 'updateTileImage',
			value: function updateTileImage() {
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				canvas.width = this.map.width * this.map.tileWidth;
				canvas.height = this.map.height * this.map.tileHeight;

				for (var x = 0; x < this.map.width; x++) {
					for (var y = 0; y < this.map.height; y++) {
						switch (this.map.data[x][y]) {
							case 'water':
								ctx.fillStyle = '#008';
								break;
							case 'tree':
								ctx.fillStyle = '#040';
								break;
							default:
								ctx.fillStyle = '#171';
						}
						ctx.fillRect(x * this.map.tileWidth, y * this.map.tileHeight, this.map.tileWidth, this.map.tileHeight);
						ctx.strokeStyle = '#040';
						ctx.lineWidth = .5;
						ctx.strokeRect(x * this.map.tileWidth, y * this.map.tileHeight, this.map.tileWidth, this.map.tileHeight);
					}
				}

				this.tileImage = new Image();
				this.tileImage.src = canvas.toDataURL();
			}
		}]);

		return View;
	})();

	module.exports = View;

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Controller = function Controller(map) {
		var _this = this;

		_classCallCheck(this, Controller);

		this.map = map;
		this.mousePos = { x: 0, y: 0 };

		this.draggingView = false;
		this.placingHouse = false;
		this.placingFarm = false;

		this.mouseOut = false;
		this.gameSpeed = 1;

		document.addEventListener('mousedown', function (e) {
			switch (e.button) {
				case 0:
					if (_this.placingHouse) {
						_this.placingHouse = false;
						_this.map.placeHouse({ x: _this.mousePos.x + view.offset.x, y: _this.mousePos.y + view.offset.y });
					}
					if (_this.placingFarm) {
						_this.placingFarm = false;
						_this.map.placeFarm({ x: _this.mousePos.x + view.offset.x, y: _this.mousePos.y + view.offset.y });
					}
					break;
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
			}
			_this.mousePos.x = e.clientX;
			_this.mousePos.y = e.clientY;
			_this.mouseOut = false;
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

		document.addEventListener('keydown', function (e) {
			//alert(e.keyCode)
			switch (e.keyCode) {
				case 49:
					_this.gameSpeed = 1;
					break;
				case 50:
					_this.gameSpeed = 5;
					break;
				case 51:
					_this.gameSpeed = 20;
					break;
				case 52:
					_this.gameSpeed = 100;
					break;

				case 70:
					_this.placingFarm = true;
					_this.placingHouse = false;
					break;
				case 72:
					_this.placingHouse = true;
					_this.placingFarm = false;
					break;
				case 27:
					_this.placingFarm = false;
					_this.placingHouse = false;
					break;
			}
		});
	};

	module.exports = Controller;

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAEUwAABFMBAq/upQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABDSURBVDiNY1TkY/ivIcjIoCHEwPD+JxPD259MDFde/2YgRUxTiIHh7U8mhrc/mRmYGKgMRg0cNXDUwFEDRw0cKgYCAJ0hGpwOTaGAAAAAAElFTkSuQmCC"

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var I = __webpack_require__(4);

	var Farm = (function () {
		function Farm(map, pos) {
			_classCallCheck(this, Farm);

			this.map = map;
			this.pos = pos;
			this.image = I.FARM_UNPLANTED;
			this.state = 'unplanted';
			this.activeVillager = null;
		}

		_createClass(Farm, [{
			key: 'plant',
			value: function plant() {
				this.state = 'planted';
				this.image = I.FARM_BARE;
				this.activeVillager = null;
			}
		}, {
			key: 'update',
			value: function update(delta) {}
		}, {
			key: 'tile',
			get: function get() {
				return { x: Math.floor(this.pos.x / this.map.tileWidth), y: Math.floor(this.pos.y / this.map.tileHeight) };
			}
		}]);

		return Farm;
	})();

	module.exports = Farm;

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAEUwAABFMBAq/upQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAiSURBVDiNYzxbbfefgYqAiZqGjRo4auCogaMGjho4lAwEAHD/Aq3b5gigAAAAAElFTkSuQmCC"

/***/ }
/******/ ]);