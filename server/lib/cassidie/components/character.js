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
	isVisible:		null,

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
			this.isVisible		= true;
		}
	},

	toString: function() {
		return 'character'
	},

	removeFromLevel: function() {
		this.level.detachCharacter(this.id);
		this.level = null;	
	},

	setParameter: function(parameter, value, notifyOther) {
		eval('this.'+parameter+'=value');

		if (notifyOther) this.sendData('character_parameter_changed', {parameter: parameter, value:value});
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
		if (!this.isVisible) return;

		this.destinationX	= x;
		this.destinationY	= y;
		this.isMoving		= true;

		this.sendData('character_moved', {x: this.destinationX, y: this.destinationY});	
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

	sendData: function(key, data) {
		var emitter = (this.client == undefined) ? Cassidie.netConnection : this.client.socket.broadcast;
		
		data. id = this.id;
		emitter.to(this.level.name).emit(key, data);			
	},

	show: function() {
		this.isVisible = true;

		this.sendData('character_visibility', {isVisible: true});
	},

	hide: function() {
		this.isVisible = false;

		this.sendData('character_visibility', {isVisible: false});
	},

	speak: function(message) {
		if (!this.isVisible) return;

		Cassidie.chat.broadcast(this, {
			action: 'speak',
			message: message		
		}, this.level);
	}
});