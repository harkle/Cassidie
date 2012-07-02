var Entity = require('./entity.js');

var Character = Entity.extend(
/** @lends Character.prototype */
{
	/** 
	 * @field
	 * @private
	 * @type Object
	 * @description custome attributes used for character creation
	 */
	attributes: 	null,

	/** 
	 * @field
	 * @private
	 * @type Boolean
	 * @description define if the character is now moving
	 */
	isMoving:		null,

	/** 
	 * @field
	 * @private
	 * @type Integer
	 * @description destination x coorindate
	 */
	destinationX:	null,

	/** 
	 * @field
	 * @private
	 * @type Integer
	 * @description destination y coordinate
	 */
	destinationY:	null,

	/**
	 * @class <p>Class representing characte. Should be used only trought NPC or Player class</p>
	 *
	 * @constructs
	 * @augments Entity
	 * @param {String} type define what the type of the character
	 * @param {Object} [data] an object representing character data. Warning, if you don't give any data, the character will not be restored when programme restart. Fill it using Level.getCharacterData
	 */
	initialize: function(type, data) {
		this._super(type, data);

		if (data == undefined) {
			this.attributes	= {
				name: ''
			};
			this.type			= type;
			this.x				= 0;
			this.y				= 0;
			this.isMoving		= false;
			this.destinationX	= 0;
			this.destinationY	= 0;
			this.isVisible		= true;
		}
		this.appearance		= 'standing';

		this.animationList				= {
			'walking':  {numFrame: 1, looping: true},
		};

		this.objectType = 'character';
	},

	/**
	 * Override default toString method
	 *
	 * @public
	 * @returns {String}
	 */
	toString: function() {
		return 'character'
	},

	/**
	 *	Set a destination to the character
	 *
	 *	@public
	 *	@param {Integer} x destination coordinate x
	 *	@param {Integer} y destination coordinate y
	 *	@param {Boolean} [notify] notify player
	 */
	moveTo: function(x, y, notify) {
		if (!this.isVisible) return;
		if (notify == undefined) notify = false;

		this.destinationX	= x;
		this.destinationY	= y;
		this.isMoving		= true;
		this.setAppearance('walking');

		this.sendData('character_moved', {x: this.destinationX, y: this.destinationY}, notify);	
	},

	/**
	 * Update a parameter of the character
	 *
	 * @public
	 * @param {Integer} parameter the parameter to be changed
	 * @param {Integer} value the value of the parameter
	 * @param {Boolean} notifyOther notify other player
	 * @param {Boolean} [notify] notify player
	 */
	setParameter: function(parameter, value, notifyOther, notify) {
		if (notifyOther == undefined) notifyOther = false;
		if (notify == undefined) notify = false;

		this._super(parameter, value);

		if (notifyOther) this.sendData('character_parameter_changed', {parameter: parameter, value:value}, notify);
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
		if (notify == undefined) notify = false;

		this.x = x;
		this.y = y;

		this.proximityCheck();

		if (end) {
			this.isMoving	= false;
			this.setAppearance('standing');

			if (this.type == 'player') {
				var cell = this.level.getCell(this.x, this.y);

				if (cell.level != undefined) Cassidie.game.changeLevel(this, cell.level);
			}
		}

		if (notify) this.sendData('character_positioned', {x: this.x, y: this.y}, true);	
	},

	/**
	 *	Trigger a speach form the character
	 *
	 *	@public
	 *	@param {String} message what the character has to say
	 */
	speak: function(message) {
		if (!this.isVisible) return;

		Cassidie.chat.broadcast(this, {
			action: 'speak',
			message: message		
		}, this.level);
	}
});
module.exports = Character;