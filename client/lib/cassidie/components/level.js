var Level = Events.Observable.extend({
	levelData:			null,
	playerCharacter:	null,
	entities:			[],
	pathfinder:			null,

	initialize: function(data) {
    	var self = this;

    	this.levelData = data;

    	Game.engine.setup(this.levelData.level);

    	// Player
    	this.playerCharacter = this.addCharacter(this.levelData.character, true);
    	Game.engine.setCenter(this.playerCharacter.x, this.playerCharacter.y)

    	// Other players and NPCs
    	for (var i = 0; i < this.levelData.level.characters.length; i++) {
    		if (this.levelData.character.id != this.levelData.level.characters[i].id) this.addCharacter(this.levelData.level.characters[i], false);
    	}

    	//Items
    	for (var i = 0; i < this.levelData.level.items.length; i++) {
    		this.addItem(this.levelData.level.items[i]);
    	}

    	// Event listeners
    	Cassidie.socket.removeAllListeners('level_character_leave');
    	Cassidie.socket.on('level_character_enter', function(data) {
    		self.addCharacter(data, false);
    	});

    	Cassidie.socket.removeAllListeners('level_character_leave');
    	Cassidie.socket.on('level_character_leave', function(data) {
    		self.removeEntity(data.id);
    	});

    	Cassidie.socket.removeAllListeners('character_moved');
    	Cassidie.socket.on('character_moved', function(data) {
    		var character = self.getEntity(data.id);
    		character.move(data.x, data.y, false);
    	});

    	Cassidie.socket.removeAllListeners('character_positioned');
    	Cassidie.socket.on('character_positioned', function(data) {
    		var character = self.getEntity(data.id);
    		if (data.positionCheck) {
    			var dist = Math.sqrt(Math.pow(data.x-character.x, 2) + Math.pow(data.y-character.y, 2));

    			if (dist < 2) return
    			character.setPosition(data.x, data.y);

    			if (data.x != character.destinationX || data.y != character.destinationY) {
		    		character.move(character.destinationX, character.destinationY, false, false);    			
    			} else {
		    		character.setSkin('standing');
    			}
    		} else {
	    		character.move(data.x, data.y, false, true);
    		}
    	});

    	Cassidie.socket.removeAllListeners('item_moved');
    	Cassidie.socket.on('item_moved', function(data) {
    		var item = self.getEntity(data.id);
    		item.move(data.x, data.y, false);
    	});

    	Cassidie.socket.removeAllListeners('character_visibility');
    	Cassidie.socket.on('character_visibility', function(data) {
    		var character = self.getEntity(data.id);

    		if (data.isVisible)  character.show();
    		if (!data.isVisible) character.hide();
    	});

    	Cassidie.socket.removeAllListeners('entity_visibility');
    	Cassidie.socket.on('entity_visibility', function(data) {
    		var item = self.getEntity(data.id);

    		if (data.isVisible)  item.show();
    		if (!data.isVisible) item.hide();
    	});

    	Cassidie.socket.removeAllListeners('character_parameter_changed');
    	Cassidie.socket.on('character_parameter_changed', function(data) {
    		var character = self.getEntity(data.id);

    		character.setParameter(data.parameter, data.value, false);
    		Game.trigger(Events.CHARACTER_PARAMETER_CHANGED, data);
    	});

    	Cassidie.socket.removeAllListeners('item_parameter_changed');
    	Cassidie.socket.on('item_parameter_changed', function(data) {
    		var item = self.getEntity(data.id);

    		item.setParameter(data.parameter, data.value, false);
    		Game.trigger(Events.ITEM_PARAMETER_CHANGED, data);
    	});

    	Cassidie.socket.removeAllListeners('action_success');
    	Cassidie.socket.on('action_success', function(data) {
    		Game.trigger(Events.CHARACTER_ACTION_SUCCESS, data);
    	});

    	Cassidie.socket.removeAllListeners('action_fail');
    	Cassidie.socket.on('action_fail', function(data) {
    		Game.trigger(Events.CHARACTER_ACTION_FAIL, data);
    	});

    	Cassidie.socket.removeAllListeners('action_performed');
    	Cassidie.socket.on('action_performed', function(data) {
    		Game.trigger(Events.CHARACTER_ACTION_PERFORMED, data);
    	});

    	Cassidie.socket.removeAllListeners('skin_change');
    	Cassidie.socket.on('skin_change', function(data) {
    		var entity = self.getEntity(data.id);

    		var isAnimated = (entity.animationList[data.name] != undefined) ? true : false;
    		entity.setSkin(data.name, isAnimated);
    	});
    },

    addCharacter: function(data, isPlayer) {
    	var character = new Character(data, this, isPlayer);

    	this.entities.push(character);

    	return character;
    },

    addItem: function(data) {
    	var item = new Item(data, this);

    	this.entities.push(item);
    	
    	return item;
    },

    removeEntity: function(id) {
    	for (var i = this.entities.length-1; i >= 0; i--) {
    		if (this.entities[i].id == id) {
    			this.entities[i].destroy();
    			this.entities.splice(i, 1);
    		}
    	}
    },

    getEntity: function(id) {
    	for (var i = 0; i < this.entities.length; i++)	{
    		if (this.entities[i].id == id) return this.entities[i];
    	}
    },

    destroy: function() {
    	for (var i = 0; i < this.entities.length; i++)	{
    		this.entities[i].destroy();
    	}

    	Game.engine.destroy();
    },

    checkCoordinates: function(x, y) {
    	for (var i = 0; i < this.entities.length; i++) {			
    		if (this.entities[i].id != this.playerCharacter.id && this.entities[i].x == x && this.entities[i].y == y) {
    			this.entities[i].triggerAction();
    		}
    	}
    }
});