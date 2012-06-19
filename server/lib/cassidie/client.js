var Client = function(socket) {
	this.clientID		= new Date().getTime();
	this.socket   		= socket;
	this.authenticated	= false;
	this.inGame			= false;
	this.email			= null;
	this.nickname		= null;
	this.charactersData	= null;
	this.character		= null;

	this.getID = function() {
		return this.clientID;				
	}

	this.getAuthenticated = function() {
		return this.authenticated;
	}

	this.setAuthenticated = function(authenticated) {
		this.authenticated = authenticated;
	}

	this.setInGame = function(inGame) {
		this.inGame = inGame;
	}

	this.getInGame = function() {
		return this.inGame;
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

	this.getCharacterData = function(id) {
		return this.charactersData[id];
	}

	this.getCharactersData = function() {
		return this.charactersData;
	}

	this.setCharactersData = function(charactersData) {
		this.charactersData = charactersData;
	}
}

module.exports = Client;