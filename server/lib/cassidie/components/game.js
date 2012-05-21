// imports
var Game = Class.create({
	name: 				'',
	title:				'',
	viewport:			null,
	maxCharacters:		0,
	consoleName:		'game		',
	defaultLevel:		'',
	levelsList:			[],
	levels:				[],
	playerClass:		null,
	clients:			[],

	initialize: function(data, playerClass) {

		this.name			= data.name;
		this.title			= data.title;
		this.viewport		= data.viewport;
		this.maxCharacters	= data.maxCharacters;
		this.playerClass	= playerClass;
		this.defaultLevel	= data.defaultLevel;
		this.chatDistance	= data.chatDistance;
		this.levelsList		= data.levels;
		this.proximity		= data.proximity;

		this.loadLevels();

		Logger.systemLog(this.consoleName, 'constructor called');
	},

	loadLevels: function() {
		var loadings = [];

		var self = this;
		for (var i = 0; i < this.levelsList.length; i++) {
			var name = this.levelsList[i];
			Logger.systemLog(this.consoleName, 'loading level: '+name);

			loadings.push(function(next) {
				self.loadLevel(self, name, i, next);
			});
		}

		Cassidie.wait(loadings, function() {
			Logger.systemLog(self.consoleName, 'all level loaded');
			self.emit(Game.READY);
		});
	},

	loadLevel: function(context, name, i, next) {
		Cassidie.database.find('levels', {name: name}, function(data) {
			var Level = require(process.cwd()+data[0].path);
			context.levels[name] = new Level(data[0]);

			Logger.systemLog(context.consoleName, 'level: '+name+' loaded');
			next();
		});
	},

	stop: function(callback) {
		var self		= this;
		var loadings	= [];

		//Remove every characters
		function leaveClients(client) {
			loadings.push(function(next) {
				self.leave(client.socket, null, function() {
					next();
				});
			});
		}
		for (var i = 0; i < this.clients.length; i++) {
			leaveClients(this.clients[i])	
		}

		//Save NPCs
		function saveNpcsObjects (npcs, objects) {
			loadings.push(function(next) {
				Cassidie.database.update('levels', {name: level}, {objectsData: objects, charactersData: npcs}, function() {
					next();
				});
			});
		}
		for (level in this.levels) {
			saveNpcsObjects(this.levels[level].getCharacters(true, 'npc'), this.levels[level].getObjects(true));
		}

		Cassidie.wait(loadings, function() {
			Logger.systemLog(self.consoleName, 'all has been saved');
			callback();
		});
	},

	enter: function(socket, characterId) {
		socket.client.character = new this.playerClass(socket.client, socket.client.getCharacterData(characterId));
		socket.client.setInGame(true);

		this.clients.push(socket.client);

		this.levels[this.defaultLevel].attachCharacter(socket.client.character);

		////
		//// SEND A LOT OF INFOS ABOUT GAME, LEVELS, etc.
		////
		socket.emit('game_entered', {
			level: {
				name:		this.levels[this.defaultLevel].name,
				title:		this.levels[this.defaultLevel].title,
				dimensions: this.levels[this.defaultLevel].dimensions,
				viewport:	this.levels[this.defaultLevel].viewport,
				cells:		this.levels[this.defaultLevel].cells,
				characters: this.levels[this.defaultLevel].getCharacters(true),
				objects:	this.levels[this.defaultLevel].getObjects(true)
			},
			character: socket.client.character.getData()
		});
		Logger.systemLog(this.consoleName, socket.client.email+' entered the game with "'+socket.client.character.toString()+'"');
	},

	leave: function(socket, data, callback) {
		if (socket.client == undefined) return;
		if (!socket.client.getAuthenticated() || !socket.client.getInGame()) return;

		data = (data != undefined) ? data.characterData : null;
		socket.client.character.save(data, callback);

		socket.client.character.removeFromLevel();
 
		Logger.systemLog(this.consoleName, socket.client.email+' left the game with "'+socket.client.character.toString()+'"');		

		for (var i = this.clients.length-1; i >= 0; i--) {
			if (socket.client.getID() == this.clients[i].getID()) this.clients.splice(i, 1);
		}
		socket.client.setInGame(false);
		socket.client.character = null;

		socket.emit('game_left');
	}
});

Game.READY = 0;

module.exports = Game;