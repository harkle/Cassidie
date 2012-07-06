var Character 	= require('./character.js');
var PathFinder	= require('../utils/pathfinder.js');

var NPC = Character.extend(
/** @lends NPC.prototype */
{
	/** 
	 * @field
	 * @type Booleam
	 * @description define if the NPC is an ennemy
	 */
	isEnnemy: null,

	/**
	 * @class <p>Create a Non-Playable character</p>
	 *
	 * @constructs
	 * @public
	 * @augments Character
	 * @param {Object} [data] an object representing character data. Warning, if you don't give any data, the character will not be restored when programme restart. Fill it using Level.getCharacterData
	 */
	initialize: function(x, y, data) {
		this._super('npc', data);

		if (data == undefined) {
			this.x = x;
			this.y = y;
		}
	},

	/**
	 * Set a destination to the NPC and start the travel
	 *
	 * @public
	 * @param {Integer} x destination coordinate x
	 * @param {Integer} y destination coordinate y
	 * @param {Function} [callback] function executed when the destination is reached
	 */
	moveTo: function(x, y, callback) {
		if (!this.isVisible) return;

		this._super(x, y, false);

		var pathFinder = new PathFinder(this.level, this.x, this.y, this.destinationX, this.destinationY);
		pathFinder.start(this, callback);
	}
});
module.exports = NPC;