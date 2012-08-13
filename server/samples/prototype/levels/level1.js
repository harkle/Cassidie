var Level			= require('../../../lib/cassidie/components/level.js');
var TheTerribleNPC 	= require('../characters/theTerribleNPC.js');
var Camera 			= require('../objects/camera.js');

module.exports = Level.extend({

	initialize: function(data) {
		this._super(data);

		var theTerribleNPC = new TheTerribleNPC(this.getCharacterData('The terrible NPC'));
		this.attachCharacter(theTerribleNPC);

		var camera = new Camera(10, 10, this.getItemData('Camera'));
		this.attachItem(camera);
	}
});