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
		Account.login(data, socket);
	});

	socket.on('logout', function() {
		Account.logout(socket);
	});

	socket.on('get_character_list', function() {
		Account.getCharacterList(socket);
	});

	socket.on('get_character_structure', function() {
		Account.getCharacterStructure(socket);
	});

	socket.on('create_character', function(data) {
		Account.createCharacter(data, socket);
	});

	socket.on('remove_character', function(data) {
		Account.remove_character(data, socket);
	});
});