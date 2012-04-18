var Logger		= require('./logger.js');
var Client 		= require('../client.js');
var io 			= require('socket.io');
var http		= require('http');

var server		= http.createServer();
	io		 	= io.listen(server);

server.listen(7000);

io.set('log level', 0);

io.sockets.on('connection', function (socket) {
	var client = new Client(socket);
	Cassidie.addClient(client);

	socket.emit('welcome', {
		clientID: client.getID(),
		gameName: Cassidie.game.name	
	});

	socket.on('disconnect', function () {
		Cassidie.removeClient(client.getID());		
	});
});