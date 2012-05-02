if (!window.console) {
	console = {};
	console.log = function(message) {
		alert(message)	
	};
}


Cassidie.observe(Events.NO_SERVER, function(data) {
    alert('Impossible de trouver le serveur: '+data.server);
});

Cassidie.observe(Events.CONNECT, function(data) {
    $('#clientid').text(this.clientID);
    $('#gameinfos').text(Game.gameData.title+' ('+Game.gameData.name+'); '+Game.gameData.viewport.width+'x'+Game.gameData.viewport.height+'; max '+Game.gameData.maxCharacters+' characters per player');

    if(location.hash == '#1') Account.login('net@lionel.me', 'Lopi28fg42');
    if(location.hash == '#2') Account.login('lionel.tardy@me.com', 'Lopi28fg42');
});

//Register
Account.observe(Events.REGISTER_SUCCESS, function(data) {
    $('#register_message').removeClass('alert-error hidden').addClass('alert-success').text('Votre compte a été créé avec succès');
    $('#register_email').val('');
    $('#register_password').val('');
    $('#register_nickname').val('');
});

Account.observe(Events.REGISTER_FAIL, function(data) {
    $('#register_message').removeClass('alert-success hidden').addClass('alert-error').text('Ce compte existe déjà');
});

$('#register_submit').click(function() {
    if ($('#register_email').val() == '' || $('#register_password').val() == '' || $('#register_nickname').val() == '') {
    	$('#register_message').removeClass('alert-success hidden').addClass('alert-error').text('Veuillez remplir tous les champs');
    	return;
    }
    Account.register($('#register_email').val(), $('#register_password').val(), $('#register_nickname').val());
});

//Login
Account.observe(Events.LOGIN_SUCCESS, function(data) {
    $('#login_message').removeClass('alert-error hidden').addClass('alert-success').text('Connexion réussie');
    $('#login_email').val('');
    $('#login_password').val('');

    $('#auth').text('true');
    $('#auth_infos').text(data.email);
    $('#actions').addClass('hidden');
    $('#characters').removeClass('hidden');

    Account.getCharacters();
});
Account.observe(Events.LOGIN_FAIL, function(data) {
    $('#login_message').removeClass('alert-success hidden').addClass('alert-error').text('E-mail ou mot de passe erroné');
});
$('#login_submit').click(function() {
    Account.login($('#login_email').val(), $('#login_password').val());
});

//Logout
Account.observe(Events.LOGOUT, function(data) {
    $('#auth').text('false');
    $('#auth_infos').text('N/A');
    $('#characters').addClass('hidden');
    $('#login_message').addClass('hidden');
});

$('#logout_submit').click(function() {
    Account.logout();
});

//Personnages
Account.observe(Events.CHARACTER_LIST, function(data) {
    $('#chr_counter').text(data.length+'/'+Game.gameData.maxCharacters);

    if (data.length == Game.gameData.maxCharacters) {
    	$('#new_character').attr('disabled', 'disabled');
    } else {
    	$('#new_character').removeAttr('disabled');		
    }

    $('#characterList').empty();
    var i = 0;

    $.each(data, function(item) {
    	$('#characterList').append('<li data-id="'+i+'" class="span2" ><div class="thumbnail"><img src="/ressources/images/heads/'+data[item].attributes.skin+'.gif" style="width:100px"/><h5>'+data[item].attributes.name+'</h5></div></li>')
    	i++;
    });

    $('#characterList li').click(function() {
    	$('#characterList li').removeClass('alert-info').attr('data-selected', false);
    	$(this).addClass('alert-info').attr('data-selected', true);
    	
    	$('#delete_character').removeAttr('disabled');
    	$('#start_game').removeAttr('disabled');
    });
});

Account.observe(Events.CHARACTER_REMOVED, function(data) {
    Account.getCharacters();		
    $('#delete_character').attr('disabled', 'disabled');
    $('#start_game').attr('disabled', 'disabled');
});

$('#delete_character').click(function() {
    var id = $('#characterList li[data-selected="true"]').attr('data-id');

    Account.removeCharacter(id);	
});

Account.observe(Events.CHARACTER_CREATED, function(data) {
    $('#character_message').text('Personnage créé avec succès.').removeClass('alert-error').addClass('alert-success');

    Account.getCharacters();
    $('#newPlayer').empty();
});

Account.observe(Events.CHARACTER_NOT_CREATED, function(data) {
    $('#character_message').removeClass('hidden').removeClass('alert-success').addClass('alert-error');

    if(data.message == 'too_many_characters') $('#character_message').text('Vous possédez le maximun de personnages.');
    if(data.message == 'name_already_used') $('#character_message').text('Ce nom est déjà utilisé.');
    
});

Account.observe(Events.CHARACTER_STRUCTURE, function(data) {
    $('#character_message').addClass('hidden').removeClass('alert-error alert-success');
    $('#newPlayer').empty();
    $.each(data, function(elm) {
    	if (elm == 'name') {
    		$('#newPlayer').append('<label for="newPlayer_'+elm+'">Nom</label><input id="newPlayer_'+elm+'" value="" />');
    	}

    	if (elm == 'skin') {
    		$('#newPlayer').append('<label for="newPlayer_'+elm+'">Apparence</label><input class="hidden"id="newPlayer_'+elm+'" value="1" /><div class="thumbnails">');
    		for (var i = 1; i <= 14; i++) {
    			$('#newPlayer .thumbnails').append('<div class="thumbnail span2 head '+((i > 1) ? 'hidden' : '')+'" data-id="'+i+'"><img  src="/ressources/images/heads/'+i+'.gif" /></div>');					
    		}
    	}
    });

    $('#newPlayer').append('<br/><br/><button class="btn" id="createPlayer">Créer</boutton>');

    $('.head').click(function() {
        var id = (parseInt($(this).attr('data-id'))+1) % 15;
        if(id == 0) id = 1;
        $('.head').addClass('hidden');

        $('#newPlayer_skin').val(id);
        $('.head[data-id='+id+']').removeClass('hidden');
    });

    $('#createPlayer').click(function() {
    	if ($('#newPlayer_name').val() == '') return;

    	var object = {};

    	$.each(data, function(elm) {
    		eval('object.'+elm+' = $("#newPlayer_'+elm+'").val();');
    	});

        Account.createCharacter(object);
    });
});

$('#new_character').click(function() {
    Account.getCharacterStructure();
});

//Démarage du jeu
Game.observe(Events.GAME_ENTERED, function(data) {
    $('#characters').addClass('hidden');
    $('#chat').removeClass('hidden');

    $('.container').append('<br/><button class="btn" id="leave_game">Quitter</button><button class="btn" id="chr_nothing">Rien faire</button><button class="btn" id="chr_attak">Attaquer</button>');
    $('#leave_game').click(function() {
    	Game.leaveGame();
    });

    $('#chr_nothing').click(function() {
    	Game.level.playerCharacter.setParamater('activity', 0, true);
    });

    $('#chr_attak').click(function() {
    	Game.level.playerCharacter.setParamater('activity', 1, true);
    });
});

Game.observe(Events.GAME_LEFT, function(data) {
    $('#game_title').remove();
    $('#leave_game').remove();
    $('#chr_attak').remove();
    $('#chr_nothing').remove();
    $('#chat').addClass('hidden');
    $('#game').remove();

    $('#characters').removeClass('hidden');
});

$('#start_game').click(function() {
    var characterId = $('#characterList li[data-selected="true"]').attr('data-id');

    $('#delete_character').attr('disabled', 'disabled');
    $('#start_game').attr('disabled', 'disabled');
    Game.enterGame(characterId);
});

Cassidie.observe(Events.DISCONNECT, function(data) {
    $('#actions').removeClass('hidden');
    $('#characters').addClass('hidden');
    $('#login_message').addClass('hidden');
    $('#leave_game').remove();
    $('#chat').addClass('hidden');
});

Game.observe(Events.CHARACTER_PARAMETER_CHANGED, function(data) {
	console.log(data);
});

//Chat
function addToChat(from, message, color) {
    $('#chatWindow').html($('#chatWindow').html()+'<span style="color:'+color+'">'+from+': '+message+'</span><br/>');
    $("#chatWindow")[0].scrollTop = $("#chatWindow")[0].scrollHeight;

}
Chat.observe(Event.CHAT_RECEIVE, function(data) {
    if (data.action == 'player') color = '#9f11c3';
    if (data.action == 'level') color = '#739bc8';
    if (data.action == 'speak') color = '#000';
    
    var level = (data.level != undefined) ? '['+data.level+'] ' : '';
    addToChat(level+'['+data.player+']', data.message, color);
});
$('#chatInput').keyup(function(e) {
    if(e.keyCode == 13) {
    	Chat.send($('#chatInput').val());
    	$('#chatInput').val('');
    }
});