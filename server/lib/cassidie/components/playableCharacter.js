var Character = require('./character.js');

module.exports = Character.extend({
	level:	'',

	initialize: function() {
		this._super('player');
	}
});