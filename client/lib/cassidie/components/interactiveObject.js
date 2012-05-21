(function() {
	this.InteractiveObject = GameObject.extend({

		initialize: function(data, level, isPlayer) {
			this._super(data, level);

			Game.engine.addObject(this);
		},

		setParameter: function(parameter, value, notifyOther) {
			this._super(parameter, value);

			if (notifyOther) {
				Cassidie.socket.emit('object_set_parameter', {id: this.id, parameter: parameter, value: value});
				Game.trigger(Events.OBJECT_PARAMETER_CHANGED, {id: this.id, parameter: parameter, value: value});
			}
		},

		move: function(x, y, notiyOthers) {
			this._super();

			Game.engine.setObjectPosition(this.id, this.skin, this.x, this.y);
		},

		show: function() {
			this._super();

			Game.engine.showObject(this.id);
		},

		hide: function() {
			this._super();

			Game.engine.hideObject(this.id);
		},

		destroy: function() {
			this._super();

			Game.engine.removeObject(this.id);
		}
	});
})();