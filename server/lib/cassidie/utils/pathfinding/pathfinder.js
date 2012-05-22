var GraphClass	= require('./graph.js');
var Astar 		= require('./astar.js');

module.exports = function(level, x1, y1, x2, y2) {
	this.cellList	= null;
	this.intervalId = null;

	this.initialize = function(level) {
		this.cellList = [];

		var cells = [];
		for (var j = 0; j < level.dimensions.height; j++) {
		    var row = [];
		    for (var i = 0; i < level.dimensions.width; i++) {
		    	var tileID   = i * level.dimensions.width + j;
		    	var tiletData = (level.cells[tileID] != undefined) ? level.cells[tileID] : level.cells[0];

		    	if (tiletData.accessible) {
		    		row.push(0);
		    	} else {
		    		row.push(1);
		    	}
		    }
		    cells.push(row);
		}
		for (var i = 0; i < level.objects.length; i++) {
		    cells[level.objects[i].x][level.objects[i].y] = 1;
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
		}, 820);
	};

	this.stop = function() {
		clearInterval(this.intervalId);
	};

	this.initialize(level);
};