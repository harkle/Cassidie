var GraphClass	= require('../lib/javascript-astar/graph.js');
var Astar 		= require('../lib/javascript-astar/astar.js');

module.exports = function(level, x1, y1, x2, y2) {
	this.cellList	= null;
	this.intervalId = null;

	this.initialize = function(level) {
		this.cellList = [];

    	var cells = [];
    	for (var i = 0; i < level.dimensions.width; i++) {
    		cells[i] = [];
	    	for (var j = 0; j < level.dimensions.height; j++) {
    			var tileID   = j * level.dimensions.width + i;
    			var tiletData = (level.cells[tileID] != undefined) ? level.cells[tileID] : level.cells[0];

    			if (tiletData.accessible) {
    				cells[i][j] = 0;
    			} else {
    				cells[i][j] = 1;
    			}
    		}
    	}

		for (var i = 0; i < level.items.length; i++) {
		    cells[level.items[i].x][level.items[i].y] = 1;
		}
		if(cells[x2][y2] == 1) return;

		var graph = new GraphClass.Graph(cells);

		var start	= graph.nodes[x1][y1];
		var end 	= graph.nodes[x2][y2];

		this.cellList = Astar.search(graph.nodes, start, end);		
	};

	this.start = function(character, callback) {
		if (this.cellList.length == 0) return;
		var self = this;

		this.intervalId = setInterval(function() {
			character.x = self.cellList[0].x;
			character.y = self.cellList[0].y;

			self.cellList.splice(0, 1);
			if (self.cellList.length == 0) {
				clearInterval(self.intervalId);
				if (typeof callback == 'function') callback();
			}
		}, 40 + Cassidie.game.playerSpeed);
	};

	this.stop = function() {
		clearInterval(this.intervalId);
	};

	this.initialize(level);
};