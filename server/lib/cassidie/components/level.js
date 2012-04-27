module.exports = Class.create({
	name:			'',
	title:			'',
	dimensions: 	{},
	cellSize: 		{},
	isometry:		{},
	viewport:		{},
	cells:			[],
	charactersData: [],
	characters: 	[],
	objects:		[],

	initialize: function(data) {
		this.name			= data.name;
		this.title			= data.title;
		this.dimensions		= data.dimensions;
		this.cellSize		= data.cellSize;
		this.isometry		= data.isometry;
		this.viewport		= data.viewport;
		this.cells			= data.cells;
		this.charactersData = data.charactersData;	
	},

	getCharacters: function(onlyData, filter) {
		if (onlyData == undefined) onlyData = false;
		var characters = [];

		for(var i = 0; i < this.characters.length; i++) {
			if (filter == undefined || (filter == 'npc' && this.characters[i].type == 'npc') || (filter == 'player' && this.characters[i].type == 'player')) {
				characters.push((onlyData) ? this.characters[i].getData() : this.characters[i]);
			}
		}

		return characters;
	},

	getCharactersByRang: function(character, range) {
		var characters = [];

		for(var i = 0; i < this.characters.length; i++) {
			var distance = Math.sqrt(Math.pow(this.characters[i].x-character.x, 2) + Math.pow(this.characters[i].y-character.y, 2));
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

	attachCharacter: function(character) {

		character.level = this;
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
	}
});