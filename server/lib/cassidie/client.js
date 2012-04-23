var Client = function(socket) {
	this.clientID		= new Date().getTime();
	this.socket   		= socket;
	this.authenticated	= false;
	this.email			= null;
	this.nickname		= null;
	this.charactersData	= null;

	this.getID = function() {
		return this.clientID;				
	}

	this.getAuthenticated = function() {
		return this.authenticated;
	}

	this.setAuthenticated = function(authenticated) {
		this.authenticated = authenticated;
	}

	this.getEmail = function() {
		return this.email;
	}

	this.setEmail = function(email) {
		this.email = email;
	}

	this.getNickname = function() {
		return this.nickname;
	}	

	this.setNickname = function(nickname) {
		this.nickname = nickname;
	}	

	this.getCharactersData = function() {
		return this.charactersData;
	}

	this.setCharactersData = function(charactersData) {
		this.charactersData = charactersData;
	}
}

module.exports = Client;