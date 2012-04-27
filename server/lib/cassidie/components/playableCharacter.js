var Character = require('./character.js');

module.exports = Character.extend({
	client: null,

	initialize: function(client, data) {
		this._super('player', data);
		
		this.client = client;
	}
});