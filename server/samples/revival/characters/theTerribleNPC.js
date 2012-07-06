var NPC = require('../../../lib/cassidie/components/npc.js');

module.exports = NPC.extend({
	internalSecretParamater: null,

	initialize: function(data) {
		this.exclusionList.push('internalSecretParamater');

		this._super(data);

		this.skinCoordinates 			= [0, 60, 80, 80];
		this.animationList				= {
			'walking':  {numFrame: 8, looping: true},
			'action_1': {numFrame: 9, looping: false},
		};

		this.attributes.name			= 'The terrible NPC'
		this.attributes.skin 			= 7;
		this.isEnnemy 					= true;
		this.internalSecretParamater	= 'ahah!';

		var self = this;
		setTimeout(function() {
			if (self.isMoving) {
				if (self.destinationX == self.x && self.destinationY == self.y) {
					if (self.x == 30 && self.y == 30) {
						self.goRight();
					} else {
						self.x					= 5;
						self.y					= 5;
						self.goLeft();					
					}
				} else {
					self.moveTo(self.destinationX, self.destinationY, function() {
						self.goRight();
					});	
				}
			} else {
				if (self.x == 30 && self.y == 30) {
					self.goRight();
				} else {
					self.x					= 5;
					self.y					= 5;
					self.goLeft();					
				}
			}
		}, 1000);
	},

	goLeft: function() {
		var self = this;
		this.moveTo(30, 30, function() {
			self.speak('Grrr! je suis méchant');
			setTimeout(function() {
				self.goRight();
			}, 1000);
		});	
	},

	goRight: function() {
		var self = this;

		this.moveTo(5, 5, function() {
			self.goLeft();			
		});
	},

	toString: function() {
		return this.attributes.name;
	}
});