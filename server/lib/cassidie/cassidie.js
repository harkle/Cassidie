require('./utils/class.js');
require('./utils/logger.js');
(function() {

	// Start console listening
	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	process.stdin.on('data', function (input) {
		Logger.userLog('user		', input.trim());

		switch (input.trim()) {
			case 'exit':
				Logger.systemLog(Cassidie.consoleName, 'Shutdown');	
				process.exit(1);
				break;
			case 'status':
				Cassidie.showStatus();
				break;
			case 'clients':
				Cassidie.showClients();
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

	this.Cassidie.start = function(gameObject) {
		this.gameObject = gameObject;

		this.netConnection	= require('./utils/netConnection.js');
		this.game			= new this.gameObject();
		this.gameStartTime	= new Date().getTime();
		this.isRunning		= true;

		Logger.systemLog(this.consoleName, 'game started');		
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
			Logger.systemLog('ID: '+this.clients[i].getID());
		}		
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
})();