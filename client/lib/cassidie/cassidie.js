(function() {
	this.Cassidie 			= function() {};	
	this.Cassidie.prototype = Events.Observable;
	this.Cassidie 			= new Cassidie();
	
	this.Cassidie.clientID	= null;
	this.Cassidie.gameName	= null;

	this.Cassidie.start = function(serverName) {
		var self	= this;
		var socket	= io.connect(serverName);

		socket.on('welcome', function (data) {
			if (data.clientID) {
				self.clientID = data.clientID;
				self.gameName = data.gameName;

				self.trigger(Events.CONNECT, data);
			}
		});

		socket.on('disconnect', function() {
			self.trigger(Events.DISCONNECT);
			console.log('Disconnected');
		});

		socket.on('error', function() {
			alert('An error occured');
		});
	};
})();