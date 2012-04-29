(function() {
	this.Level = function(data) {
		this.levelData			= null;
		this.playerCharacter	= null;
		this.characters 		= [];
		this.pathfinder 		= null;

		this.initialize = function(data) {
			var self = this;

			this.levelData = data;

			Game.engine.initialize(this.levelData.level);

			// Player
			this.playerCharacter = this.addCharacter(this.levelData.character, true);

			// Other players and NPCs
			for (var i = 0; i < this.levelData.level.characters.length; i++) {
				if (this.levelData.character.id != this.levelData.level.characters[i].id) this.addCharacter(this.levelData.level.characters[i], false);
			}

			// Event listeners
			Cassidie.socket.removeAllListeners('level_character_leave');
			Cassidie.socket.on('level_character_enter', function(data) {
				self.addCharacter(data, false);
			});

			Cassidie.socket.removeAllListeners('level_character_leave');
			Cassidie.socket.on('level_character_leave', function(data) {
				self.removeCharacter(data.id);
			});

			Cassidie.socket.removeAllListeners('character_moved');
			Cassidie.socket.on('character_moved', function(data) {
				var character = self.getCharacter(data.id);
				character.move(data.x, data.y, false);
			});

			Cassidie.socket.removeAllListeners('character_visibility');
			Cassidie.socket.on('character_visibility', function(data) {
				var character = self.getCharacter(data.id);

				if (data.isVisible)  character.show();
				if (!data.isVisible) character.hide();
			});
			
			Cassidie.socket.removeAllListeners('character_parameter_changed');
			Cassidie.socket.on('character_parameter_changed', function(data) {
				var character = self.getCharacter(data.id);

				character.setParameter(data.parameter, data.value, false);
			});
		};

		this.addCharacter = function(data, isPlayer) {
			var character = new Character(data, this, isPlayer);

			this.characters.push(character);
			
			return character;
		};

		this.removeCharacter = function(id) {
			for (var i = this.characters.length-1; i >= 0; i--) {
				if (this.characters[i].id == id) {
					this.characters[i].destroy();
					this.characters.splice(i, 1);
				}
			}	
		};

		this.getCharacter = function(id) {
			for (var i = 0; i < this.characters.length; i++)	{
				if (this.characters[i].id == id) return this.characters[i];
			}		
		};

		this.destroy = function() {
			for (var i = 0; i < this.characters.length; i++)	{
				this.characters[i].destroy();
			}

			Game.engine.destroy();
		};

		this.initialize(data);
	};

	this.Level.prototype	= Events.Observable;
})();