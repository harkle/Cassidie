var Level	= require('./lib/cassidie/components/level.js');
var Npc 	= require('./npc.js');

module.exports = Level.extend({

	initialize: function(data) {
		this._super(data);
		
		var npc = new Npc(this.getCharacterData('The terrible NPC'));
		this.attachCharacter(npc);
	}
});