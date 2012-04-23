require('./utils/class.js');
require('./utils/logger.js');
require('./utils/account.js');
(function() {

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
			
			Logger.systemLog(self.consoleName, 'loading game infos');			
			self.database.find('games', {name: gameName}, function(data) {
				if (data.length == 0) {
					Logger.error(self.consoleName, 'unable to find game in database');
					this.Cassidie.exit();
				}

				self.game			= new self.gameObject(data[0]);
				self.gameStartTime	= new Date().getTime();
				self.isRunning		= true;

				Logger.systemLog(self.consoleName, 'game started');			
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
	};

	this.Cassidie.addClient = function(client) {
		this.clients.push(client);	
	};
	
	this.Cassidie.removeClient = function(id) {
		for (var i = 0; i < this.clients.length; i++) {
			if (this.clients[i].getID() == id) {
				this.clients.splice(i, 1);
			}
		}
	};
	
	this.Cassidie.exit = function() {
		Logger.systemLog(Cassidie.consoleName, 'shutdown');
		Cassidie.database.close();
		process.exit(1);		
	};
})();