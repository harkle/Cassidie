require('./utils/class.js');
require('./utils/logger.js');
require('./utils/account.js');
var Game = require('./components/game.js');

(function() {
	var	util 		= require('util');

	// Start console listening
	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	process.stdin.on('data', function (input) {
		Logger.userLog('user		', input.trim());

		switch (input.trim()) {
			case 'exit':
				Cassidie.exit();
				break;
			case 'status':
				Cassidie.showStatus();
				break;
			case 'clients':
				Cassidie.showClients();
				break;
			case 'game':
				Cassidie.showGame();
				break;
			case 'reset':
				Cassidie.reset();
				break;
		}
	});

	//Some declaration
	this.Cassidie =  {
		netConnection:	null,
		gameObject:		null,
		game:			null,
		database:		null,
		chat:			null,

		startTime:		new Date().getTime(),
		gameStartTime:	0,
		isRunning:		false,

		version:		'0.1',
		consoleName:	'cassidie	',

		clients:		[]
	}

	console.log('\033[2J');
	console.log('\033[0;0H');
	Logger.systemLog(Cassidie.consoleName, 'framework started');

	this.Cassidie.start = function(dbServer, dbPort, dbName, gameObject, gameName) {
		Logger.systemLog(this.consoleName, 'connecting to database');

		var Database	= require('./utils/database.js');
		this.database	= new Database(dbServer, dbPort, dbName);

		var self = this;
		this.database.on(Database.IS_READY, function() {
			self.gameObject 	= gameObject;

			Logger.systemLog(self.consoleName, 'starting websocket');			
			self.netConnection	= require('./utils/netConnection.js');

			var Chat = require('./chat.js');
			self.chat = new Chat();

			Logger.systemLog(self.consoleName, 'loading game infos');
			self.database.find('games', {name: gameName}, function(data) {
				if (data.length == 0) {
					Logger.error(self.consoleName, 'unable to find game in database');
					this.Cassidie.exit();
				}

				self.game = new self.gameObject(data[0]);

				self.game.on(Game.READY, function() {
					self.gameStartTime	= new Date().getTime();
					self.isRunning		= true;

					Logger.systemLog(self.consoleName, 'game started');		
				});
			});
		});
	};

	this.Cassidie.reset = function() {
		//Destroy all client, etc. 
		//Save stuff?
		this.game			= new this.gameObject();
		this.gameStartTime	= new Date().getTime();

		Logger.systemLog(this.consoleName, 'game reseted');		
	};

	this.Cassidie.showStatus = function() {
		var uptime = new Date();
			uptime.setTime(new Date().getTime() - this.startTime);

		var gameUptime = new Date();
			gameUptime.setTime(new Date().getTime() - this.gameStartTime);

		Logger.systemLog(this.consoleName, 'version:	'+this.version);
		Logger.systemLog('uptime:		'+(uptime.getDate() - 1)+' day '+(uptime.getHours() - 1)+':'+uptime.getMinutes()+':'+uptime.getSeconds());
		Logger.systemLog('game uptime: 	'+(gameUptime.getDate() - 1)+' day '+(gameUptime.getHours() - 1)+':'+gameUptime.getMinutes()+':'+gameUptime.getSeconds());
		Logger.systemLog('game name:	'+this.game.name);		
		Logger.systemLog('client count:	'+this.clients.length);

		/*var memory = util.inspect(process.memoryUsage());
		Logger.systemLog('memory usage:	'+(memory) + 'Mo');*/
	};

	this.Cassidie.showClients = function() {
		Logger.systemLog(this.consoleName, 'there is ' + this.clients.length + ' clients');

		for (var i = 0; i < this.clients.length; i++) {
			if (this.clients[i].getAuthenticated()) {
				Logger.systemLog('ID: '+this.clients[i].getID()+', AS: '+this.clients[i].getEmail()+'('+this.clients[i].getNickname()+')');
			} else {
				Logger.systemLog('ID: '+this.clients[i].getID());
			}
		}		
	};

	this.Cassidie.showGame = function() {
		Logger.systemLog(this.consoleName, 'game informations');

		Logger.systemLog('name:		'+this.game.name);
		Logger.systemLog('title:		'+this.game.title);
		Logger.systemLog('viewport:	'+this.game.viewport.width+'x'+this.game.viewport.height);
		Logger.systemLog('max char.:	'+this.game.maxCharacters);

		var levels 		= '';
		var levelsCount = 0;
		for (level in this.game.levels) {
			levels += this.game.levels[level].name+',';
			levelsCount++;
		}
		Logger.systemLog('levels:		'+levelsCount+' ('+levels.substring(0, levels.length-1)+')');

		var clients = '';
		for (var i = 0; i < this.game.clients.length; i++) {
			clients += this.game.clients[i].email+',';
		}
		Logger.systemLog('player:		'+this.game.clients.length+' ('+clients.substring(0, clients.length-1)+')');
	};

	this.Cassidie.addClient = function(client) {
		this.clients.push(client);	
	};

	this.Cassidie.removeClient = function(id) {
		for (var i = 0; i < this.clients.length; i++) {
			if (this.clients[i].getID() == id) {
				this.game.leave(this.clients[i].socket);
				this.clients.splice(i, 1);
			}
		}
	};

	this.Cassidie.exit = function() {
		//SAVE ALL

		Logger.systemLog(Cassidie.consoleName, 'saving...');
		this.game.stop(function() {
			Cassidie.database.close();
			Logger.systemLog(Cassidie.consoleName, 'shutdown');
			process.exit(1);			
		});
	};

	this.Cassidie.wait = function(callbacks, done) {
		var counter = callbacks.length;
		var next = function() {
			if(--counter == 0) {
				done();
			}
		};

		for(var i = 0; i < callbacks.length; i++) {
			callbacks[i](next);
		}
	};

	this.Cassidie.getClientsFromCharacterName = function(name) {
		var client = null;
		for (var i = 0; i < this.clients.length; i++) {
			for (var j = 0; j < this.clients[i].charactersData.length; j++) {
				if (this.clients[i].charactersData[j].attributes.name.toLowerCase() == name.toLowerCase()) client = this.clients[i];
			}
		}

		return client;
	};
})();