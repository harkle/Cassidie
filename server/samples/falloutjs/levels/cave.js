var Level		= require('../../../lib/cassidie/components/level.js');
var Chest		= require('../items/chest.js');

module.exports = Level.extend({

	initialize: function(data) {
		this._super(data);

		var chest = new Chest(10, 2, this.getItemData('Chest'));
		this.attachItem(chest);
	}
});