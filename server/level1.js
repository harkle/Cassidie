var Level	= require('./lib/cassidie/components/level.js');
var Npc 	= require('./npc.js');
var Camera 	= require('./camera.js');

module.exports = Level.extend({

	initialize: function(data) {
		this._super(data);
		
		var npc = new Npc(this.getCharacterData('The terrible NPC'));
		this.attachCharacter(npc);
		
		var camera = new Camera(10, 10, this.getCharacterData('Camera'));
		this.attachObject(camera);
	}
});