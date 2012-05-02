var InteractiveObject = require('./lib/cassidie/components/interactiveObject.js');

module.exports = InteractiveObject.extend({
	initialize: function(x, y, data) {
		this._super('camera', x, y, data);

		if (data == undefined) {
			this.name				= 'Camera';
		}
	},

	toString: function() {
		return this.attributes.name;
	}
});