(function() {
	var ChatClass = Events.Observable.extend({
		initialize: function() {
		},
		
		setup: function() {
			var self = this;
	
			Cassidie.socket.removeAllListeners('chat_receive');
			Cassidie.socket.on('chat_receive', function(data) {
				self.receive(data)
			});
		},
	
		send:function(inputValue) {
			var tempValue 	= inputValue.split(' ');
			var text		= '';
			if (tempValue[0] != '/l' && tempValue[0].substring(0,1) == '/') {
				var player = tempValue[0].substring(1, tempValue[0].length);
				tempValue.splice(0,1);
				text = tempValue.join(' ');
				if (text == '') return;
	
				if (Game.level.levelData.character.attributes.name.toLowerCase() == player.toLowerCase()) return;
	
				Cassidie.socket.emit('chat_broadcast', {action: 'player', player: player, message: text});
				this.trigger(Events.CHAT_RECEIVE, {action: 'player', player: Game.level.levelData.character.attributes.name, message: text});
			} else if (tempValue[0] == '/l') {
				tempValue.splice(0,1);
				text = tempValue.join(' ');
				if (text == '') return;
	
				Cassidie.socket.emit('chat_broadcast', {action: 'level', message: text});
				this.trigger(Events.CHAT_RECEIVE, {action: 'level', level: Game.level.levelData.level.title, player: Game.level.levelData.character.attributes.name, message: text});
			} else {
				text = inputValue.trim();
				if (text == '') return;
				if (text == '/') return;
	
				Cassidie.socket.emit('chat_broadcast', {action: 'speak', message: text});
				Game.level.playerCharacter.speak(text);
				this.trigger(Events.CHAT_RECEIVE, {action: 'speak', player: Game.level.levelData.character.attributes.name, message: text});
			}
		},
	
		receive: function(data) {
			var character = Game.level.getEntity(data.characterId);
			if (character != null) character.speak(data.message);
	
			this.trigger(Events.CHAT_RECEIVE, data);
		}
	});

	this.Chat = new ChatClass();
})();
