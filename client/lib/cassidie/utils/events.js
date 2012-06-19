(function() {
	this.Events						= {};
	this.Events.Observable 			= Class.create({
		events: [],

		initialize: function() {
			
		},

		observe: function(event, callback) {
			if (!this.events[event]) this.events[event] = [];
			this.events[event].push(callback);
		}, 

		trigger:function(event, data) {
			if (!this.events[event]) return;
			for (var i = 0; i < this.events[event].length; i++) {
				this.events[event][i].apply(Cassidie, [data]);
			}
		},

		release: function(event) {
			if (!this.events[event]) return;

			this.events[event] = [];
		}
	});

	this.Events.NO_SERVER					= 0;
	this.Events.CONNECT 					= 1;
	this.Events.DISCONNECT					= 2;
	this.Events.LOGIN_SUCCESS				= 3;
	this.Events.LOGIN_FAIL					= 4;
	this.Events.REGISTER_SUCCESS			= 5;
	this.Events.REGISTER_FAIL				= 6;
	this.Events.LOGOUT						= 7;
	this.Events.CHARACTER_LIST				= 8;
	this.Events.CHARACTER_STRUCTURE			= 9;
	this.Events.CHARACTER_CREATED			= 10;
	this.Events.CHARACTER_NOT_CREATED		= 11;
	this.Events.CHARACTER_REMOVED			= 12;
	this.Events.GAME_ENTERED				= 13;
	this.Events.GAME_LEFT					= 14;
	this.Events.CHARACTER_PARAMETER_CHANGED = 15;
	this.Events.OBJECT_PARAMETER_CHANGED	= 16;
	this.Events.ACTION_TRIGGERED			= 17;
	this.Events.CHARACTER_ACTION_SUCCESS	= 18;
	this.Events.CHARACTER_ACTION_FAIL		= 19;
	this.Events.CHARACTER_ACTION_PERFORMED	= 20;
	this.Events.LEVEL_LEAVE					= 21;
	this.Events.LEVEL_ENTER					= 22;
})();