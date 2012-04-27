(function() {
	this.Cassidie 		= function() {};

	this.Cassidie.load 	= function(scripts, server, targetDiv) {
		function setupCassidie() {
			this.Cassidie.prototype 	= Events.Observable;
			this.Cassidie 				= new Cassidie();

			this.Cassidie.clientID		= null;
			this.Cassidie.characterID	= null;
			this.Cassidie.game			= null;
			this.Cassidie.socket		= null;

			this.Cassidie.start = function(serverName, targetDiv) {
				var self		= this;

				if (typeof io == 'undefined') {
					self.trigger(Events.NO_SERVER, {server: serverName});

					return;
				}

				this.socket		= io.connect(serverName);
				this.targetDiv	= document.getElementById(targetDiv);

				Account.initialize();
				Chat.initialize();
				Game.initialize();

				this.socket.on('welcome', function (data) {
					if (data.clientID) {
						self.clientID 	= data.clientID;
						self.game 		= data.game;

						self.trigger(Events.CONNECT, data);
					}
				});

				this.socket.on('disconnect', function() {
					self.clean();
					self.trigger(Events.DISCONNECT);
				});

				this.socket.on('error', function() {
					alert('An error occured');
				});
			};
		}

		domready(function() {
			load(['/lib/cassidie/utils/events.js', server+'/socket.io/socket.io.js']).then(['/lib/cassidie/account.js', '/lib/cassidie/chat.js', '/lib/cassidie/components/game.js', '/lib/cassidie/components/level.js', '/lib/cassidie/components/character.js', '/lib/cassidie/utils/pathfinding/graph.js', '/lib/cassidie/utils/pathfinding/astar.js']).thenRun(function () {

				setupCassidie();			

				load(scripts).thenRun(function() {
					Cassidie.start(server, targetDiv);
				});
			});
		});
	};
})();