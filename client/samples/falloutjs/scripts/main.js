Cassidie.observe(Events.NO_SERVER, function(data) {
    alert('No server found');
});

Cassidie.observe(Events.CONNECT, function(data) {
    $('#title').text(data.game.title);
    $('#menu').show();
    $('#menu .main').show();	
});

Cassidie.observe(Events.DISCONNECT, function(data) {
    $('#menu, #container, #chat').hide();
    $('#title').text('Server is down. Please refresh the page.');
});

