var InteractiveObject = require('./lib/cassidie/components/interactiveObject.js');

module.exports = InteractiveObject.extend({
	initialize: function(x, y, data) {
		this._super('camera', x, y, data);

		if (data == undefined) {
			this.name				= 'Camera';
		}
		
		var self = this;
		setInterval(function() {
			/*if (self.isVisible) {
				self.hide()
			} else {
				self.show()			
			}*/
			
			//self.setParameter('life', 100, true);
			//self.setPosition(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
		}, 1000);
	},

	action: function(emiter) {
		var result = {
			success: false,
			name:	 ''
		};

		if (emiter.activity == 0) result = this.actionNormal(emiter);
		if (emiter.activity == 1) result = this.actionAttack(emiter);		

		this._super(emiter, result);
	},

	actionNormal: function(emiter) {
		return {
			success: true,
			name:	 'normal'		
		};		
	},

	actionAttack: function(emiter) {
		var distance = this.getDistanceFrom(emiter);
		
		if (distance > 1) {
			return {
				success: false,
				name:	 'attack'
			};		
		} else {
			this.hide();
			
			self = this;
			setTimeout(function() {
				self.show();
			}, 10000);

			return {
				success: true,
				name:	 'attack'
			};
		}
	},

	toString: function() {
		return this.name;
	}
});