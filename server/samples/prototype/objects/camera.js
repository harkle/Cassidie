var Item = require('../../../lib/cassidie/components/item.js');

module.exports = Item.extend({
	initialize: function(x, y, data) {
		this._super('camera', x, y, data);

		this.skinCoordinates = [20, 65, 38, 73];
		this.animationList				= {
			'hit':  {numFrame: 9, looping: false}
		};

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
		
		this.isVisible	= true;
		this.appearance = 'default';
	},

	proximity: function(target, distance) {
		/*if (distance < 3 && target.type == 'player') {
			console.log('stop');
			target.setPosition(0,0, true, true);
		}*/
	},

	toString: function() {
		return this.name;
	}
});