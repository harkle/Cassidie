(function() {
	this.Cassidie 			= function() {};	
	this.Cassidie.prototype = Events.Observable;
	this.Cassidie 			= new Cassidie();

	this.Cassidie.clientID	= null;
	this.Cassidie.game		= null;
	this.Cassidie.socket	= null;

	this.Cassidie.start = function(serverName) {
		var self	= this;
		this.socket	= io.connect(serverName);

		Account.initialize();

		this.socket.on('welcome', function (data) {
			if (data.clientID) {
				self.clientID 	= data.clientID;
				self.game 		= data.game;

				self.trigger(Events.CONNECT, data);
			}
		});

		this.socket.on('disconnect', function() {
			self.trigger(Events.DISCONNECT);
			console.log('Disconnected');
		});

		this.socket.on('error', function() {
			alert('An error occured');
		});

		this.socket.on('game_entered', function(data) {
			Cassidie.buildGame(data);
			self.trigger(Events.GAME_ENTERED, data);
		});
		
		this.socket.on('game_left', function(data) {
			self.trigger(Events.GAME_LEFT, data);
		});
	};

	this.Cassidie.enterGame = function(characterId) {
		this.socket.emit('enter_game', {characterId: characterId});
	};

	this.Cassidie.leaveGame = function(characterId) {
		this.socket.emit('leave_game');
	};

	this.Cassidie.buildGame = function(data) {
		
	};
})();