var GameObject = require('./gameObject.js');

module.exports = GameObject.extend({
	attributes: 	null,
	isMoving:		null,
	destinationX:	null,
	destinationY:	null,

	initialize: function(type, data) {
		this._super(type, data);

		if (data == undefined) {
			this.attributes	= {
				name: ''
			};
			this.id				= new Date().getTime();
			this.type			= type;
			this.x				= 0;
			this.y				= 0;
			this.isMoving		= false;
			this.destinationX	= 0;
			this.destinationY	= 0;
			this.isVisible		= true;
			this.appearance		= 'standing';
		}

		this.objectType = 'character';
	},

	toString: function() {
		return 'character'
	},

	removeFromLevel: function() {
		this.level.detachCharacter(this.id);
		this.level = null;	
	},

	checkFieldValidity: function(attribute, internal) {
		if (internal) return true;

		if (attribute == 'destinationX')	return false;
		if (attribute == 'destinationY')	return false;
		if (attribute == 'isMoving') 		return false;

		return true;
	},

	moveTo: function(x, y, notify) {
		if (!this.isVisible) return;
		if (notify == undefined) notify = false;

		this.destinationX	= x;
		this.destinationY	= y;
		this.isMoving		= true;
		this.setAppearance('walking');

		this.sendData('character_moved', {x: this.destinationX, y: this.destinationY}, notify);	
	},

	setPosition: function(x, y, end, notify) {
		if (notify == undefined) notify = false;

		this.x = x;
		this.y = y;

		this.proximityCheck();

		if (end) {
			this.isMoving	= false;
			this.setAppearance('standing');
		}

		if (notify) this.sendData('character_positioned', {x: this.x, y: this.y}, true);	
	},

	save: function(data, callback) {
		var self = this;

		if (data != undefined) this.setData(data, false);

		if (this.client != undefined) {
			Cassidie.database.find('users', {email: this.client.email}, function(data) {
				var characters = null;
				for (var i = 0; i < data[0].characters.length; i++) {
					if (data[0].characters[i].id == self.id) {
						data[0].characters[i] = self.getData();
					}
				}

				self.client.setCharactersData(data[0].characters);

				callback = (callback == undefined) ? function() { } : callback;
				Cassidie.database.update('users', {email: self.client.email}, {characters: data[0].characters}, callback);
			});
		}
	},

	speak: function(message) {
		if (!this.isVisible) return;

		Cassidie.chat.broadcast(this, {
			action: 'speak',
			message: message		
		}, this.level);
	}
});