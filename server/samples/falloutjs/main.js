				  	  require('../../lib/cassidie/cassidie.js');
var Game			= require('../../lib/cassidie/components/game.js');
var MyPlayer		= require('./players/myPlayer.js');

var Fallout		= Game.extend({
	initialize: function(data) {
		this._super(data, MyPlayer);
	}
});

Cassidie.start('localhost', 27017, 'falloutdb', Fallout, 'Fallout');