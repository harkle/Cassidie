var GameObject = require('./gameObject.js');

module.exports = GameObject.extend({
	skin: null, 
	
	initialize: function(skin, x, y, data) {
		this._super('interactiveObject', data);
		
		this.skin	= skin;
		this.x		= x;
		this.y		= y;
	}
});