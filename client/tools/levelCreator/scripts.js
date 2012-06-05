var Game 						= {};
Game.level 						= {};
Game.level.checkCoordinates 	= function() {};
Game.level.playerCharacter		= {};
Game.level.playerCharacter.move	= function() {};

var position;
var currentTile;
var currentSprite;
var level;
var Engine;
var mode;

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
		
		//cells
		for (var i = 0; i < level.cells.length; i++) {
			if (level.cells[i].sprite != '') {
				var y = Math.floor(i / level.dimensions.width);
				var x = i - y * level.dimensions.width;

				mode = 'sprite';
				currentSprite = {
					image:	level.cells[i].sprite,
					x:		level.sprites['s_'+level.cells[i].sprite].x,
					y:		level.sprites['s_'+level.cells[i].sprite].y
				}
				changeCell(x, y);				
			}
		}
		
		mode = '';
				
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

	$('#sprites img').click(function() {
		currentSprite = {
			image: $(this).attr('src').replace('.png', '').replace('./ressources/levels/sprites/', ''),
			x: $(this).attr('data-x'),
			y: $(this).attr('data-y')
		};

		$('#sprites img').removeClass('selected');
		$(this).addClass('selected');
		
	});

	$('#update').click(function() {
		createCode();
	});
	
	$('#mode a').first().click(function(e) {
		e.preventDefault();

		$('#sprites').hide();
		$('#tiles').show();
		
		mode = "tile";
	});

	$('#mode a').last().click(function(e) {
		e.preventDefault();

		$('#sprites').show();
		$('#tiles').hide();
		
		mode = "sprite";
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
		if (currentTile != undefined && mode == 'tile') {
		    $('#cell_'+x+'_'+y).css('background', 'url(./ressources/levels/tiles/'+currentTile+'.png)');
		}

		if (currentSprite != undefined && mode == 'sprite') {
			var img = $('<img src="./ressources/levels/sprites/'+currentSprite.image+'.png" />');
			img.css({
				position: 'absolute',
				left: -currentSprite.x,
				top: -currentSprite.y
			})
		    $('#cell_'+x+'_'+y).empty().append(img);
		}
	}

	function createCode() {
		level			= jQuery.parseJSON($('#levelCode').val());
		level.cells 	= [];
		level.sprites	= {};

		//$('#gameContainer').children('div').children().each(function() {
		function processCell(elm) {
			var id = $(elm).attr('id');

			if (id != undefined) {
				var tileId = $(elm).css('background-image').replace('.png)', '').replace('url('+window.location+'ressources/levels/tiles/', '');
		
				var img = $(elm).find('img');
				var sprite = '';
				
				if (img.length > 0) {
					sprite = img.attr('src').replace('.png', '').replace('./ressources/levels/sprites/', '');
					console.log(sprite);
					level.sprites['s_'+sprite] = {
						width: 	img.width(),
						height: img.height(),
						x: 		-parseInt(img.css('left')),
						y:		-parseInt(img.css('top'))
					}
				}

				level.cells.push({
					background: tileId,
					sprite:		sprite,
					accessible: ($(elm).css('opacity') == 1) ? true : false
				});

				id = id.replace('cell_', '').split('_');

				var cell = level.cells[parseInt(id[1]) * level.dimensions.width + parseInt(id[0])];
				if (cell == undefined) cell = level.cells[0];

				if (!cell.accessible) {
					$(elm).css('opacity', '0.3');	
				}
			}
		};
		
		for (var y = 0; y < level.dimensions.height; y++) {
			for (var x = 0; x < level.dimensions.width; x++) {
				var element = $('#cell_'+x+'_'+y);
				processCell(element);				
			}
		}
		
		addLevelLinks();
		
		var encoded = $.toJSON( level );
		
		$('#levelCode').val(encoded);
	}
});