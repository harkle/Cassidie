var Game = Class.create(
/** @lends Game.prototype */
{
	/** 
	 * @field
	 * @type String
	 * @description game name
	 */
	name: 				'',

	/** 
	 * @field
	 * @type String
	 * @description game title
	 */
	title:				'',

	/** 
	 * @field
	 * @private
	 * @type Object
	 * @description game size in browser
	 */
	viewport:			null,

	/** 
	 * @field
	 * @private
	 * @type Integer
	 * @description maximum amount of character per player
	 */
	maxCharacters:		0,

	/** 
	 * @field
	 * @type String
	 * @description name for node console
	 */
	consoleName:		'game		',

	/** 
	 * @field
	 * @private
	 * @type String
	 * @description default level name
	 */
	defaultLevel:		'',

	/** 
	 * @field
	 * @private
	 * @type Array
	 * @description list of all game levels
	 */
	levelsList:			[],

	/** 
	 * @field
	 * @private
	 * @type Array
	 * @description list of all game level instances
	 */
	levels:				[],

	/** 
	 * @field
	 * @private
	 * @type String
	 * @description class used for default player
	 */
	playerClass:		null,

	/** 
	 * @field
	 * @private
	 * @type Array
	 * @description list of clients connected to the game
	 */
	clients:			[],

	/**
	 * @field
	 * @private
	 * @type Integer
	 * @description play speed
	 */
	playerSpeed: 		null,
	  
	/**
	 * @class <p>Class representing entities. You have to extend it to create your game</p>
	 *
	 * @description Your game is a class extenting the Game class as in the example below:
	 * @example
	 * require('./lib/cassidie/cassidie.js');
	 * var Game		= require('./lib/cassidie/components/game.js');
	 * var CustomPlayer	= require('./players/customPlayer.js');
	 * 
	 * var myGame = Game.extend({
	 * 	initialize: function(data) {
	 * 		this._super(data, CustomPlayer);
	 * 	}
	 * });
	 * Cassidie.start('localhost', 27017, 'cassidie', myGame, 'Test1');
	 *
	 * @constructs
	 * @param {Object} data an object representing game data
	 * @param {Player} playerClass the class used for the players
	 */
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
		this.playerSpeed	= 20;

		this.loadLevels();

		Logger.systemLog(this.consoleName, 'constructor called');
	},

	/**
	 * Load all game levels
	 *
	 * @public
	 */
	loadLevels: function() {
		var loadings	= [];
		var self		= this;

		if (this.levelsList.length == 0) {
			Logger.systemLog(this.consoleName, 'no level loaded');
			setTimeout(function() {
				self.emit(Game.READY);
			}, 500);			
		}

		for (var i = 0; i < this.levelsList.length; i++) {
			var name = this.levelsList[i];
			Logger.systemLog(this.consoleName, 'loading level: '+name);

			loadings.push(this.loadLevel(name));
		}

		Cassidie.wait(loadings, function() {
			Logger.systemLog(self.consoleName, 'all level loaded');
			self.emit(Game.READY);
		});
	},

	/**
	 * Load a single level
	 *
	 * @private
	 * @param {String} name level name
	 */
	loadLevel: function(name) {
		var self = this;
		var fnc = function(next) {
			self.loadLevelCallback(self, name, next);			
		}	

		return fnc;
	},

	/**
	 * Callbak for level loading
	 *
	 * @private
	 * @param {Game} context reference to the main Game class
	 * @param {String} name level name
	 * @param {Function} next
	 */
	loadLevelCallback: function(context, name, next) {
		Cassidie.database.find('levels', {name: name}, function(data) {
			var Level = require(process.cwd()+data[0].path);
			context.levels[name] = new Level(data[0]);

			Logger.systemLog(context.consoleName, 'level: '+name+' loaded');
			next();
		});
	},

	/**
	 * Stop the game
	 *
	 * @public
	 * @param {Function} callback method exectued after everything is stopped
	 */
	stop: function(callback) {
		var self		= this;
		var loadings	= [];

		//Remove every characters
		function leaveClients(client) {
			loadings.push(function(next) {
				self.leave(client.socket, function() {
					next();
				});
			});
		}
		for (var i = 0; i < this.clients.length; i++) {
			leaveClients(this.clients[i])	
		}

		//Save NPCs
		function saveNpcsItems (level, npcs, items) {
			loadings.push(function(next) {
				Cassidie.database.update('levels', {name: level}, {itemsData: items, charactersData: npcs}, function() {
					next();
				});
			});
		}
		for (level in this.levels) {
			saveNpcsItems(level, this.levels[level].getCharacters(true, 'npc'), this.levels[level].getItems(true));
		}

		Cassidie.wait(loadings, function() {
			Logger.systemLog(self.consoleName, 'all has been saved');
			callback();
		});
	},

	/**
	 * Method for player entering the game
	 *
	 * @public
	 * @param {Socket} socket socket used by the player
	 * @param {Integer} characterId id of the character
	 */
	enter: function(socket, characterId) {
		socket.client.character = new this.playerClass(socket.client, socket.client.getCharacterData(characterId));
		socket.client.setInGame(true);

		this.clients.push(socket.client);

		//First time
		if (socket.client.character.currentLevel == undefined) {
			socket.client.character.currentLevel = Cassidie.game.defaultLevel;
			var position = this.levels[socket.client.character.currentLevel].initialPositions.default;
			socket.client.character.x = position[0];
			socket.client.character.y = position[1];
		}

		this.levels[socket.client.character.currentLevel].attachCharacter(socket.client.character);

		socket.emit('game_entered', {
			level: {
				name:				this.levels[socket.client.character.currentLevel].name,
				title:				this.levels[socket.client.character.currentLevel].title,
				dimensions: 		this.levels[socket.client.character.currentLevel].dimensions,
				cells:				this.levels[socket.client.character.currentLevel].cells,
				characters: 		this.levels[socket.client.character.currentLevel].getCharacters(true),
				items:				this.levels[socket.client.character.currentLevel].getItems(true),
				sprites:			this.levels[socket.client.character.currentLevel].sprites
			},
			character:		socket.client.character.getData(),
			playerSpeed:	this.playerSpeed
		});
		Logger.systemLog(this.consoleName, socket.client.email+' entered the game with "'+socket.client.character.toString()+'"');
	},

	/**
	 * Method for player leaving the game
	 *
	 * @public
	 * @param {Socket} socket socket used by the player
	 * @param {Function} callback callback called after character saving
	 */
	leave: function(socket, callback) {
		if (socket.client == undefined) return;
		if (!socket.client.getAuthenticated() || !socket.client.getInGame()) return;

		socket.client.character.save(callback);

		socket.client.character.removeFromLevel();
 
		Logger.systemLog(this.consoleName, socket.client.email+' left the game with "'+socket.client.character.toString()+'"');		

		for (var i = this.clients.length-1; i >= 0; i--) {
			if (socket.client.getID() == this.clients[i].getID()) this.clients.splice(i, 1);
		}
		socket.client.setInGame(false);
		socket.client.character = null;

		socket.emit('game_left');
	},

	/**
	 * Method for player changing from level
	 *
	 * @public
	 * @param {Integer} characterId id of the current character
	 * @param {Level} level target level
	 */
	changeLevel: function(character, level) {
		var oldLevel = character.currentLevel;
		character.removeFromLevel();

		eval('var position = this.levels[level].initialPositions.'+oldLevel);
		character.x = position[0];
		character.y = position[1];

		Cassidie.game.levels[level].attachCharacter(character);

		character.client.socket.emit('level_change', {
			level: {
				name:				this.levels[level].name,
				title:				this.levels[level].title,
				dimensions: 		this.levels[level].dimensions,
				cells:				this.levels[level].cells,
				characters: 		this.levels[level].getCharacters(true),
				items:				this.levels[level].getItems(true),
				sprites:			this.levels[level].sprites
			},
			character: character.getData()
		});
		
	}
});

Game.READY = 0;

module.exports = Game;