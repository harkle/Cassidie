(function() {
	this.Character = GameObject.extend({
		attributes:	null,
		direction:	'se',
		action:		'standing',
		cellX:		0,
		cellY:		0,
		intervalID:	0,

		initialize: function(data, level, isPlayer) {			
			this._super(data, level);

			Game.engine.addCharacter(this);

			if (data.isMoving) {
				this.move(data.destinationX, data.destinationY, isPlayer);
			}
			
			this.setParameter();	
		},

		setParameter: function(parameter, value, notifyOther) {
			this._super(parameter, value);

			if (notifyOther) {
				Cassidie.socket.emit('character_set_parameter', {id: this.id, parameter: parameter, value: value});
				Game.trigger(Events.CHARACTER_PARAMETER_CHANGED, {id: this.id, parameter: parameter, value: value});
			}
		},

		move: function(x, y, notiyOthers) {
			if (x < 0 || y < 0 || x > this.level.levelData.level.dimensions.width-1 || y > this.level.levelData.level.dimensions.height-1) return;

			var position	= Game.engine.getTilePosition(x, y);

			var cells = [];
			for (var j = 0; j < this.level.levelData.level.dimensions.height; j++) {
				var row = [];
				for (var i = 0; i < this.level.levelData.level.dimensions.width; i++) {
					var tileID   = i * this.level.levelData.level.dimensions.width + j;
					var tiletData = (this.level.levelData.level.cells[tileID] != undefined) ? this.level.levelData.level.cells[tileID] : this.level.levelData.level.cells[0];

					if (tiletData.accessible) {
						row.push(0);
					} else {
						row.push(1);
					}
				}
				cells.push(row);
			}
			for (var i = 0; i < this.level.objects.length; i++) {
				cells[this.level.objects[i].x][this.level.objects[i].y] = 1;
			}
			if(cells[x][y] == 1) return;

			var graph = new Graph(cells);

			var start	= graph.nodes[this.x][this.y];
			var end 	= graph.nodes[x][y];

			var path = astar.search(graph.nodes, start, end);
			if(path.length == 0) return;

			if (notiyOthers) Cassidie.socket.emit('character_move', {x: x, y: y});		

			this.moveCharacterCell(path, notiyOthers);
		},

		moveCharacterCell: function(path, notiyOthers) {
			clearInterval(this.intervalID);

			var currentCell = 0;
			var self = this;
			var step = 0;
			var cx = this.x - path[currentCell].x;
			var cy = this.y - path[currentCell].y;

			var dx = 0;
			var dy = 0;

			//down right OK
			if (cx == 0 && cy == -1) {
			    dx = -this.cellX + Game.engine.isometry.x;
			    dy = -this.cellY + Game.engine.cellSize.height - Game.engine.isometry.y;
			    this.direction = 'se';
			}

			//up left
			if (cx == 0 && cy == 1) {
			    dx = -this.cellX- Game.engine.isometry.x;
			    dy = -this.cellY- (Game.engine.cellSize.height - Game.engine.isometry.y);
			    this.direction = 'nw';
			}

			//down left OK
			if (cx == 1 && cy == 0) {
			    dx = -this.cellX - (Game.engine.cellSize.width - Game.engine.isometry.x);
			    dy = -this.cellY + Game.engine.isometry.y;
			    this.direction = 'sw';
			}

			//up right OK
			if (cx == -1 && cy == 0) {
			    dx = -this.cellX + Game.engine.cellSize.width - Game.engine.isometry.x;
			    dy = -this.cellY - Game.engine.isometry.y;
			    this.direction = 'ne';
			}

			this.action = 'walking';
			Game.engine.setCharacterSkin(this.id, this.attributes.skin, this.action, this.direction);

			var speed = 20;
			dx /= speed;
			dy /= speed;

			this.moveCharacterStep(path, dx, dy, speed, notiyOthers);
		},

		moveCharacterStep: function(path, dx, dy, speed, notiyOthers) {
			var step = 0;
			var self = this;
			this.intervalID = setInterval(function() {
				self.cellX += dx;
				self.cellY += dy;

				Game.engine.setCharacterPosition(self.id, self.attributes.skin, self.x, self.y, self.cellX, self.cellY);

				if (step == speed-1) {
					self.x = path[0].x;
					self.y = path[0].y;
					self.cellX = 0;
					self.cellY = 0;

					Game.engine.setCharacterPosition(self.id, self.attributes.skin, self.x, self.y, self.cellX, self.cellY);

					clearInterval(self.intervalID);
					path.splice(0,1);
					
					if (path.length > 0 ) {
						self.moveCharacterCell(path, notiyOthers);
						if (notiyOthers) Cassidie.socket.emit('character_set_position', {x: self.x, y: self.y, end: false});
					} else {
						self.action = 'standing';
						Game.engine.setCharacterSkin(self.id, self.attributes.skin, self.action, self.direction);
						if (notiyOthers) Cassidie.socket.emit('character_set_position', {x: self.x, y: self.y, end: true});
					}
				}
				step++;
			}, 40);			
		},

		show: function() {
			this._super();

			Game.engine.showCharacter(this.id);
		},

		hide: function() {
			this._super();

			Game.engine.hideCharacter(this.id);
		},

		speak: function(message) {
			Game.engine.characterSpeech(this.id, message);			
		},

		destroy: function() {
			this._super();

			clearInterval(this.intervalID);
			
			delete this.intervalID;
			delete this.cellX;
			delete this.cellY;

			Game.engine.removeCharacter(this.id);
		}
	});
})();