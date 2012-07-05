var GameClass = Events.Observable.extend({
	gameData:		null,
	clientID:		null,
	characterID:	null,
	targetDiv:		null,
	container:		null,
	level:			null,
	engine:			null,
	playerSpeed:	null,

	initialize: function() {
	},

	setup: function(gameData) {
		this.gameData	= gameData;
		this.targetDiv	= Cassidie.targetDiv;

		this.container	= document.createElement('div');
		this.container.setAttribute('id', 'gameContainer');
		this.container.setAttribute('style', 'cursor:non;display:none;position:relative;width:'+this.gameData.viewport.width+'px;height:'+this.gameData.viewport.height+'px;background:black;overflow:hidden;');
		this.targetDiv.appendChild(this.container);

		//Test
		if (Cassidie.useCustomeEngine) {
			this.engine = new CustomEngine();
			console.log('start CUSTOM ENGINE');
		} else {
			if (Detector.webgl) {
				console.log('start WEBGL ENGINE');
				this.engine = new ThreeEngine(true);
			} else if (Detector.canvas) {
				this.engine = new ThreeEngine(false);
				console.log('start CANVAS ENGINE');				
			} else {
				this.engine = new DivEngine();
				console.log('start DIV ENGINE');				
			}
		}

		var self = this;
		Cassidie.socket.on('game_entered', function(data) {
			self.characterID = data.character.id;

			self.playerSpeed = data.playerSpeed;

			self.level = new Level(data);

			self.container.style.display = 'block';

			self.trigger(Events.GAME_ENTERED, data);
			self.trigger(Events.LEVEL_ENTER, data);
		});

		Cassidie.socket.on('game_left', function(data) {
			self.container.style.display = 'none';

			self.trigger(Events.GAME_LEFT, data);
		});

		Cassidie.socket.on('level_change', function(data) {
			self.trigger(Events.LEVEL_LEAVE, self.level.levelData);

			self.level.destroy();

			setTimeout(function() {
				self.level = new Level(data);

				self.trigger(Events.LEVEL_ENTER, data);
			}, 500);
		});
	},

	enterGame: function(characterID) {
		Cassidie.socket.emit('enter_game', {characterId: characterID});
	},

	leaveGame: function() {

		var character = this.level.playerCharacter.getData();

		this.level.destroy();

		Cassidie.socket.emit('leave_game');
		this.level = null;
	},

	clean: function() {
		if (this.level != undefined)  this.level.destroy();
		this.level = null;
	}
});
var Game = new GameClass();