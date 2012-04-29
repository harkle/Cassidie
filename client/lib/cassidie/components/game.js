(function() {
	this.Game 						= function() {};	
	this.Game.prototype 			= new Events.Observable();
	this.Game.prototype.constructor = this.Game;
	this.Game 						= new Game();

	this.Game.gameData		= null;
	this.Game.clientID		= null;
	this.Game.characterID	= null;
	this.Game.targetDiv 	= null;
	this.Game.container 	= null;
	this.Game.level			= null;
	this.Game.engine		= null;

	this.Game.initialize = function(gameData) {
		this.gameData	= gameData;
		this.targetDiv	= Cassidie.targetDiv;

		this.container = document.createElement('div');
		this.container.setAttribute('id', 'gameContainer');
		this.container.setAttribute('style', 'cursor:none;display:none;position:relative;width:'+this.gameData.viewport.width+'px;height:'+this.gameData.viewport.height+'px;background:black;overflow:hidden;');
		this.targetDiv.appendChild(this.container);

		this.engine = new DivEngine();

		var self = this;
		Cassidie.socket.on('game_entered', function(data) {
			self.characterID = data.character.id;

			self.level = new Level(data);

			Game.container.style.display = 'block';

			self.trigger(Events.GAME_ENTERED, data);
		});

		Cassidie.socket.on('game_left', function(data) {
			Game.container.style.display = 'none';

			self.trigger(Events.GAME_LEFT, data);
		});
	};

	this.Game.enterGame = function(characterID) {
		Cassidie.socket.emit('enter_game', {characterId: characterID});
	};

	this.Game.leaveGame = function() {

		var character = this.level.playerCharacter.getData();
		console.log(character);

		this.level.destroy();

		Cassidie.socket.emit('leave_game', {characterData: character});
		this.level = null;
	};

	this.Game.clean = function() {
		this.level.destroy();
		this.level = null;
	};
})();