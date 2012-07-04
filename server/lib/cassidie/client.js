var Client = Class.create({
	clientID:		null,
	socket:			null,
	authenticated:	false,
	inGame:			false,
	email:			null,
	nickname:		null,
	charactersData:	null,
	character:		null,

	initialize: function(socket) {
		this.clientID	= new Date().getTime();
		this.socket		= socket;
	},

	getID: function() {
		return this.clientID;				
	},

	getAuthenticated: function() {
		return this.authenticated;
	},

	setAuthenticated: function(authenticated) {
		this.authenticated = authenticated;
	},

	setInGame: function(inGame) {
		this.inGame = inGame;
	},

	getInGame: function() {
		return this.inGame;
	},

	getEmail: function() {
		return this.email;
	},

	setEmail: function(email) {
		this.email = email;
	},

	getNickname: function() {
		return this.nickname;
	},

	setNickname: function(nickname) {
		this.nickname = nickname;
	},

	getCharacterData: function(id) {
		for (var i = 0; i < this.charactersData.length; i++) {
			if (this.charactersData[i].id == id) return this.charactersData[i];
		}
	},

	getCharactersData: function() {
		return this.charactersData;
	},

	setCharactersData: function(charactersData) {
		this.charactersData = charactersData;
	}
});

module.exports = Client;