var NPC 		= require('../../../lib/cassidie/components/npc.js');

module.exports = NPC.extend({
	health: 		50,
	lastAttack: 	0,
	attackInterval:	null,
	currentTarget:	null,

	initialize: function(x, y, direction, data) {
		this._super(x, y, data);
		this.exclusionList.push('lastAttack', 'attackInterval', 'currentTarget');

		this.skinCoordinates 			= [-35, 80, 140, 140];
		this.animationList.extend({
			'walking':  {numFrame: 1, looping: false},
			'attack':  {numFrame: 6, looping: false},
			'hit':  {numFrame: 5, looping: false},
			'die': {numFrame: 9, looping: false}
		});

		this.attributes.name			= 'Rat';
		this.attributes.skin 			= 5;
		this.isEnnemy 					= true;
		this.direction					= direction;
	},

	talk: function() {
	},

	proximity: function(target, distance) {
		if (this.isDead) return;
		if (target.type == 'npc') return;

		if(distance < 2) {
			this.attack(target);
		} else {
			if (target.id == this.currentTarget) {
				clearTimeout(this.attackInterval);
			}
		}
	},

	attack: function(target) {
		var time   = new Date().getTime();
		if (time - this.lastAttack < 1500) return;
		this.lastAttack = time;

		if (target.isDead) return;

		clearTimeout(this.attackInterval);

		this.currentTarget = target.id;
		this.setPositionFromTarget(target);
		this.setAppearance('attack');

		var damages = 5 + Math.floor(Math.random() * 5);
		target.hit(damages);

		var self = this;
		this.attackInterval = setTimeout(function() {
			self.attack(target);
		}, 1600);
	},

	hit: function(damages) {
		this.setParameter('health', this.health -= damages);

		var self = this;

		if (this.health <= 0) {
			this.die();
			return true;
		} else {
			setTimeout(function() {
				self.setAppearance('hit');	
			}, 600);
		}

		return false;
	},
	
	die: function() {
		this.isDead = true;

		clearTimeout(this.attackInterval);

		var self = this;

		setTimeout(function() {
			self.setAppearance('die');	
		}, 600);

		this.repop();
	},

	repop: function() {
		var self = this;

		setTimeout(function() {
			self.hide();	

			setTimeout(function() {
				self.isDead = false;
				self.health = 50;
				self.setAppearance('standing');
				self.show();
			}, 5000);
		}, 10000);
	}
});