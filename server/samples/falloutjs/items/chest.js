var Item = require('../../../lib/cassidie/components/item.js');

module.exports = Item.extend({
	initialize: function(x, y, data) {
		this._super('chest', x, y, data);

		this.skinCoordinates = [0, 12, 80, 36];

		if (data == undefined) {
			this.name				= 'Chest';
		}

		this.isVisible	= true;
		this.appearance = 'default';
	},

	use: function(target) {
		if (target.weapon != 'none') return false;

		target.setParameter('weapon', 'gun');
		target.setParameter('attributes.skin', 1);

		return true;
	}
});