(function() {
	this.Cassidie 		= function() {};

	this.Cassidie.load 	= function(scripts, path, server, targetDiv) {
		function setupCassidie() {
			this.Cassidie.prototype 			= new Events.Observable();
			this.Cassidie.prototype.constructor	= this.Cassidie;
			this.Cassidie 						= new Cassidie();

			this.Cassidie.clientID		= null;
			this.Cassidie.characterID	= null;
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

				this.socket.on('welcome', function (data) {
					if (data.clientID) {
						self.clientID 	= data.clientID;
						Game.initialize(data.game);

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
			};
		}

		domready(function() {
			load([path+'utils/class.js']).then([path+'utils/md5.js', path+'utils/graphics/three.js', path+'utils/graphics/stat.js', path+'utils/events.js', server+'/socket.io/socket.io.js']).then([path+'utils/graphics/threeEngine.js', path+'utils/graphics/divEngine.js', path+'account.js', path+'chat.js', path+'components/game.js', path+'components/level.js']).then([path+'components/entity.js']).then([path+'components/item.js', path+'components/character.js']).then([path+'utils/pathfinding/graph.js', path+'utils/pathfinding/astar.js']).thenRun(function () {

				setupCassidie();			

				load(scripts).thenRun(function() {
					Cassidie.start(server, targetDiv);
				});
			});
		});
	};
})();