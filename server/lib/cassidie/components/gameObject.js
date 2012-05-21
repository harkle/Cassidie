module.exports = Class.create({
	id:				null,
	name:			null,
	type:			null,
	level:			null,
	x:				null,
	y:				null,
	isVisible:		null,
	action:			null,

	initialize: function(type, data) {
		if (data != undefined) {
			this.setData(data, true);
		} else {
			this.id				= new Date().getTime();
			this.name			= '';
			this.type			= type;
			this.x				= 0;
			this.y				= 0;
			this.isVisible		= true;
		}

		this.actions = [];
	},

	toString: function() {
		return 'object'
	},

	removeFromLevel: function() {
		this.level.detachObject(this.id);
		this.level = null;	
	},

	setParameter: function(parameter, value, notifyOther) {
		eval('this.'+parameter+'=value');

		if (notifyOther) this.sendData('object_parameter_changed', {parameter: parameter, value:value});
	},

	setData: function(data, internal) {
		for (attribute in this) {
			if(typeof this[attribute] != 'function' && attribute != 'client' && attribute != 'actions' && attribute != 'level' && attribute != '_super' && this.checkFieldValidity(attribute, internal)) {
				eval('this.'+attribute+'=data[attribute]');
			}
		}
	},

	getData: function() {
		var returnObject = {};

		for (attribute in this) {
			if(typeof this[attribute] != 'function' && attribute != 'client' && attribute != 'actions' && attribute != 'level' && attribute != '_super') {
				eval('returnObject.'+attribute+'=this[attribute]');
			}
		}
		return returnObject;
	},

	checkFieldValidity: function(attribute, internal) {
		if (internal) return true;

		/*if (attribute == 'destinationX')	return false;*/

		return true;
	},

	setPosition: function(x, y) {
		this.x = x;
		this.y = y;
		
		this.sendData('object_moved', {x: this.x, y: this.y});	
	},


	sendData: function(key, data) {
		var emitter = (this.client == undefined) ? Cassidie.netConnection : this.client.socket.broadcast;
		
		data. id = this.id;
		emitter.to(this.level.name).emit(key, data);			
	},

	show: function() {
		this.isVisible = true;

		this.sendData('object_visibility', {isVisible: true});
	},

	hide: function() {
		this.isVisible = false;

		this.sendData('object_visibility', {isVisible: false});
	},

	addAction: function(name, callback) {
		this.actions[name] = callback;
	},

	removeAction: function(name) {
		this.actions[name] = null;		
	},

	getDistanceFrom: function(object) {
		return Math.sqrt(Math.pow(object.x-this.x, 2) + Math.pow(object.y-this.y, 2));		
	},

	action: function(emiter, result) {
		if (result.success) {
			emiter.client.socket.broadcast.emit('action_performed', {action: result.name, emiterId: emiter.id, targetId: this.id});		
			emiter.client.socket.emit('action_success', {action: result.name, emiterId: emiter.id, targetId: this.id});		
		} else {
			emiter.client.socket.emit('action_fail', {action: result.name, emiterId: emiter.id, targetId: this.id});				
		}
	}
});