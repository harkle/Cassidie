var Item = require('../../../lib/cassidie/components/item.js');

module.exports = Item.extend({
	initialize: function(x, y, data) {
		this._super('healthPack', x, y, data);

		this.skinCoordinates = [0, 12, 80, 36];

		if (data == undefined) {
			this.name				= 'Health pack';
		}
		
		this.isVisible	= true;
		this.appearance = 'default';
	},
	
	use: function(target) {
		if (!this.isVisible) return false;
		if (target.health >= 100) return false;

		var health = target.health + 50;
		if (health > 100) health = 100;

		target.setParameter('health', health);
		
		this.hide();

		var self = this;
		setTimeout(function() {
			self.show();
		}, 30000);
		
		return true;
	}
});