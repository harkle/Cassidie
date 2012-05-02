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
		}, 6000);
	},

	goLeft: function() {
		this.moveTo(10, 5);		

		var self = this;
		setTimeout(function() {
			self.goRight();
		}, 6000);
		this.speak('Grrr! je suis méchant');
	},

	goRight: function() {
		this.moveTo(5, 5);

		var self = this;
		setTimeout(function() {
			self.goLeft();
		}, 6000);		
	},

	toString: function() {
		return this.attributes.name;
	}
});