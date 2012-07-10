function addToChat(from, message, color) {
	if (from != '') from += ': ';

    $('#chatWindow').html($('#chatWindow').html()+'<span style="color:'+color+'">'+from+message+'</span><br/>');
    $("#chatWindow")[0].scrollTop = $("#chatWindow")[0].scrollHeight;
}

Chat.observe(Event.CHAT_RECEIVE, function(data) {
    if (data.action == 'player') color = '#9f11c3';
    if (data.action == 'level') color = '#739bc8';
    if (data.action == 'speak') color = '#00ff00';
    
    var level = (data.level != undefined) ? '['+data.level+'] ' : '';
    addToChat(level+'['+data.player+']', data.message, color);
});

$('#chatInput').keyup(function(e) {
    if(e.keyCode == 13) {
    	Chat.send($('#chatInput').val());
    	$('#chatInput').val('');
    }
});