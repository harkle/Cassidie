require('./utils/class.js');
require('./utils/logger.js');
(function() {

	// Start console listening
	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	process.stdin.on('data', function (input) {
		Logger.systemLog(Cassidie.consoleName, input.trim().toUpperCase());

		switch (input.trim()) {
			case 'exit':
				Logger.systemLog(Cassidie.consoleName, 'Shutdown');	
				process.exit(1);
				break;
			case 'status':
				Cassidie.showStatus();
				break;
			case 'reset':
				Cassidie.reset();
				break;
		}
	});

	this.Cassidie =  {
		netConnection:	null,
		gameObject:		null,
		game:			null,

		startTime:		new Date().getTime(),
		gameStartTime:	0,
		isRunning:		false,

		version:		'0.1',
		consoleName:	'CASSIDIE	'
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
		
		Logger.systemLog('version:	'+this.version);
		Logger.systemLog('uptime: 	'+(uptime.getDate() - 1)+' day '+(uptime.getHours() - 1)+':'+uptime.getMinutes()+':'+uptime.getSeconds());
		Logger.systemLog('game name: 	'+(gameUptime.getDate() - 1)+' day '+(gameUptime.getHours() - 1)+':'+gameUptime.getMinutes()+':'+gameUptime.getSeconds());
		Logger.systemLog('game uptime	'+this.game.name);		
	};
})();