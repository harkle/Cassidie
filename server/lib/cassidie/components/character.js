module.exports = Class.create({
	attributes: 	null,
	id:				null,
	type:			null,
	level:			null,
	x:				null,
	y:				null,
	isMoving:		null,
	destinationX:	null,
	destinationY:	null,

	initialize: function(type, data) {
		if (data != undefined) {
			this.setData(data, true);
		} else {
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
		}
	},

	toString: function() {
		return 'character'
	},

	removeFromLevel: function() {
		this.level.detachCharacter(this.id);
		this.level = null;	
	},

	setData: function(data, internal) {
		for (attribute in this) {
			if(typeof this[attribute] != 'function' && attribute != 'client' && attribute != 'level' && attribute != '_super' && this.checkFieldValidity(attribute, internal)) {
				eval('this.'+attribute+'=data[attribute]');
			}
		}		
	},

	getData: function() {
		var returnObject = {};

		for (attribute in this) {
			if(typeof this[attribute] != 'function' && attribute != 'client' && attribute != 'level' && attribute != '_super') {
				eval('returnObject.'+attribute+'=this[attribute]');
			}
		}
		return returnObject;
	},

	checkFieldValidity: function(attribute, internal) {
		if (internal) return true;

		if (attribute == 'destinationX')	return false;
		if (attribute == 'destinationY')	return false;
		if (attribute == 'isMoving') 		return false;

		return true;
	},
	
	setPosition: function(x, y, end) {
		this.x = x;
		this.y = y;	

		if (end) this.isMoving = false;	
	},

	moveTo: function(x, y) {
		this.destinationX	= x;
		this.destinationY	= y;
		this.isMoving		= true;

		var emitter = (this.client == undefined) ? Cassidie.netConnection : this.client.socket.broadcast;
		emitter.to(this.level.name).emit('character_moved', {id: this.id, x: this.destinationX, y: this.destinationY});	
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
		Cassidie.chat.broadcast(this, {
			action: 'speak',
			message: message		
		}, this.level);
	}
});