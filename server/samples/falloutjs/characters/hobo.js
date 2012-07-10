var NPC 		= require('../../../lib/cassidie/components/npc.js');

var texts = [
	'Oh my god',
	'What time is it?',
	'I should go home...'
];

module.exports = NPC.extend({

	initialize: function(x, y, direction, data) {
		this._super(x, y, data);

		this.skinCoordinates 			= [0, 60, 80, 80];
		this.animationList.extend({
			'walking':  {numFrame: 1, looping: true},
			'speaking':  {numFrame: 13, looping: false},
		});

		this.attributes.name			= 'Hobo';
		this.attributes.skin 			= 1;
		this.isEnnemy 					= false;
		this.direction					= direction;

		this.triggerSpeach();
	},
	
	triggerSpeach: function() {
		this.setAppearance('speaking');
		this.speak(texts[Math.floor(Math.random() * texts.length)]);

		var self = this;
		setTimeout(function() {
			self.triggerSpeach();	
		}, 10000 + Math.random() * 20000);
	}
});