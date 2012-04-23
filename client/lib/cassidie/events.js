(function() {
	this.Events						= {};
	this.Events.Observable 			= {};
	this.Events.Observable.events	= [];

	this.Events.Observable.observe = function(event, callback) {
		if (!this.events[event]) this.events[event] = [];
		this.events[event].push(callback);
	};

	this.Events.Observable.trigger = function(event, data) {
		if (!this.events[event]) return;
		for (var i = 0; i < this.events[event].length; i++) {
			this.events[event][i].apply(Cassidie, [data]);
		}
	};

	this.Events.CONNECT 				= 0;
	this.Events.DISCONNECT				= 1;
	this.Events.LOGIN_SUCCESS			= 2;
	this.Events.LOGIN_FAIL				= 3;
	this.Events.REGISTER_SUCCESS		= 4;
	this.Events.REGISTER_FAIL			= 5;
	this.Events.LOGOUT					= 6;
	this.Events.CHARACTER_LIST			= 7;
	this.Events.CHARACTER_STRUCTURE		= 8;
	this.Events.CHARACTER_CREATED		= 9;
	this.Events.CHARACTER_NOT_CREATED	= 10;
	this.Events.CHARACTER_REMOVED		= 11;
})();