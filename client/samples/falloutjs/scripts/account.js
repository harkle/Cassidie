Account.observe(Events.LOGIN_SUCCESS, function(data) {
	$('.login .p0').val('');
	$('.login .p1').val('');

	$('#menu .login').hide();

    Account.getCharacters();
});

Account.observe(Events.LOGIN_FAIL, function(data) {
	alert('Given e-mail / password is not valid');
});

Account.observe(Events.LOGOUT, function(data) {
	$('#menu .account').hide();
	$('#menu .login').show();
});

Account.observe(Events.REGISTER_SUCCESS, function(data) {
	alert('Account created. You can now login');

	$('.register .p0').val('');
	$('.register .p1').val('');
	$('.register .p2').val('');

	$('#menu .register').hide();	
	$('#menu .login').show();	
});

Account.observe(Events.REGISTER_FAIL, function(data) {
	alert('Unable to create accound');
});

Account.observe(Events.CHARACTER_LIST, function(data) {
	$('.account .p0, .account .p1').remove();

	for (var i = 0; i < data.length; i++) {
		var div = $('<div class="button p'+i+'"></div>').text(data[i].attributes.name);
		div.attr('data-id', data[i].id);

		var remove = $('<div class="remove">x</div>');
		remove.click(function(e) {
			e.stopPropagation();
			var conf = confirm('Do you realy want to delete this character?');

			if(conf) {
				Account.removeCharacter($(this).parent().attr('data-id'));
			}
		});
		div.append(remove);
		div.click(function() {
			$('#menu').hide();
			$('#loading').show();

			Game.enterGame($(this).attr('data-id'));
		});

		$('.account').append(div);
	}
	$('#menu .account').show();
});

Account.observe(Events.CHARACTER_REMOVED, function(data) {
    Account.getCharacters();
});

Account.observe(Events.CHARACTER_STRUCTURE, function(data) {
	$('.account').hide();
	$('.newCharacter').show();
	$('.newCharacter p0').val('');
});

Account.observe(Events.CHARACTER_CREATED, function(data) {
	$('.newCharacter').hide();

    Account.getCharacters();
});

Account.observe(Events.CHARACTER_NOT_CREATED, function(data) {
    if(data.message == 'too_many_characters') alert('You have too many characters.');
    if(data.message == 'name_already_used') alert('This name is already used.');
});

$(function() {
	$('.main .p0').click(function() {
	    $('#menu .main').hide();	
	    $('#menu .login').show();	
	});

	$('.main .p1').click(function() {
	    $('#menu .main').hide();	
	    $('#menu .register').show();	
	});

	$('.login .p2').click(function() {
		Account.login($('.login .p0').val(), $('.login .p1').val());
	});

	$('.register .p3').click(function() {
		Account.register($('.register .p0').val(), $('.register .p1').val(), $('.register .p2').val());
	});

	$('.account .p3').click(function() {
		Account.getCharacterStructure();
	});

	$('.account .p4').click(function() {
		Account.logout();
	});

	$('.newCharacter .p1').click(function() {
		Account.createCharacter({
			skin: 0,
			name: $('#character_name').val()
		});
	});

	$('.back').click(function() {
		$(this).parent().hide();
		$('.main').show();
	});

	$('.backAccount').click(function() {
		$(this).parent().hide();
		$('.account').show();		
	});
});