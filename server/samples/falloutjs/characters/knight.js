var NPC 		= require('../../../lib/cassidie/components/npc.js');

module.exports = NPC.extend({

	initialize: function(name, x, y, direction, data) {
		this._super(x, y, data);

		this.skinCoordinates 			= [0, 60, 80, 80];
		this.animationList.extend({
			'walking':  {numFrame: 1, looping: true},
		});

		this.attributes.name			= name;
		this.attributes.skin 			= 2;
		this.isEnnemy 					= false;
		this.direction					= direction;
	},

	talk: function(target) {
		if (target.quests['kill_rats'].done) {
			this.speak('You gave already done my quest.');
		} else if (target.quests['kill_rats'].taken) {
			if (target.quests['kill_rats'].kills < 3) {
				this.speak('Go and kill this rats!');
			} else {
				this.speak('Nice job! You finish the quest.');
				target.setParameter('quests["kill_rats"].done', true);
			}
		} else {
			this.speak('Hello '+target.attributes.name+'! Go in the cave, take a weapon in the chest and go kill 3 rats in the south fence.');
			target.setParameter('quests["kill_rats"].taken', true);
		}
	}
});