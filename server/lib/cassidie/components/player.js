var Character = require('./character.js');

var Player = Character.extend(
/** @lends Player.prototype */
{
	/** 
	 * @field
	 * @type Client
	 * @description belonging client class
	 */
	client:			null,

	/** 
	 * @field
	 * @private
	 * @type Level
	 * @description current player level
	 */
	currentLevel:	null,

	/**
	 * @class <p>Class for default player</p>
	 *
	 * @constructs
	 * @public
	 * @augments Character
	 * @param {Client} [client] the client instance of the player
	 * @param {Object} [data] an object representing player data
	 */
	initialize: function(client, data) {
		this._super('player', data);

		this.client = client;
	},

	/**
	 *
	 * @public
	 * @param {Function} [callback] function executed when save is done
	 */
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

	/**
	 * Empty method triggered when an action is done
	 *
	 * @public
	 */
	action: function(target, result) {
		this._super(target, result);
	}
});
module.exports = Player;