var gid = require('../utils/genid.js');

var Entity = Class.create(
/** @lends Entity.prototype */
{
	/** 
	 * @field
	 * @type Integer
	 * @description entity unique ID
	 */
	id:					null,

	/** 
	 * @field
	 * @type String
	 * @description entity name
	 */
	name:				null,

	/** 
	 * @field
	 * @type String
	 * @description entity type
	 */
	type:				null,

	/** 
	 * @field
	 * @type Level
	 * @description current level belonging entity
	 */
	level:				null,

	/** 
	 * @field
	 * @type Boolean
	 * @description entity visibility
	 */
	isVisible:			null,

	/** 
	 * @field
	 * @type String
	 * @description current entity appearance
	 */
	appearance:			null,

	/** 
	 * @field
	 * @private
	 * @type Integer
	 * @description entity x position
	 */
	x:					null,

	/** 
	 * @field
	 * @private
	 * @type Integer
	 * @description entity y position
	 */
	y:					null,

	/** 
	 * @field
	 * @private
	 * @type String
	 */
	entityType:			null,

	/** 
	 * @field
	 * @private
	 * @type Array
	 * @description list of skin placement coordinates
	 */
	skinCoordinates:	null,

	/** 
	 * @field
	 * @private
	 * @type Array
	 * @description list of entity animations
	 */
	animationList:		null,

	/** 
	 * @field
	 * @private
	 * @type Object
	 * @description attributes to exclude from set/get data
	 */
	exclusionList:		['_super', 'client', 'actions', 'level', 'exclusionList'],

	/**
	 * @class <p>Class representing entities. Should be used only trought Item, NPC or Player class</p>
	 *
	 * @constructs
	 * @param {String} type define what the type of the entity
	 * @param {Object} [data] an object representing entity data. Warning, if you don't give any data, the character will not be restored when programme restart. Fill it using Level.getCharacterData
	 */
	initialize: function(type, data) {
		this.type			= type;

		if (data != undefined) {
			this.setData(data);
		} else {
			var genid = new gid.genid;

			this.id				= genid.gen();
			this.name			= '';
			this.type			= type;
			this.x				= 0;
			this.y				= 0;
			this.isVisible		= true;
		}

		this.skinCoordinates	= [];
		this.animationList		= {};
	},

	/**
	 * Override default toString method
	 *
	 * @public
	 * @returns {String}
	 */
	toString: function() {
		return 'entity'
	},

	/**
	 * Detach the entity from its belonging level
	 *
	 * @public
	 */
	removeFromLevel: function() {
		this.level.detachItem(this.id);
		this.level = null;	
	},

	/**
	 * Update a parameter of the entity
	 *
	 * @public
	 * @param {Integer} parameter the parameter to be changed
	 * @param {Integer} value the value of the parameter
	 */
	setParameter: function(parameter, value) {
		eval('this.'+parameter+'=value');
	},

	/**
	 * Set the whole entity data 
	 *
	 * @public
	 * @param {Object} data an object representing entity data
	 */
	setData: function(data) {
		for (attribute in this) {
			if(typeof this[attribute] != 'function' && attribute != 'skinCoordinates' && attribute != 'animationList' && this.checkFieldValidity(attribute)) {
				eval('this.'+attribute+'=data[attribute]');
			}
		}
	},

	/**
	 * Set the whole entity data 
	 *
	 * @public
	 * @returns {Object} Oobject containing all entity attributes
	 */
	getData: function() {
		var returnObject = {};

		for (attribute in this) {
			if(typeof this[attribute] != 'function' && this.checkFieldValidity(attribute)) {
				eval('returnObject.'+attribute+'=this[attribute]');
			}
		}

		return returnObject;
	},

	/**
	 * Check if an attribute is valid for set/get 
	 *
	 * @private
	 * @param {String} attribute attribute name
	 * @returns {Boolean}
	 */
	checkFieldValidity: function(attribute) {
		for (var i = 0; i < this.exclusionList.length; i++) {
			if (attribute == this.exclusionList[i]) {
				return false;
			}
		}

		return true;
	},

	/**
	 * Update the current entity position
	 *
	 * @public
	 * @param {Integer} x destination coordinate x
	 * @param {Integer} y destination coordinate y
	 */
	setPosition: function(x, y) {
		this.x = x;
		this.y = y;

		this.proximityCheck();

		this.sendData('item_moved', {x: this.x, y: this.y}, true);	
	},

	/**
	 * Send an event to the client(s)
	 *
	 * @public
	 * @param {String} key the event to be emited
	 * @param {Object} data an object with the data
	 * @param {Boolean} notifyEverbody set true if every level player have to be notified or false if only the player have to notified
	 */
	sendData: function(key, data, notifyEverbody) {
		if (this.level == undefined) return;

		if (notifyEverbody == undefined) notifyEverbody = false;

		var emitter = (this.client == undefined || notifyEverbody) ? Cassidie.netConnection : this.client.socket.broadcast;
		
		data. id = this.id;
		emitter.to(this.level.name).emit(key, data);			
	},

	/**
	 * Show the entity
	 *
	 * @public
	 * @param {Boolean} [notify] notify other player
	 */
	show: function(notify) {
		if (notify == undefined) notify = true;
		this.isVisible = true;

		this.sendData('entity_visibility', {isVisible: true}, notify);
	},

	/**
	 * Hide the entity
	 *
	 * @public
	 * @param {Boolean} [notify] notify other player
	 */
	hide: function(notify) {
		if (notify == undefined) notify = true;
		this.isVisible = false;

		this.sendData('entity_visibility', {isVisible: false}, notify);
	},

	/**
	 * Get the distance between the entity and an other one
	 *
	 * @public
	 * @param {Entity} object the be compared with
	 */
	getDistanceFrom: function(object) {
		return Math.sqrt(Math.pow(object.x-this.x, 2) + Math.pow(object.y-this.y, 2));		
	},

	/**
	 * Change the skin of the entity
	 *
	 * @public
	 * @param {String} name destination coordinate x
	 */
	setAppearance: function(name) {
		this.appearance = name;
		this.sendData('skin_change', {objectType: this.objectType, name: name}, true);
	},

	/**
	 * Trigger an action
	 *
	 * @public
	 * @param {Entity} target the targeted entity
	 * @param {Object} result object describing the action
	 */
	action: function(target, result) {
		if(result == undefined) return;

		if (result.success) {
			this.sendData('action_performed', {action: result.name, emiterId: this.id, targetId: target.id});
			if (this.client != undefined) this.client.socket.emit('action_success', {action: result.name, emiterId: this.id, targetId: target.id});		
		} else {
			if (this.client != undefined) this.client.socket.emit('action_fail', {action: result.name, emiterId: this.id, targetId: target.id});				
		}
	},

	/**
	 * Check proximity with every level entities
	 *
	 * @public
	 */
	proximityCheck: function() {
		if (this.level == undefined) return;

		var elements	= this.level.getItems().concat(this.level.getCharacters());

		for (var i = 0; i < elements.length; i++) {
			var distance = this.getDistanceFrom(elements[i]);
			if (distance <  Cassidie.game.proximity && this.id != elements[i].id) {
				this.proximity(elements[i], distance);
				elements[i].proximity(this, distance);
			}
		}
	},

	/**
	 * Empty method triggered when two entity are near
	 *
	 * @public
	 */
	proximity: function(target, distance) {
	}
});
module.exports = Entity;