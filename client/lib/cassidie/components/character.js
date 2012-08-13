var Character = Entity.extend({
    attributes:		null,
    direction:		'se',
    appearance:		'standing',
    cellX:			0,
    cellY:			0,
    destinationX: 	0,
    destinationY: 	0,
    intervalID:		0,
    moveLastTime:	0,
    moveCallback:	null,

    initialize: function(data, level, isPlayer) {			
    	this._super(data, level);

    	Game.engine.addCharacter(this);

    	if (data.isMoving) {
    		this.move(data.destinationX, data.destinationY, isPlayer);
    	}			
    },

    setPosition: function(x, y) {
    	this.x		= x;
    	this.y		= y;
    	this.cellX	= 0;
    	this.cellY	= 0;

    	clearInterval(this.intervalID);

    	Game.engine.setEntityPosition(this.id, this.x, this.y, 0, 0);    	
    },

    move: function(x, y, notiyOthers, noPath) {
    	if (this.isDead) return;
    	if (Game.level == undefined) return;

    	this.moveCallback = function() {};
    	this.destinationX = x;
    	this.destinationY = y;

    	if (x < 0 || y < 0 || x > this.level.levelData.level.dimensions.width-1 || y > this.level.levelData.level.dimensions.height-1) return;

    	if (noPath) {
	    	this.setPosition();
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

    	var targetIsEntity = false;
    	var targetIsEnnemy = false;
    	for (var i = 0; i < this.level.entities.length; i++) {
    		if (this.level.entities[i].entityType == 'item') cells[this.level.entities[i].x][this.level.entities[i].y] = 1;
    		if (this.level.entities[i].x == x && this.level.entities[i].y == y) {
    			targetIsEntity = true;
    			if (this.level.entities[i].isEnnemy ) targetIsEnnemy = true;
    		}
    	}

    	var newCell = {
	    	x: x,
	    	y: y
    	}

    	if (targetIsEntity) {
    		var dist	= 1000000;
    		if (this.checkCell(cells, x-1, y) && this.checkDistance(x, x-1, y, y) < dist) {
	    		dist		= this.checkDistance(this.x, x-1, this.y, y);
	    		newCell.x	= x-1;
	    		newCell.y	= y;
    		}
    		if (this.checkCell(cells, x+1, y) && this.checkDistance(x, x+1, y, y) < dist) {
	    		dist		= this.checkDistance(this.x, x+1, this.y, y);
	    		newCell.x	= x+1;
	    		newCell.y	= y;
    		}
    		if (this.checkCell(cells, x, y-1) && this.checkDistance(x, x, y, y-1) < dist) {
	    		dist		= this.checkDistance(this.x, x, this.y, y-1);
	    		newCell.x	= x;
	    		newCell.y	= y-1;
    		}
    		if (this.checkCell(cells, x, y+1) && this.checkDistance(x, x, y, y+1) < dist) {
	    		dist		= this.checkDistance(this.x, x, this.y, y+1);
	    		newCell.x	= x;
	    		newCell.y	= y+1;
    		}    		
    	}

    	if(cells[newCell.x][newCell.y] == 1) {
    		if (this.id == Game.characterID) Game.level.checkCoordinates(newCell.x, newCell.y);

	    	return {
		    	destinationFree: false,
		    	target: targetIsEntity,
	    		alreadyAtDestination: (this.x == newCell.x && this.y == newCell.y)
	    	};
    	}

    	var graph = new Graph(cells);

    	var start	= graph.nodes[this.x][this.y];
    	var end 	= graph.nodes[newCell.x][newCell.y];

    	var path = astar.search(graph.nodes, start, end);
    	if(path.length == 0) {
    		Game.level.checkCoordinates(x, y);

    		return {
	    		destinationFree: true,
	    		target: targetIsEntity,
	    		alreadyAtDestination: (this.x == newCell.x && this.y == newCell.y)
		    };
    	}

    	if (this.id == Game.characterID && targetIsEntity && !targetIsEnnemy) {	    	
	    	this.moveCallback = function() {
		    	Game.level.checkCoordinates(x, y);
	    	};
    	} else if (this.id == Game.characterID && targetIsEntity && targetIsEnnemy) {
			Game.level.checkCoordinates(x, y);	    	

			return {
	    		destinationFree: false,
			    target: targetIsEntity,
	    		alreadyAtDestination: (this.x == newCell.x && this.y == newCell.y)
	    	};
    	}
    	
	    if (notiyOthers) Cassidie.socket.emit('character_move', {x: newCell.x, y: newCell.y});		

	    this.moveToCell(path, notiyOthers);

	    return {
	    	destinationFree: true,
		    target: targetIsEntity,
	    	alreadyAtDestination: (this.x == newCell.x && this.y == newCell.y)
	    };
    },

    checkCell: function(cells, x, y) {
    	if (x < 0 || y < 0 || x > this.level.levelData.level.dimensions.width-1 || y > this.level.levelData.level.dimensions.height-1) return false;

		return (cells[x][y] == 1) ? false : true;  	
    },
    
    checkDistance: function(x1, x2, y1, y2) {
	    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
    },

    moveToCell: function(path, notiyOthers) {

    	var cx = this.x - path[0].x;
    	var cy = this.y - path[0].y;
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

    	clearInterval(this.intervalID);

    	var self			= this;
    	var date 			= new Date();
	    self.moveLastTime 	= date.getTime();
    	this.intervalID = setInterval(function() {
    		self.moveStep(path, dx, dy, notiyOthers);	
    	}, 40);

    },

    moveStep: function(path, dx, dy, notiyOthers) {
    	var date 		= new Date();
	    var now 		= date.getTime();
	    var timeDiff	= now - this.moveLastTime;
 
	    var edx = dx * timeDiff / Game.playerSpeed;
	    var edy = dy * timeDiff / Game.playerSpeed;

    	this.cellX += edx;
    	this.cellY += edy;

    	Game.engine.setEntityPosition(this.id, this.x, this.y, this.cellX, this.cellY);

    	if (Math.abs(this.cellX) >= Math.abs(Math.floor(dx))) {
    	    this.x = path[0].x;
    	    this.y = path[0].y;
    	    this.cellX = 0;
    	    this.cellY = 0;

    	    Game.engine.setEntityPosition(this.id, this.x, this.y, this.cellX, this.cellY);

    	    clearInterval(this.intervalID);
    	    path.splice(0,1);

    	    if (path.length > 0 ) {
    	    	this.moveToCell(path, notiyOthers);
    	    	if (notiyOthers) Cassidie.socket.emit('character_set_position', {x: this.x, y: this.y, end: false});
    	    } else {
    	    	this.setSkin('standing', false);
    	    	if (this.moveCallback != undefined) {
    	    		var self = this;
    	    		setTimeout(function() {
    	    			self.moveCallback();
    	    		}, 100);
    	    	}
    	    	if (notiyOthers) Cassidie.socket.emit('character_set_position', {x: this.x, y: this.y, end: true});
    	    }
    	}

    	var date 			= new Date();
	    this.moveLastTime 	= date.getTime();
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