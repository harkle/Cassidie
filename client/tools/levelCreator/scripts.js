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
	$('#mapper').append('<div id="gameContainer"></div>');
	Game.container = document.getElementById('gameContainer');

	$('#render').click(function() {
		Engine = new DivEngine();

		level	= jQuery.parseJSON($('#levelCode').val());

		var levels = '';
		for (var i = 0; i < level.cells.length; i++) {
			if (level.cells[i].level != undefined) {
				var y = Math.floor(i / level.dimensions.width);
				var x = i - y * level.dimensions.width;

				levels += x+','+y+','+level.cells[i].level+"\n";
				
			}
		}

		$('#levelLink').val(levels);

		Engine.initialize(level);

		var ctrl	= false;
		var alt		= false;
		var shift	= false;
		var oldClickedTile;
		$(document).keydown(function(e) {
			if (e.ctrlKey) ctrl = true;
			if (e.altKey) alt   = true;
			if (e.shiftKey) shift = true;
		}).keyup(function(e) {
			if (ctrl || alt || shift) createCode();

			ctrl  = false;
			alt   = false;
			shift = false;
		});

		$('#gameContainer').mousedown(function(e) {
			position = $('#gameContainer').children('div').offset();
		}).mousemove(function(e) {
			var baseX = e.clientX-Game.container.offsetLeft-parseInt(Engine.container.style.left);
			var baseY = e.clientY-Game.container.offsetTop-parseInt(Engine.container.style.top);

			var clickedTile = Engine.getCoordinates(baseX, baseY);

			if (ctrl || alt || shift) {
				if (oldClickedTile != undefined) {
					if (oldClickedTile.x == clickedTile.x && oldClickedTile.y == clickedTile.y) return;
				}

				oldClickedTile = clickedTile;

				if (shift) changeCell(clickedTile.x, clickedTile.y, e);
				if (ctrl) changeAccessibility(clickedTile.x, clickedTile.y, true);
				if (alt) changeAccessibility(clickedTile.x, clickedTile.y, false);
			}

			$('#cx').text(clickedTile.x);
			$('#cy').text(clickedTile.y);
		}).mouseup(function(e) {
			e.preventDefault();

			newPosition = $('#gameContainer').children('div').offset();
			if (newPosition.left != position.left && newPosition.top != position.top) return;

			var baseX = e.clientX-Game.container.offsetLeft-parseInt(Engine.container.style.left);
			var baseY = e.clientY-Game.container.offsetTop-parseInt(Engine.container.style.top);

			var clickedTile = Engine.getCoordinates(baseX, baseY);

			if (!alt && !ctrl) changeCell(clickedTile.x, clickedTile.y, e);
			if (ctrl) changeAccessibility(clickedTile.x, clickedTile.y, true);
			if (alt) changeAccessibility(clickedTile.x, clickedTile.y, false);

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

		createCode();
	});

	$('#tiles img').click(function() {
		currentTile = $(this).attr('src').replace('.png', '').replace('./ressources/levels/tiles/', '');

		$('#tiles img').removeClass('selected');
		$(this).addClass('selected');
		
	});

	$('#update').click(function() {
		createCode();
	});

	function addLevelLinks() {

		var levels		= $('#levelLink').val().split("\n");
		var defaultIp	= level.initialPositions.default;
		level.initialPositions = {
			default: defaultIp
		};

		for (var i = 0; i < levels.length; i++) {
			if (levels[i] != '') {
				var data = levels[i].split(',');

				var x = parseInt(data[0]);
				var	y = parseInt(data[1]);
				var l = data[2];

				level.cells[y * level.dimensions.width + x].level = l;
				
				eval ('level.initialPositions.'+l+' = ['+x+','+y+'];');
			}
		}
	}

	function changeAccessibility(x, y, state) {
		if(!state) {
		    $('#cell_'+x+'_'+y).css('opacity', 0.3);			
		} else {
		    $('#cell_'+x+'_'+y).css('opacity', 1);						
		}
	}

	function changeCell(x, y, e) {		
		if (currentTile != undefined) {
		    $('#cell_'+x+'_'+y).css('background', 'url(./ressources/levels/tiles/'+currentTile+'.png)');
		}
	}

	function createCode() {
		level			= jQuery.parseJSON($('#levelCode').val());
		level.cells 	= [];

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

		addLevelLinks();
		
		var encoded = $.toJSON( level );
		
		$('#levelCode').val(encoded);
	}
});