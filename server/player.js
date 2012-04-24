var PlayableCharacter = require('./lib/cassidie/components/playableCharacter.js');

module.exports = PlayableCharacter.extend({
	attributes: {
		name: '',
		skin: 0
	},

	initialize: function(data) {
		this._super();

		if (data != undefined) {
			this.attributes.name = data.name;
			this.attributes.skin = data.skin;
		}
	},
	
	toString: function() {
		return this.attributes.name;
	}
});