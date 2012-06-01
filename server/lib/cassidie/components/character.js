var Entity = require('./entity.js');

module.exports = Entity.extend({
	attributes: 	null,
	isMoving:		null,
	destinationX:	null,
	destinationY:	null,

	initialize: function(type, data) {
		this._super(type, data);

		if (data == undefined) {
			this.attributes	= {
				name: ''
			};
			this.type			= type;
			this.x				= 0;
			this.y				= 0;
			this.isMoving		= false;
			this.destinationX	= 0;
			this.destinationY	= 0;
			this.isVisible		= true;
			this.appearance		= 'standing';
		}

		this.animationList				= {
			'walking':  {numFrame: 1, looping: true},
		};

		this.objectType = 'character';
	},

	toString: function() {
		return 'character'
	},

	removeFromLevel: function() {
		this.level.detachCharacter(this.id);
		this.level = null;	
	},

	moveTo: function(x, y, notify) {
		if (!this.isVisible) return;
		if (notify == undefined) notify = false;

		this.destinationX	= x;
		this.destinationY	= y;
		this.isMoving		= true;
		this.setAppearance('walking');

		this.sendData('character_moved', {x: this.destinationX, y: this.destinationY}, notify);	
	},

	setPosition: function(x, y, end, notify) {
		if (notify == undefined) notify = false;

		this.x = x;
		this.y = y;

		this.proximityCheck();

		if (end) {
			this.isMoving	= false;
			this.setAppearance('standing');

			if (this.type == 'player') {
				var cell = this.level.getCell(this.x, this.y);

				if (cell.level != undefined) Cassidie.game.changeLevel(this, cell.level);
			}
		}

		if (notify) this.sendData('character_positioned', {x: this.x, y: this.y}, true);	
	},

	speak: function(message) {
		if (!this.isVisible) return;

		Cassidie.chat.broadcast(this, {
			action: 'speak',
			message: message		
		}, this.level);
	}
});