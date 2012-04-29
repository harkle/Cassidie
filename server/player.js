var PlayableCharacter = require('./lib/cassidie/components/playableCharacter.js');

module.exports = PlayableCharacter.extend({
	initialize: function(client, data) {
		this._super(client, data);

		if (data == undefined) {
			this.attributes.skin = '';
			this.activity		 = 0;
		}
	},

	toString: function() {
		return this.attributes.name;
	}
});