var Level = Class.create(
/** @lends Level.prototype */
{
	/** 
	 * @field
	 * @type String
	 * @description level name
	 */
	name:			null, 

	/** 
	 * @field
	 * @type String
	 * @description level title
	 */
	title:			null,

	/** 
	 * @field
	 * @private
	 * @type Object
	 * @description level name
	 */
	dimensions: 	null,

	/** 
	 * @field
	 * @private
	 * @type Object
	 * @description size of cells
	 */
	cellSize: 		null,

	/** 
	 * @field
	 * @private
	 * @type Object
	 * @description isometry value
	 */
	isometry:		null,

	/** 
	 * @field
	 * @private
	 * @type Array
	 * @description list of level cells
	 */
	cells:			null,

	/** 
	 * @field
	 * @private
	 * @type Object
	 * @description raw character Data
	 */
	charactersData: null,

	/** 
	 * @field
	 * @private
	 * @type Object
	 * @description raw object data
	 */
	objectsData: 	null,

	/** 
	 * @field
	 * @private
	 * @type Array
	 * @description list of characters
	 */
	characters: 	null,

	/** 
	 * @field
	 * @private
	 * @type Array
	 * @description list of levels
	 */
	items:			null,

	/**
	 * @class <p>Create a new levels</p>
	 *
	 * @constructs
	 * @param {Object} data an object representing level data
	 */
	initialize: function(data) {
		this.name				= data.name;
		this.title				= data.title;
		this.dimensions			= data.dimensions;
		this.cells				= data.cells;
		this.charactersData 	= data.charactersData;	
		this.itemsData 			= data.itemsData;	
		this.initialPositions	= data.initialPositions;
		this.sprites			= data.sprites;	
		this.characters 		= [];
		this.items				= [];
	},

	/**
	 *	Return characters attached to the level
	 *
	 * @public
	 * @param {String} filter restrict to specific type of characters
	 * @param {Boolean} [onlyData] set true to get only data, false to get the Object
	 * @returns {Array} array of characters
	 */
	getCharacters: function(onlyData, filter) {
		if (onlyData == undefined) onlyData = false;
		var characters = [];

		for(var i = 0; i < this.characters.length; i++) {
			if (filter == undefined || (this.characters[i].type.search(filter) > -1) || (filter == 'player' && this.characters[i].type == 'player')) {
				characters.push((onlyData) ? this.characters[i].getData() : this.characters[i]);
			}
		}

		return characters;
	},

	/**
	 * Return objects attached to the level
	 *
	 * @public
	 * @param {Boolean} [onlyData] set true to get only data, false to get the Object
	 * @returns {Array} array of objects
	 */
	getItems: function(onlyData) {
		if (onlyData == undefined) onlyData = false;
		var items = [];

		for(var i = 0; i < this.items.length; i++) {
			items.push((onlyData) ? this.items[i].getData() : this.items[i]);
		}

		return items;
	},

	/**
	 * Return characters attached to the level from a specific rang of an other character
	 *
	 * @public
	 * @param {Character} character character to search around
	 * @param {Integer} range range value
	 * @returns {Array} array of characters
	 */
	getCharactersByRang: function(character, range) {
		var characters = [];

		for(var i = 0; i < this.characters.length; i++) {
			var distance = character.getDistanceFrom(this.characters[i]);
			if (distance <= range && character.attributes.name != this.characters[i].attributes.name) characters.push(this.characters[i]);
		}

		return characters;
	},

	/**
	 * Return the original character data loaded from DB
	 *
	 * @public
	 * @param {String} name character name
	 * @returns {Object} characters data
	 */
	getCharacterData: function(name) {
		if (this.charactersData == undefined) return null;

		for (var i = 0; i < this.charactersData.length; i++) {
			if (this.charactersData[i].attributes.name == name) return this.charactersData[i];
		}

		return null;
	},

	/**
	 * Return the original object data loaded from DB
	 *
	 * @public
	 * @param {String} name object name
	 * @returns {Object} objects data
	 */
	getItemData: function(name) {
		if (this.itemsData == undefined) return null;

		for (var i = 0; i < this.itemsData.length; i++) {
			if (this.itemsData[i].name == name) return this.itemsData[i];
		}

		return null;
	},

	/**
	 * Attach a character from the level
	 *
	 * @public
	 * @param {Character} character character to be attached
	 */
	attachCharacter: function(character) {

		character.level 		= this;
		character.currentLevel 	= this.name; 

		this.characters.push(character);

		if (character.client != undefined) {
			character.client.socket.join(this.name);
			character.client.socket.broadcast.to(this.name).emit('level_character_enter', character.getData());

			Logger.systemLog(Cassidie.consoleName, 'character '+character.id+' attached to '+this.name);
		}
	},

	/**
	 * Remove a character from the level
	 *
	 * @public
	 * @param {Integer} id character id
	 */
	detachCharacter: function(id) {

		var character = null;
		for (var i = this.characters.length-1; i >= 0; i--) {
			if (this.characters[i].id == id) {
				character = this.characters[i];
				this.characters.splice(i, 1);
			}
		}
		
		character.client.socket.leave(this.name);
		character.client.socket.broadcast.to(this.name).emit('level_character_leave', {id: character.id});

		Logger.systemLog(Cassidie.consoleName, 'character '+character.id+' removed from '+this.name);
	},

	/**
	 * Attach an object from the level
	 *
	 * @public
	 * @param {Item} object item to be attached
	 */
	attachItem: function(item) {

		item.level = this;
		this.items.push(item);
	},

	/**
	 * Remove an object from the level
	 *
	 * @public
	 * @param {Integer} id object id
	 */
	detachItem: function(id) {

		for (var i = this.items.length-1; i >= 0; i--) {
			if (this.items[i].id == id) {
				this.items.splice(i, 1);
			}
		}
	},

	/**
	 * Return a specific cell from the level
	 *
	 * @public
	 * @param {Integer} x x position
	 * @param {Integer} y y position
	 * @returns {Object} cell data
	 */
	getCell: function(x, y) {
		return (this.cells[y * this.dimensions.width + x] != undefined) ? this.cells[y * this.dimensions.width + x] : this.cells[0];
	}
});
module.exports = Level;