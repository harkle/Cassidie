var Player = require('../../lib/cassidie/components/player.js');

module.exports = Player.extend({
	attributes: {
		name: '',
		skin: ''
	},
	quests: {
		'kill_rats': {
		    taken: false,
		    done: false,
		    kills: 0
		}
	},
	weapon: 'none',
	health: 100,

	initialize: function(client, data) {
		this._super(client, data);

		this.skinCoordinates = [0, 60, 80, 80];
		this.animationList.extend({
			'standing': {numFrame: 1, looping: false},
			'walking':  {numFrame: 8, looping: true},
			'action_1': {numFrame: 9, looping: false}
		});
	},

	action: function(target) {
		var result = {
			success: 	false,
			name: 		''			
		};

		var distance = this.getDistanceFrom(target);

		if (distance == 1 && target.type == 'item') {
			var result = target.use(this);

			if (result) this.setAppearance('action_1');

			result = {
				success: 	result,
				name: 		'useItem'		
			};
		}
		
		if (distance == 1 && target.type == 'npc' && !this.isEnnemy) {
			result = {
				success: 	target.talk(this),
				name: 		'talk'		
			};			
		}
		this._super(target, result);
	}
});