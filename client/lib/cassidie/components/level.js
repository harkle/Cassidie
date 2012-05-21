(function() {
	this.Level = function(data) {
		this.levelData			= null;
		this.playerCharacter	= null;
		this.characters 		= [];
		this.objects			= [];
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

			//Objects
			for (var i = 0; i < this.levelData.level.objects.length; i++) {
				this.addObject(this.levelData.level.objects[i]);
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

			Cassidie.socket.removeAllListeners('object_moved');
			Cassidie.socket.on('object_moved', function(data) {
				var object = self.getObject(data.id);
				object.move(data.x, data.y, false);
			});

			Cassidie.socket.removeAllListeners('character_visibility');
			Cassidie.socket.on('character_visibility', function(data) {
				var character = self.getCharacter(data.id);

				if (data.isVisible)  character.show();
				if (!data.isVisible) character.hide();
			});

			Cassidie.socket.removeAllListeners('object_visibility');
			Cassidie.socket.on('object_visibility', function(data) {
				var object = self.getObject(data.id);

				if (data.isVisible)  object.show();
				if (!data.isVisible) object.hide();
			});

			Cassidie.socket.removeAllListeners('character_parameter_changed');
			Cassidie.socket.on('character_parameter_changed', function(data) {
				var character = self.getCharacter(data.id);

				character.setParameter(data.parameter, data.value, false);
				Game.trigger(Events.CHARACTER_PARAMETER_CHANGED, data);
			});

			Cassidie.socket.removeAllListeners('object_parameter_changed');
			Cassidie.socket.on('object_parameter_changed', function(data) {
				var object = self.getObject(data.id);

				object.setParameter(data.parameter, data.value, false);
				Game.trigger(Events.OBJECT_PARAMETER_CHANGED, data);
			});

			Cassidie.socket.removeAllListeners('action_success');
			Cassidie.socket.on('action_success', function(data) {
				console.log('a');
				Game.trigger(Events.CHARACTER_ACTION_SUCCESS, data);
			});

			Cassidie.socket.removeAllListeners('action_fail');
			Cassidie.socket.on('action_fail', function(data) {
				Game.trigger(Events.CHARACTER_ACTION_FAIL, data);
			});

			Cassidie.socket.removeAllListeners('action_performed');
			Cassidie.socket.on('action_performed', function(data) {
				/*var object = self.getObject(data.id);

				if (data.isVisible)  object.show();
				if (!data.isVisible) object.hide();*/
			});
		};

		this.addCharacter = function(data, isPlayer) {
			var character = new Character(data, this, isPlayer);

			this.characters.push(character);

			return character;
		};

		this.addObject = function(data) {
			var object = new InteractiveObject(data, this);

			this.objects.push(object);
			
			return object;
		};

		this.removeCharacter = function(id) {
			for (var i = this.characters.length-1; i >= 0; i--) {
				if (this.characters[i].id == id) {
					this.characters[i].destroy();
					this.characters.splice(i, 1);
				}
			}
		};

		this.removeObject = function(id) {
			for (var i = this.objects.length-1; i >= 0; i--) {
				if (this.objects[i].id == id) {
					this.objects[i].destroy();
					this.objects.splice(i, 1);
				}
			}
		};

		this.getCharacter = function(id) {
			for (var i = 0; i < this.characters.length; i++)	{
				if (this.characters[i].id == id) return this.characters[i];
			}
		};

		this.getObject = function(id) {
			for (var i = 0; i < this.objects.length; i++)	{
				if (this.objects[i].id == id) return this.objects[i];
			}
		};

		this.destroy = function() {
			for (var i = 0; i < this.characters.length; i++)	{
				this.characters[i].destroy();
			}

			Game.engine.destroy();
		};

		this.checkCoordinates = function(x, y) {
			for (var i = 0; i < this.characters.length; i++) {			
				if (this.characters[i].id != this.playerCharacter.id && this.characters[i].x == x && this.characters[i].y == y) {
					this.characters[i].triggerAction();
				}
			}

			for (var i = 0; i < this.objects.length; i++) {			
				if (this.objects[i].x == x && this.objects[i].y == y) {
					this.objects[i].triggerAction();
				}
			}
		};

		this.initialize(data);
	};

	this.Level.prototype	= Events.Observable;
})();