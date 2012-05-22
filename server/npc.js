var NonPlayableCharacter = require('./lib/cassidie/components/nonPlayableCharacter.js');

module.exports = NonPlayableCharacter.extend({

	initialize: function(data) {
		this._super(data);

		this.attributes.name	= 'The terrible NPC'
		this.attributes.skin 	= 7;
		this.x					= 5;
		this.y					= 5;
		this.isEnnemy 			= true;

		var self = this;
		setTimeout(function() {
			self.goLeft();
		}, 1000);
	},

	goLeft: function() {
		var self = this;
		this.moveTo(10, 5, function() {
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