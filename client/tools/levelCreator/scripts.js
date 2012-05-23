var Game 						= {};
Game.level 						= {};
Game.level.checkCoordinates 	= function() {};
Game.level.playerCharacter		= {};
Game.level.playerCharacter.move	= function() {};

var position;
var currentTile;
var level;
var Engine;

$(function() {

	$('#container').append('<div id="gameContainer"></div>');
	Game.container = document.getElementById('gameContainer');

	$('#render').click(function() {
		Engine = new DivEngine();

		level	= jQuery.parseJSON($('#levelCode').val());

		Engine.initialize(level);

		$('#gameContainer').mousedown(function(e) {
			position = $('#gameContainer').children('div').offset();
		}).mouseup(function(e) {
			newPosition = $('#gameContainer').children('div').offset();
			if (newPosition.left != position.left && newPosition.top != position.top) return;

			var baseX = e.clientX-Game.container.offsetLeft-parseInt(Engine.container.style.left);
			var baseY = e.clientY-Game.container.offsetTop-parseInt(Engine.container.style.top);

			var clickedTile = Engine.getCoordinates(baseX, baseY);

			if (currentTile != undefined) {
				$('#cell_'+clickedTile.x+'_'+clickedTile.y).css('background', 'url(./ressources/levels/tiles/'+currentTile+'.png)');
			}

			createCode();
		}).dblclick(function(e) {
			var baseX = e.clientX-Game.container.offsetLeft-parseInt(Engine.container.style.left);
			var baseY = e.clientY-Game.container.offsetTop-parseInt(Engine.container.style.top);

			var clickedTile = Engine.getCoordinates(baseX, baseY);

			var op = $('#cell_'+clickedTile.x+'_'+clickedTile.y).css('opacity');

			if(op == 1) {
				$('#cell_'+clickedTile.x+'_'+clickedTile.y).css('opacity', 0.3);			
			} else {
				$('#cell_'+clickedTile.x+'_'+clickedTile.y).css('opacity', 1);						
			}

			createCode();
		});

		$('#gameContainer').children('div').children().each(function() {
			var id = $(this).attr('id');

			if (id != undefined) {
				id = id.replace('cell_', '').split('_');

				var cell = level.cells[parseInt(id[1]) * level.dimensions.width + parseInt(id[0])];
				if (cell == undefined) cell = level.cells[0];

				if (!cell.accessible) {
					$(this).css('opacity', '0.3');	
				}
			}
		});
	});

	$('#tiles img').click(function() {
		currentTile = $(this).attr('src').replace('.png', '').replace('./ressources/levels/tiles/', '');

		$('#tiles img').removeClass('selected');
		$(this).addClass('selected');
		
	});
	
	function createCode() {
		level.cells = [];

		$('#gameContainer').children('div').children().each(function() {
			var id = $(this).attr('id');

			if (id != undefined) {
				var tileId = $(this).css('background-image').replace('.png)', '').replace('url('+window.location+'ressources/levels/tiles/', '');
		
				level.cells.push({
					background: tileId,
					sprite:		'',
					accessible: ($(this).css('opacity') == 1) ? true : false
				});

				id = id.replace('cell_', '').split('_');

				var cell = level.cells[parseInt(id[1]) * level.dimensions.width + parseInt(id[0])];
				if (cell == undefined) cell = level.cells[0];

				if (!cell.accessible) {
					$(this).css('opacity', '0.3');	
				}
			}
		});

		var encoded = $.toJSON( level );
		
		$('#levelCode').val(encoded);
	}
});