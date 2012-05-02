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
			
			self.setParameter('life', 100, true);
			//self.setPosition(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
		}, 1000);
	},

	toString: function() {
		return this.attributes.name;
	}
});