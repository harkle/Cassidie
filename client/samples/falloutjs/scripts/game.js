Game.observe(Events.GAME_ENTERED, function() {
	$('#chat').show();
});

Game.observe(Events.GAME_LEFT, function() {
	$('#chat, #container').hide();	
	$('#menu').show();
	
});

Game.observe(Events.LEVEL_LEAVE, function(data) {
	$('#loading').show();
	$('#container, #chat').hide();
});

Game.observe(Events.LEVEL_ENTER, function(data) {
	$('#loading').hide();
	$('#container, #chat').show();
});

Game.observe(Events.CHARACTER_PARAMETER_CHANGED, function(data) {
	if (Game.level.playerCharacter.id == data.id) {
		if (data.parameter = 'activity') {
			$('.action').each(function() {
				$(this).attr('src', $(this).attr('src').replace('_on', '_off'));
			});

			$('.action[data-action="'+data.value+'"]').attr('src', $('.action[data-action="'+data.value+'"]').attr('src').replace('_off', '_on'));
		}
	}
});

$('#leave').click(function() {
	Game.leaveGame();
});

$('.action').click(function() {
    Game.level.playerCharacter.setParameter('activity', $(this).attr('data-action'));	
});