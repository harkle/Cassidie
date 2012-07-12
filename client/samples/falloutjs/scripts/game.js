var quests = {
	'kill_rats': {
		name: 'I kill rats!',
		max: 3
	}	
};

Game.observe(Events.GAME_ENTERED, function(data) {
	$('#chat').show();

	$('#health').text(data.character.health);
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

	$('#health').text(data.character.health);
});

Game.observe(Events.CHARACTER_PARAMETER_CHANGED, function(data) {
	if (Game.level.playerCharacter.id == data.id) {

		if(data.parameter.substring(0, 6) == 'quests') {
			var questName = data.parameter.split('"');
			questName = questName[1];

			var action = data.parameter.split('.');
			action = action[1];

			if (action == 'taken' && data.value) addToChat('', 'You started the quest "'+quests[questName].name+'"', '#ffff00');
			if (action == 'done' && data.value) addToChat('', 'You finish the quest "'+quests[questName].name+'"', '#ffff00');

			if (action == 'kills') addToChat('', '['+quests[questName].name+'] '+data.value+'/'+quests[questName].max, '#ffff00');
		}

		if (data.parameter == 'activity') {
			if (data.value == 'attack' && Game.level.playerCharacter.weapon == 'none') {
				addToChat('', 'You have no weapon', '#ffff00');
				return;
			}

			$('.action').each(function() {
				$(this).attr('src', $(this).attr('src').replace('_on', '_off'));
			});

			$('.action[data-action="'+data.value+'"]').attr('src', $('.action[data-action="'+data.value+'"]').attr('src').replace('_off', '_on'));
		} else if (data.parameter == 'weapon') {
			addToChat('', 'You now have a '+data.value, '#ffff00');
		} else if (data.parameter == 'health') {
			$('#health').text(data.value);
		}
		
		if (data.parameter == 'isDead' && data.value) {
			addToChat('', 'You are dead...', '#ffff00');			
		}
	} else {
		console.log('other', data);
	}
});

Game.observe(Events.ACTION_TRIGGERED, function(data) {
	//console.log('Action started', data);
});

Game.observe(Events.CHARACTER_ACTION_SUCCESS, function(data) {
	console.log('ok', data);
});

Game.observe(Events.CHARACTER_ACTION_FAIL, function(data) {
	console.log('fail', data);
});

$('#leave').click(function() {
	Game.leaveGame();
});

$('.action').click(function() {
    Game.level.playerCharacter.setParameter('activity', $(this).attr('data-action'));	
});