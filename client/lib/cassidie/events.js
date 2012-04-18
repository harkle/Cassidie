(function() {
	this.Events						= {};
	this.Events.Observable 			= {};
	this.Events.Observable.events	= [];

	this.Events.Observable.observe = function(event, callback) {
			if (!this.events[event]) this.events[event] = [];
			this.events[event].push(callback);
	};

	this.Events.Observable.trigger = function(event, data) {
			for (var i = 0; i < this.events[event].length; i++) {
				this.events[event][i].apply(Cassidie, [data]);
			}
	};

	this.Events.CONNECT 	= 0;
	this.Events.DISCONNECT	= 1;
	this.Events.LOGIN		= 2;
	this.Events.LOGOUT		= 3;
	this.Events.REGISTER	= 4;
	this.Events.ENTER_GAME	= 5;
})();