(function() {
	var CassidieClass = Events.Observable.extend({
		clientID:			null,
		characterID:		null,
		socket:				null,
		useCustomeEngine:	null,
	
		initialize: function() {
			
		},
	
		start: function(serverName, targetDiv, _useCustomeEngine) {
		    var self		= this;
	
			this.useCustomeEngine = _useCustomeEngine;
	
			if (typeof io == 'undefined') {
				self.trigger(Events.NO_SERVER, {server: serverName});
	
				return;
			}
	
			this.socket		= io.connect(serverName);
			this.targetDiv	= document.getElementById(targetDiv);
	
			Account.setup();
			Chat.setup();
	
			this.socket.on('welcome', function (data) {
				if (data.clientID) {
					self.clientID 	= data.clientID;
	
					Game.setup(data.game);
	
					self.trigger(Events.CONNECT, data);
				}
			});
	
			this.socket.on('disconnect', function() {
				Game.clean();
				self.trigger(Events.DISCONNECT);
			});
	
			this.socket.on('error', function() {
				alert('An error occured');
			});
		}
	});
	this.Cassidie = new CassidieClass();
})();