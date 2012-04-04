var Logger		= require('./Logger.js');
var WebSocket	= require('../../lib/faye/websocket');
var http		= require('http');
var server		= http.createServer();

server.addListener('upgrade', function(request, socket, head) {
	var ws = new WebSocket(request, socket, head);

	ws.onmessage = function(event) {
		Logger.log(event.data);
		ws.send('I receive your message:' + event.data);
	};

	ws.onclose = function(event) {
		Logger.log('close');
		ws = null;
	};
});

server.listen(7000);


