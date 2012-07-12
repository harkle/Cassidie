var NPC 		= require('../../../lib/cassidie/components/npc.js');

var positions = [
	[7,14],
	[8,19],
	[10,18],
	[9,15],
	[16,14],
	[13,17],
	[14,21],
	[16,18],
];

module.exports = NPC.extend({

	positions: [],

	initialize: function(name, x, y, direction, data) {
		this._super(x, y, data);
		this.exclusionList.push('positions');

		this.skinCoordinates 			= [0, 60, 80, 80];
		this.animationList.extend({
			'standing':  {numFrame: 1, looping: true},
			'walking':  {numFrame: 13, looping: false},
			'take':  {numFrame: 9, looping: false},
		});

		this.attributes.name			= name;
		this.attributes.skin 			= 3;
		this.isEnnemy 					= false;
		this.direction					= direction;

		this.copyPositions();

		var self = this;
		setTimeout(function() {
			self.farme();	
		}, 1000);		
	},
	
	copyPositions: function() {
		for (var i = 0; i < positions.length; i++) {
			this.positions.push(positions[i]);
		}		
	},

	farme: function() {
		var destination = this.positions.splice(Math.floor(Math.random() * this.positions.length), 1);

		var self = this;
		this.moveTo(destination[0][0], destination[0][1], function() {
			self.setAppearance('take');

			setTimeout(function() {
				if (self.positions.length == 0) self.copyPositions();
				self.farme();
			}, 1500);
		});
	}
});