var Character = require('./character.js');

module.exports = Character.extend({
	client:			null,
	currentLevel:	null,

	initialize: function(client, data) {
		this._super('player', data);
		
		this.client = client;
	},
	
	save: function(callback) {
		var self = this;

		if (this.client != undefined) {
			Cassidie.database.find('users', {email: this.client.email}, function(data) {
				var characters = null;
				for (var i = 0; i < data[0].characters.length; i++) {
					if (data[0].characters[i].id == self.id) {
						data[0].characters[i] = self.getData();
					}
				}

				self.client.setCharactersData(data[0].characters);

				callback = (callback == undefined) ? function() { } : callback;
				Cassidie.database.update('users', {email: self.client.email}, {characters: data[0].characters}, callback);
			});
		}
	},

	action: function() {
		
	}
});