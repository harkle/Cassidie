// imports
module.exports = Class.create({
	name: 				'',
	title:				'',
	viewport:			null,
	maxCharacters:		0,
	consoleName:		'game		',
	playerClass:		null,
	clients:			[],

	initialize: function(data, playerClass) {

		this.name			= data.name;
		this.title			= data.title;
		this.viewport		= data.viewport;
		this.maxCharacters	= data.maxCharacters;
		this.playerClass	= playerClass;

		Logger.systemLog(this.consoleName, 'constructor called');
	},

	enter: function(socket, characterId) {
		socket.client.character = new this.playerClass(socket.client.getCharacterData(characterId));	
		socket.client.setInGame(true);

		this.clients.push(socket.client);

		////
		//// SEND A LOT OF INFOS ABOUT GAME, LEVELS, etc.
		////
		socket.emit('game_entered');
		Logger.systemLog(this.consoleName, socket.client.email+' entered the game with "'+socket.client.character.toString()+'"');
	},

	leave: function(socket) {
		if (socket.client == undefined) return;
		if (!socket.client.getAuthenticated() || !socket.client.getInGame()) return;

		////
		//// SAVE A LOT OF STUFF
		////
 
		Logger.systemLog(this.consoleName, socket.client.email+' left the game with "'+socket.client.character.toString()+'"');		

		for (var i = this.clients.length-1; i >= 0; i--) {
			if (socket.client.getID() == this.clients[i].getID()) this.clients.splice(i, 1);
		}
		socket.client.setInGame(false);
		socket.client.character = null;

		socket.emit('game_left');
	}
});