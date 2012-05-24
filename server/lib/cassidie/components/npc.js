var Character 	= require('./character.js');
var PathFinder	= require('../utils/pathfinding/pathfinder.js');

module.exports = Character.extend({
	isEnnemy: null,

	initialize: function(data) {
		this._super('npc', data);
		
	},
	
	moveTo: function(x, y, callback) {
		if (!this.isVisible) return;

		this._super(x, y, false);

		var pathFinder = new PathFinder(this.level, this.x, this.y, this.destinationX, this.destinationY);
		pathFinder.start(this, callback);
	}
});