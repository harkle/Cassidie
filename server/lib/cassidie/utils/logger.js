(function() {
	this.Logger = {};
	
	function log(color, emmiter, message) {
		if (message == undefined) {
			message = emmiter;
			emmiter = '		';
		}

		console.log(color+emmiter+'\033[0m'+message);
	};

	this.Logger.userLog = function(emmiter, message) {
		log('\033[0m',emmiter, message);		
	};

	this.Logger.systemLog = function(emmiter, message) {
		log('\033[35m',emmiter, message);		
	};

	this.Logger.log = function(emmiter, message) {
		log('\033[36m',emmiter, message);
	};
})();