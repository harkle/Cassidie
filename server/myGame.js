// imports
				  require('./lib/cassidie/cassidie.js');
var Game		= require('./lib/cassidie/components/game.js');

var myGame		= Game.extend({
	initialize: function() {
		this._super();

		this.name = 'test 1';

		Logger.log(this.name, '		* my game constructor');
	}
});
Cassidie.start(myGame);