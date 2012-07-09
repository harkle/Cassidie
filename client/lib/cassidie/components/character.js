var Character = Entity.extend({
    attributes:	null,
    direction:	'se',
    appearance:	'standing',
    cellX:		0,
    cellY:		0,
    intervalID:	0,

    initialize: function(data, level, isPlayer) {			
    	this._super(data, level);

    	Game.engine.addCharacter(this);

    	if (data.isMoving) {
    		this.move(data.destinationX, data.destinationY, isPlayer);
    	}			
    },

    move: function(x, y, notiyOthers, noPath) {
    	if (x < 0 || y < 0 || x > this.level.levelData.level.dimensions.width-1 || y > this.level.levelData.level.dimensions.height-1) return;

    	if (noPath) {
    		this.x		= x;
    		this.y		= y;
    		this.cellX	= 0;
    		this.cellY	= 0;

    		clearInterval(this.intervalID);

    		Game.engine.setEntityPosition(this.id, this.x, this.y, 0, 0);

    		return;
    	}

    	var cells = [];
    	for (var i = 0; i < this.level.levelData.level.dimensions.width; i++) {
    		cells[i] = [];
	    	for (var j = 0; j < this.level.levelData.level.dimensions.height; j++) {
    			var tileID   = j * this.level.levelData.level.dimensions.width + i;
    			var tiletData = (this.level.levelData.level.cells[tileID] != undefined) ? this.level.levelData.level.cells[tileID] : this.level.levelData.level.cells[0];

    			if (tiletData.accessible) {
    				cells[i][j] = 0;
    			} else {
    				cells[i][j] = 1;
    			}
    		}
    	}

    	for (var i = 0; i < this.level.entities.length; i++) {
    		if (this.level.entities[i].entityType == 'item') cells[this.level.entities[i].x][this.level.entities[i].y] = 1;
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

    	this.setSkin('walking', true);

    	dx /= Game.playerSpeed;
    	dy /= Game.playerSpeed;

    	this.moveCharacterStep(path, dx, dy, notiyOthers);
    },

    moveCharacterStep: function(path, dx, dy, notiyOthers) {
    	var step = 0;
    	var self = this;
    	this.intervalID = setInterval(function() {
    		self.cellX += dx;
    		self.cellY += dy;

    		Game.engine.setEntityPosition(self.id, self.x, self.y, self.cellX, self.cellY);

    		if (step == Game.playerSpeed-1) {
    			self.x = path[0].x;
    			self.y = path[0].y;
    			self.cellX = 0;
    			self.cellY = 0;

    			Game.engine.setEntityPosition(self.id, self.x, self.y, self.cellX, self.cellY);

    			clearInterval(self.intervalID);
    			path.splice(0,1);
    			
    			if (path.length > 0 ) {
    				self.moveCharacterCell(path, notiyOthers);
    				if (notiyOthers) Cassidie.socket.emit('character_set_position', {x: self.x, y: self.y, end: false});
    			} else {
    				self.setSkin('standing', false);
    				if (notiyOthers) Cassidie.socket.emit('character_set_position', {x: self.x, y: self.y, end: true});
    			}
    		}
    		step++;
    	}, 40);		
    },

    show: function() {
    	this._super();

    	Game.engine.showEntity(this.id);
    },

    hide: function() {
    	this._super();

    	Game.engine.hideEntity(this.id);
    },

    speak: function(message) {
    	Game.engine.characterSpeech(this.id, message);			
    },

    setSkin: function(appearance, isAnimated) {
    	this.appearance = appearance;

    	var animationParameters = (this.animationList[appearance] != undefined) ? this.animationList[appearance] : {numFrame: 1, looping: false};
    	Game.engine.setEntitySkin(this.id, './ressources/characters/'+this.attributes.skin+'/'+appearance+'/'+this.direction, isAnimated, animationParameters);
    },

    destroy: function() {
    	this._super();

    	clearInterval(this.intervalID);

    	delete this.intervalID;
    	delete this.cellX;
    	delete this.cellY;

    	Game.engine.removeEntity(this.id);
    }
});