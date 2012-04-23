(function() {
	this.Account			= function() {};
	this.Account.prototype	= Events.Observable;
	this.Account 			= new Account();

	this.Account.initialize = function() {
		var self = this;

		Cassidie.socket.on('register_success', function(data) {
			self.trigger(Events.REGISTER_SUCCESS, data);
		});

		Cassidie.socket.on('register_fail', function(data) {
			self.trigger(Events.REGISTER_FAIL, data);
		});

		Cassidie.socket.on('login_success', function(data) {
			self.trigger(Events.LOGIN_SUCCESS, data);
		});

		Cassidie.socket.on('login_fail', function(data) {
			self.trigger(Events.LOGIN_FAIL, data);
		});

		Cassidie.socket.on('logout', function(data) {
			self.trigger(Events.LOGOUT, data);
		});

		Cassidie.socket.on('character_list', function(data) {
			self.trigger(Events.CHARACTER_LIST, data);
		});

		Cassidie.socket.on('character_structure', function(data) {
			self.trigger(Events.CHARACTER_STRUCTURE, data);
		});

		Cassidie.socket.on('character_created', function(data) {
			self.trigger(Events.CHARACTER_CREATED, data);
		});
		
		Cassidie.socket.on('character_removed', function(data) {
			self.trigger(Events.CHARACTER_REMOVED, data);
		});
	};

	this.Account.register = function(email, password, nickname) {
		Cassidie.socket.emit('register', {email: email, password: password, nickname: nickname});
	};

	this.Account.login = function(email, password) {
		Cassidie.socket.emit('login', {email: email, password: password})	
	};

	this.Account.logout = function() {
		Cassidie.socket.emit('logout');	
	};

	this.Account.getCharacters = function() {
		Cassidie.socket.emit('get_character_list');	
	};

	this.Account.getCharacterStructure = function() {
		Cassidie.socket.emit('get_character_structure');	
	};

	this.Account.createCharacter = function(data) {
		Cassidie.socket.emit('create_character', data);	
	};

	this.Account.removeCharacter = function(id) {
		Cassidie.socket.emit('remove_character', {id: id});			
	};
})();