(function() {
	this.Cassidie 			= function() {};	
	this.Cassidie.prototype 	= Events.Observable;
	this.Cassidie 				= new Cassidie();

	this.Cassidie.clientID		= null;
	this.Cassidie.characterID	= null;
	this.Cassidie.game			= null;
	this.Cassidie.socket		= null;
	this.Cassidie.targetDiv 	= null;
	this.Cassidie.container 	= null;
	this.Cassidie.level			= null;

	this.Cassidie.start = function(serverName, targetDiv) {
		var self		= this;

		if (typeof io == 'undefined') {
			self.trigger(Events.NO_SERVER, {server: serverName});

			return;
		}

		this.socket		= io.connect(serverName);
		this.targetDiv	= document.getElementById(targetDiv);

		Account.initialize();
		Chat.initialize();

		this.socket.on('welcome', function (data) {
			if (data.clientID) {
				self.clientID 	= data.clientID;
				self.game 		= data.game;

				self.trigger(Events.CONNECT, data);
			}
		});

		this.socket.on('disconnect', function() {
			self.clean();
			self.trigger(Events.DISCONNECT);
		});

		this.socket.on('error', function() {
			alert('An error occured');
		});

		this.socket.on('game_entered', function(data) {
			self.characterID = data.character.id;
			Cassidie.buildGame(data);

			self.trigger(Events.GAME_ENTERED, data);
		});
		
		this.socket.on('game_left', function(data) {
			self.trigger(Events.GAME_LEFT, data);
		});
	};

	this.Cassidie.enterGame = function(characterID) {
		this.socket.emit('enter_game', {characterId: characterID});
	};

	this.Cassidie.leaveGame = function() {
		var elements = this.container.childNodes;
		for (var i = 0; i < elements.length; i++) {
			this.container.removeChild(elements[i]);
		}

		this.container.parentNode.removeChild(this.container);


		var character = this.level.getCharacter(this.characterID);

		this.level.destroy();

		//temps
		character.characterDiv = null;
		character.intervalID = null;

		this.socket.emit('leave_game', {characterData: character});
		this.level = null;
	};

	this.Cassidie.clean = function() {
		this.level = null;
		
		if (this.container != undefined) this.container.parentNode.removeChild(this.container);
	};

	this.Cassidie.buildGame = function(data) {
		this.container = document.createElement('div');
		this.container.setAttribute('id', 'gameContainer');
		this.container.setAttribute('style', 'position:relative;width:'+this.game.viewport.width+'px;height:'+this.game.viewport.height+'px;background:black;overflow:hidden;');

		this.targetDiv.appendChild(this.container); 

		this.level = new Level(data);	
	};
})();