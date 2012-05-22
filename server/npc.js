var Character = require('./lib/cassidie/components/character.js');

module.exports = Character.extend({

	initialize: function(data) {
		this._super('npc_ennemy', data);

		this.attributes.name	= 'The terrible NPC'
		this.attributes.skin 	= 7;
		this.x = 5;
		this.y = 5;

		var self = this;
		setTimeout(function() {
			self.goLeft();
		}, 1000);
	},

	goLeft: function() {
		var self = this;
		this.walkTo(10, 5, function() {
			self.speak('Grrr! je suis méchant');
			setTimeout(function() {
				self.goRight();
			}, 1000);
		});	

	},

	goRight: function() {
		var self = this;

		this.walkTo(5, 5, function() {
			self.goLeft();			
		});
	},

	toString: function() {
		return this.attributes.name;
	}
});