// imports
module.exports = Class.create({
	name: 			'',
	title:			'',
	viewport:		null,
	maxCharacters:	0,
	consoleName:	'game		',
	playerClass:	null,

	initialize: function(data, playerClass) {

		this.name			= data.name;
		this.title			= data.title;
		this.viewport		= data.viewport;
		this.maxCharacters	= data.maxCharacters;
		this.playerClass	= playerClass;

		Logger.systemLog(this.consoleName, 'constructor called');
	}	
});