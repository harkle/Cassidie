(function() {
	this.GameObject = function(data, level) {
		this.id				 	= null;
		this.x					= null;
		this.y					= null;
		this.isVisible			= null;
		this.engineRessource	= null;
		this.level				= null;

		this.initialize = function(data, level, isPlayer) {
			for (attribute in data) {
				eval('this.'+attribute+'=data[attribute]');
			}

			this.level = level;

			Game.engine.addObject(this);

		}

		this.setParamater = function(parameter, value, notifyOther) {
			eval('this.'+parameter+'=value');

			if (notifyOther) {
				Cassidie.socket.emit('object_set_parameter', {id: this.id, parameter: parameter, value: value});
				Game.trigger(Events.OBJECT_PARAMETER_CHANGED, {id: this.id, parameter: parameter, value: value});
			}
		};

		this.getData = function() {
			var returnObject = {};

			for (attribute in this) {
				if (typeof this[attribute] != 'function' && attribute != 'level' && attribute != 'intervalID' && attribute != 'cellX' && attribute!= 'cellY') eval('returnObject.'+attribute+'=this[attribute]');
			}
			
			return returnObject;
		};

		this.show = function() {
			this.isVisible = true;

			Game.engine.showObject(this.id);
		};

		this.hide = function() {
			this.isVisible = false;			

			Game.engine.hideObject(this.id);
		};

		this.destroy = function() {

			Game.engine.removeObject(this.id);
		};

		this.initialize(data, level);
	};

	this.Object.prototype	= Events.Observable;
})();