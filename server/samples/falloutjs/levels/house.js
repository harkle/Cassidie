var Level			= require('../../../lib/cassidie/components/level.js');
var HealthPack		= require('../items/healthPack.js');

module.exports = Level.extend({

	initialize: function(data) {
		this._super(data);

		var healthPack1 = new HealthPack(2, 1, this.getItemData('Health Pack'));
		this.attachItem(healthPack1);
	}
});