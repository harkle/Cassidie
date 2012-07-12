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
	weapon: 	'none',
	health: 	100,
	lastAttack: 0,

	initialize: function(client, data) {
		this._super(client, data);
		this.exclusionList.push('lastAttack');

		this.skinCoordinates = [0, 60, 80, 80];
		this.animationList.extend({
			'standing':	{numFrame: 1, looping: false},
			'walking':	{numFrame: 8, looping: true},
			'take':		{numFrame: 8, looping: false},
			'die':		{numFrame: 12, looping: false},
			'hit':		{numFrame: 7, looping: false},
			'attack':	{numFrame: 17, looping: false}
		});
	},


	action: function(target) {
		if (this.isDead) result;

		var result = {
			success: 	false,
			name: 		''			
		};

		var distance = this.getDistanceFrom(target);

		if (distance == 1 && target.type == 'item') result = this.take(target);
		
		if (distance == 1 && target.type == 'npc' && !target.isEnnemy) result = this.talk(target);
		
		if (target.isEnnemy) result = this.attack(target);

		this._super(target, result);
	},
	
	take: function(target) {
		var result = target.use(this);

		if (result) this.setAppearance('take');

		return {
			success: 	result,
			name: 		'useItem'		
		};		
	},
	
	attack: function(target) {
		var time   = new Date().getTime();
		if (time - this.lastAttack < 2000) {
			return {
		    	success: 	false,
		    	name: 		'fight'		
		    };
		}
		this.lastAttack = time;

		var distance = this.getDistanceFrom(target);

		if (distance  < 4) {
			if (target.isDead) return;

		    this.setPositionFromTarget(target);
		    this.setAppearance('attack');

		    var damages = 20 + Math.floor(Math.random() * 10);
		    var isDead = target.hit(damages);

		    if (isDead) {
		    	//We check if the quest is finished
		    	if (target.attributes.name == 'Rat' && !this.quests['kill_rats'].done && this.quests['kill_rats'].taken && this.quests['kill_rats'].kills < 3) {
		    		this.setParameter('quests["kill_rats"].kills', this.quests['kill_rats'].kills + 1);
		    	}
		    }

		    result = {
		    	success: 	true,
		    	name: 		'fight'		
		    };
		} else {
		    result = {
		    	success: 	false,
		    	name: 		'fight'		
		    };
		}

		return result;	
	},
	
	talk: function(target) {
		return {
			success: 	target.talk(this),
			name: 		'talk'		
		};
	},

	hit: function(damages) {
		this.setParameter('health', this.health -= damages);

		if (this.health <= 0) {
			this.setParameter('isDead', true);
		    this.setAppearance('die');

		    var self = this;
		    setTimeout(function() {
			    self.isDead		= false;
			    self.health		= 100;
			    self.appearance = 'standing';
			    self.direction	= 'se';

		    	Cassidie.game.changeLevel(self, 'house');
		    }, 5000);
		}
	}
});