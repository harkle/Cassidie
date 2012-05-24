var gid = require('../utils/genid.js');

module.exports = Class.create({
	id:				null,
	name:			null,
	type:			null,
	appearance:		null,
	level:			null,
	x:				null,
	y:				null,
	isVisible:		null,
	objectType:		null,

	initialize: function(type, data) {
		if (data != undefined) {
			this.setData(data, true);
		} else {
			var genid = new gid.genid;

			this.id				= genid.gen();
			this.name			= '';
			this.type			= type;
			this.x				= 0;
			this.y				= 0;
			this.isVisible		= true;
		}
		
		console.log(this.id);
		
		this.type = type;
	},

	toString: function() {
		return 'object'
	},

	removeFromLevel: function() {
		this.level.detachObject(this.id);
		this.level = null;	
	},

	setParameter: function(parameter, value, notifyOther, notify) {
		if (notify == undefined) notify = false;
		eval('this.'+parameter+'=value');

		if (notifyOther) this.sendData('object_parameter_changed', {parameter: parameter, value:value}, notify);
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

		this.proximityCheck();

		this.sendData('object_moved', {x: this.x, y: this.y}, true);	
	},

	sendData: function(key, data, notifyEverbody) {
		if (notifyEverbody == undefined) notifyEverbody = false;

		var emitter = (this.client == undefined || notifyEverbody) ? Cassidie.netConnection : this.client.socket.broadcast;
		
		data. id = this.id;
		emitter.to(this.level.name).emit(key, data);			
	},

	show: function(notify) {
		if (notify == undefined) notify = false;
		this.isVisible = true;

		this.sendData('object_visibility', {isVisible: true}, notify);
	},

	hide: function(notify) {
		if (notify == undefined) notify = false;
		this.isVisible = false;

		this.sendData('object_visibility', {isVisible: false}, notify);
	},

	getDistanceFrom: function(object) {
		return Math.sqrt(Math.pow(object.x-this.x, 2) + Math.pow(object.y-this.y, 2));		
	},

	setAppearance: function(name) {
		this.appearance = name;
		this.sendData('skin_change', {objectType: this.objectType, name: name}, true);
	},

	action: function(target, result) {
		if (result.success) {
			this.sendData('action_performed', {action: result.name, emiterId: this.id, targetId: target.id});		
			if (this.client != undefined) this.client.socket.emit('action_success', {action: result.name, emiterId: this.id, targetId: target.id});		
		} else {
			if (this.client != undefined) this.client.socket.emit('action_fail', {action: result.name, emiterId: this.id, targetId: target.id});				
		}
	},

	proximityCheck: function() {
		var elements	= this.level.getObjects().concat(this.level.getCharacters());

		for (var i = 0; i < elements.length; i++) {
			var distance = this.getDistanceFrom(elements[i]);
			if (distance <  Cassidie.game.proximity && this.id != elements[i].id) {
				this.proximity(elements[i], distance);
				elements[i].proximity(this, distance);
			}
		}
	},

	proximity: function(target, distance) {
	}
});