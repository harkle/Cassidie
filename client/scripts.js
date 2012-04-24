if (!window.console) {
	console = {};
	console.log = function(message) {
		alert(message)	
	};
}

Cassidie.observe(Events.CONNECT, function(data) {
	$('#clientid').text(this.clientID);
	$('#gameinfos').text(this.game.title+' ('+this.game.name+'); '+this.game.viewport.width+'x'+this.game.viewport.height+'; max '+this.game.maxCharacters+' characters per player');

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
	//Account.login('net@lionel.me', 'Lopi28fg42');

	//Logout
	Account.observe(Events.LOGOUT, function(data) {
		$('#auth').text('false');
		$('#auth_infos').text('N/A');
		$('#characters').addClass('hidden');
	});

	$('#logout_submit').click(function() {
		Account.logout();
	});

	//Personnages
	Account.observe(Events.CHARACTER_LIST, function(data) {
		$('#chr_counter').text(data.length+'/'+Cassidie.game.maxCharacters);

		if (data.length == Cassidie.game.maxCharacters) {
			$('#new_character').attr('disabled', 'disabled');
		} else {
			$('#new_character').removeAttr('disabled');		
		}

		$('#characterList').empty();
		var i = 0;
		$.each(data, function(item) {
			$('#characterList').append('<li data-id="'+i+'" class="span2" ><div class="thumbnail"><img src="/ressources/images/heads/'+data[item].skin+'.gif" style="width:100px"/><h5>'+data[item].name+'</h5></div></li>')
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
		Account.getCharacters();	
	});

	Account.observe(Events.CHARACTER_STRUCTURE, function(data) {
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
		
			$('#newPlayer').empty();
		    Account.createCharacter(object);
		});
		
	});

	$('#new_character').click(function() {
		Account.getCharacterStructure();
	});
	
	//Démarage du jeu
	Account.observe(Events.GAME_ENTERED, function(data) {
		$('#characters').addClass('hidden');
		
		$('.container').append('<h2 class="page-header" id="game_title">Jeu</h2><div id="game" style="background:black;width:'+Cassidie.game.viewport.width+'px;height:'+Cassidie.game.viewport.height+'px"></div>');
		$('.container').append('<br/><button class="btn" id="leave_game">Quitter</button>');
		
		$('#leave_game').click(function() {
			Cassidie.leaveGame();
		});
	});

	Account.observe(Events.GAME_LEFT, function(data) {
		$('#game_title').remove();
		$('#leave_game').remove();
		$('#game').remove();

		$('#characters').removeClass('hidden');
	});

	$('#start_game').click(function() {
		var characterId = $('#characterList li[data-selected="true"]').attr('data-id');

		$('#delete_character').attr('disabled', 'disabled');
		$('#start_game').attr('disabled', 'disabled');

		Cassidie.enterGame(characterId);
	});
});

Cassidie.observe(Events.DISCONNECT, function(data) {
	console.log('Disconnected...');
});

Cassidie.start('http://cassidie:7000');