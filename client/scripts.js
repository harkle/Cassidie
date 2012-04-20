if (!window.console) {
	console = {};
	console.log = function(message) {
		alert(message)	
	};
}

Cassidie.observe(Events.CONNECT, function(data) {
	console.log('clientID: ' + this.clientID + '\ngame: ' + this.gameName);
});

Cassidie.observe(Events.DISCONNECT, function(data) {
	console.log('Disconnected...');
});

Cassidie.start('http://cassidie:7000');