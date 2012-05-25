(function() {
	this.Entity = Events.Observable.extend({
		id:			null,
		x:			null,
		y:			null,
		isVisible:	null,
		level:		null,

		initialize: function(data, level) {
			for (attribute in data) {
				eval('this.'+attribute+'=data[attribute]');
			}

			this.level = level;			
		},

		setParameter: function(parameter, value, notifyOther) {
			eval('this.'+parameter+'=value');
		},
		
		getData: function() {
			var returnObject = {};

			for (attribute in this) {
				if (typeof this[attribute] != 'function' && attribute != 'level' && attribute != 'intervalID' && attribute != 'cellX' && attribute!= 'cellY') eval('returnObject.'+attribute+'=this[attribute]');
			}

			return returnObject;
		},

		move: function(x, y) {
			this.x = x;
			this.y = y;

		},

		show: function() {
			this.isVisible = true;
		},

		hide:function() {
			this.isVisible = false;
		},

		destroy: function() {
		},

		setSkin: function(action) {
			this.action = action;

			Game.engine.setEntitySkin(this.id, './ressources/objects/'+this.skin+'/'+this.action, '.gif');
		},

		triggerAction: function() {
			Cassidie.socket.emit('action_triggered', {targetId: this.id});
			Game.trigger(Events.ACTION_TRIGGERED, this);
		}
	});
})();