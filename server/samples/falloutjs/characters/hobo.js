var NPC 		= require('../../../lib/cassidie/components/npc.js');

var texts = [
	'Oh my god...',
	'What time is it?',
	'I should go home...'
];

module.exports = NPC.extend({

	initialize: function(name, x, y, direction, data) {
		this._super(x, y, data);

		this.skinCoordinates 			= [0, 60, 80, 80];
		this.animationList.extend({
			'walking':  {numFrame: 1, looping: true},
			'speaking':  {numFrame: 13, looping: false},
		});

		this.attributes.name			= name;
		this.attributes.skin 			= 4;
		this.isEnnemy 					= false;
		this.direction					= direction;
	},
	
	talk: function() {
		this.setAppearance('speaking');
		this.speak(texts[Math.floor(Math.random() * texts.length)]);
	}
});