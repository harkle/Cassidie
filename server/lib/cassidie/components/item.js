var Entity = require('./entity.js');

var Item = Entity.extend(
/** @lends Item.prototype */
{
	/** 
	 * @field
	 * @type String
	 * @description item skin
	 */
	skin:	null, 

	/**
	 * @class <p>Create an new Item</p>
	 *
	 * @constructs
	 * @augments Entity
	 * @param {String} skin the current skin of the object
	 * @param {Integer} x x position
	 * @param {Integer} y y position
	 * @param {Object} [data] an object representing entity data. Warning, if you don't give any data, the character will not be restored when programme restart. Fill it using Level.getCharacterData
	 */
	initialize: function(skin, x, y, data) {
		this._super('interactiveObject', data);

		if (data == undefined) {
			this.skin			= skin;
			this.x				= x;
			this.y				= y;
			this.appearance		= 'default';
		}

		this.objectType = 'object';
	},

	/**
	 * Update a parameter of the item
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

		if (notifyOther) this.sendData('item_parameter_changed', {parameter: parameter, value:value}, notify);
	},
});
module.exports = Item;