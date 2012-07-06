var Player = require('../../lib/cassidie/components/player.js');

module.exports = Player.extend({
	initialize: function(client, data) {
		this._super(client, data);

		this.skinCoordinates 			= [0, 60, 80, 80];
		this.animationList.extend({
			'standing': {numFrame: 1, looping: false},
			'walking':  {numFrame: 8, looping: true},
			'action_1': {numFrame: 9, looping: false}
		});

		//Only first time player is created
		if (data == undefined) {
			this.attributes.name = '';
			this.attributes.skin = '';
		}		
	}
});