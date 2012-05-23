var Player = require('../../../lib/cassidie/components/Player.js');

module.exports = Player.extend({
	activity: null,

	initialize: function(client, data) {
		this._super(client, data);

		if (data == undefined) {
			this.attributes.skin = '';
			this.activity		 = 0;
		}		
	},

	action: function(target) {
		var result = {
			success: false,
			name:	 ''
		};

		if (this.activity == 0) result = this.actionNormal(target);
		if (this.activity == 1) result = this.actionAttack(target);		

		this._super(target, result);
	},

	actionNormal: function(target) {
		return {
			success: true,
			name:	 'normal'		
		};		
	},

	actionAttack: function(target) {
		var distance = this.getDistanceFrom(target);
		
		if (distance > 1) {
			return {
				success: false,
				name:	 'attack'
			};		
		} else {
			this.setAppearance('action_1');
			target.setAppearance('hit');

			//target.hide();
			
			setTimeout(function() {
				target.show();
			}, 10000);

			return {
				success: true,
				name:	 'attack'
			};
		}
	},

	toString: function() {
		return this.attributes.name;
	}
});