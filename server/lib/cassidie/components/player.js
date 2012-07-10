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
	 *	Update the current character position
	 *
	 *	@public
	 *	@param {Integer} x destination coordinate x
	 *	@param {Integer} y destination coordinate y
	 *	@param {Boolean} end this is the last move of the travel
	 *	@param {Boolean} [notify] notify other player
	 */
	setPosition: function(x, y, end, notify) {
		this._super(x, y, end);

		this.sendData('character_positioned', {x: this.x, y: this.y, positionCheck: true});
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