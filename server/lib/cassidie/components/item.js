var Entity = require('./entity.js');

module.exports = Entity.extend({
	skin:	null, 

	initialize: function(skin, x, y, data) {
		this._super('interactiveObject', data);

		if (data == undefined) {
			this.skin			= skin;
			this.x				= x;
			this.y				= y;
			this.appearance		= 'default';
		}

		this.objectType = 'object';
	}
});