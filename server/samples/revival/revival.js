// imports
				  	  require('../../lib/cassidie/cassidie.js');
var Game			= require('../../lib/cassidie/components/game.js');
var CustomPlayer	= require('./players/customPlayer.js');

var myGame		= Game.extend({
	initialize: function(data) {
		this._super(data, CustomPlayer);

		Logger.log(this.name, '		* my game constructor');
	}
});
Cassidie.start('localhost', 27017, 'cassidie', myGame, 'Test1');