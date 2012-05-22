module.exports = Class.create({
	name:			null,
	title:			null,
	dimensions: 	null,
	cellSize: 		null,
	isometry:		null,
	cells:			null,
	charactersData: null,
	objectsData: 	null,
	characters: 	null,
	objects:		null,

	initialize: function(data) {
		this.name				= data.name;
		this.title				= data.title;
		this.dimensions			= data.dimensions;
		this.cells				= data.cells;
		this.charactersData 	= data.charactersData;	
		this.objectsData 		= data.objectsData;	
		this.initialPositions	= data.initialPositions;	
		this.characters 		= [];
		this.objects			= [];
	},

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

	getObjects: function(onlyData) {
		if (onlyData == undefined) onlyData = false;
		var objects = [];

		for(var i = 0; i < this.objects.length; i++) {
			objects.push((onlyData) ? this.objects[i].getData() : this.objects[i]);
		}

		return objects;
	},

	getCharactersByRang: function(character, range) {
		var characters = [];

		for(var i = 0; i < this.characters.length; i++) {
			var distance = character.getDistanceFrom(this.characters[i]);
			if (distance <= range && character.attributes.name != this.characters[i].attributes.name) characters.push(this.characters[i]);
		}

		return characters;
	},

	getCharacterData: function(name) {
		if (this.charactersData == undefined) return null;

		for (var i = 0; i < this.charactersData.length; i++) {
			if (this.charactersData[i].attributes.name == name) return this.charactersData[i];
		}

		return null;
	},

	getObjectData: function(name) {
		if (this.objectsData == undefined) return null;

		for (var i = 0; i < this.charactersData.length; i++) {
			if (this.objectsData[i].name == name) return this.objectsData[i];
		}

		return null;
	},

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

	attachObject: function(object) {

		object.level = this;
		this.objects.push(object);
	},

	detachObject: function(id) {

		var object = null;
		for (var i = this.objects.length-1; i >= 0; i--) {
			if (this.objects[i].id == id) {
				object = this.objects[i];
				this.objects.splice(i, 1);
			}
		}
	},
	
	getCell: function(x, y) {
		return (this.cells[y * this.dimensions.width + x] != undefined) ? this.cells[y * this.dimensions.width + x] : this.cells[0];
	}
});