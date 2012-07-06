var Logger		= require('./logger.js');
var Client 		= require('../client.js');
var io 			= require('socket.io');
var http		= require('http');

var server		= http.createServer();
	io		 	= io.listen(server);

server.listen(7000);

io.set('log level', 0);
io.sockets.on('connection', function (socket) {
	var client 		= new Client(socket);
	socket.client 	= client;
	Cassidie.addClient(client);

	socket.emit('welcome', {
		clientID:	client.getID(),
		game: 		{
			name:			Cassidie.game.name,
			title:			Cassidie.game.title,
			viewport:		Cassidie.game.viewport,
			maxCharacters:	Cassidie.game.maxCharacters
		}
	});

	socket.on('disconnect', function () {
		Cassidie.removeClient(client.getID());		
	});

	socket.on('register', function(data) {
		Account.register(data, socket);
	});

	socket.on('login', function(data) {
		if (socket.client.getAuthenticated()) return;
		Account.login(data, socket);
	});

	socket.on('logout', function() {
		if (!socket.client.getAuthenticated()) return;
		Account.logout(socket);
	});

	socket.on('get_character_list', function() {
		if (!socket.client.getAuthenticated()) return;
		Account.getCharacterList(socket);
	});

	socket.on('get_character_structure', function() {
		if (!socket.client.getAuthenticated()) return;
		Account.getCharacterStructure(socket);
	});

	socket.on('create_character', function(data) {
		if (!socket.client.getAuthenticated()) return;
		Account.createCharacter(data, socket);
	});

	socket.on('remove_character', function(data) {
		if (!socket.client.getAuthenticated()) return;
		Account.remove_character(data, socket);
	});

	socket.on('enter_game', function(data) {
		console.log('Enter', data);
		if (!socket.client.getAuthenticated() || socket.client.getInGame()) return;
		Cassidie.game.enter(socket, data.characterId);
	});

	socket.on('leave_game', function() {
		if (!socket.client.getAuthenticated() || !socket.client.getInGame()) return;
		Cassidie.game.leave(socket);
	});

	socket.on('character_move', function(data) {
		if (!socket.client.getAuthenticated() || !socket.client.getInGame()) return;
		socket.client.character.moveTo(data.x, data.y);
	});

	socket.on('character_set_position', function(data) {
		if (!socket.client.getAuthenticated() || !socket.client.getInGame()) return;
		socket.client.character.setPosition(data.x, data.y, data.end);
	});

	socket.on('chat_broadcast', function(data) {
		if (!socket.client.getAuthenticated()) return;
		Cassidie.chat.broadcast(socket.client, data);
	});

	socket.on('entity_set_parameter', function(data) {
		if (!socket.client.getAuthenticated()) return;
		socket.client.character.setParameter(data.parameter, data.value, true, true);
	});

	socket.on('action_triggered', function(data) {
		if (!socket.client.getAuthenticated()) return;

		var target = null;

		var elements	= socket.client.character.level.getItems().concat(socket.client.character.level.getCharacters());		
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].id == data.targetId && elements[i].isVisible) {
				target = elements[i];
			}
		}

		if (target != null) socket.client.character.action(target);
	});
});
module.exports = io.sockets;