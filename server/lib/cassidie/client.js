var Client = function(socket) {
	this.clientID	= new Date().getTime();
	this.socket   	= socket;
}

Client.prototype = {
	clientID:	null,
	socket: 	null,

	getID:		function() {
		return this.clientID;				
	}
};

module.exports = Client;