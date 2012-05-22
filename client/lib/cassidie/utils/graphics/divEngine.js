/**
 * The worst graphic engine ever... just absolute div
 */
(function() {
	this.DivEngine = function() {
		this.container			= null
		this.skinsCoordinates	= null;
		this.objectsCoordinates	= null;
		this.levelData			= null;
		this.cursor				= null;
		this.isometry			= {
			x: 32,
			y: 12		
		};
		this.cellSize 			= {
			width:	80,
			height: 36
		};

		this.initialize = function(data) {
			this.levelData = data;

			this.container = document.createElement('div');
			var width	= this.levelData.dimensions.width * this.isometry.x;
			var height	= this.levelData.dimensions.height * this.isometry.y;
			this.container.setAttribute('style', 'position:absolute;height:'+height+'px;width:'+width+'px;left:0px;top:0px;');
			Game.container.appendChild(this.container);		

			var self 	= this;
			var drag	= false;
			var dragged = false;
			var startX;
			var startY;
			Game.container.addEventListener('mousedown', function(e) {
				drag	= true;
				startX	= e.clientX;
				startY	= e.clientY;
			}, false);

			Game.container.addEventListener('mousemove', function(e) {
				var baseX = e.clientX-Game.container.offsetLeft-parseInt(self.container.style.left);
				var baseY = e.clientY-Game.container.offsetTop-parseInt(self.container.style.top);

				var overTile = self.getCoordinates(baseX, baseY);
				var position = self.getTilePosition(overTile.x, overTile.y)

				self.cursor.style.left = position.x+'px';
				self.cursor.style.top = (position.y-self.isometry.y)+'px';

				if (!drag) return;
				dragged = true;

				var x = e.clientX - startX;
				var y = e.clientY - startY;

				var cX = parseInt(self.container.style.left);
				var cY = parseInt(self.container.style.top);

				self.container.style.left	= (cX + x)+'px';
				self.container.style.top	= (cY + y)+'px';
				startX = e.clientX;
				startY = e.clientY;				
			}, false);

			Game.container.addEventListener('mouseup', function(e) {
				if (!dragged) {
					var baseX = e.clientX-Game.container.offsetLeft-parseInt(self.container.style.left);
					var baseY = e.clientY-Game.container.offsetTop-parseInt(self.container.style.top);
					
					var clickedTile = self.getCoordinates(baseX, baseY);
					Game.level.checkCoordinates(clickedTile.x, clickedTile.y);
					Game.level.playerCharacter.move(clickedTile.x, clickedTile.y, true);
				}
			}, false);

			document.addEventListener('mouseup', function(e) {
				dragged = false;
				drag	= false;
			}, false);

			for (var y = 0; y < this.levelData.dimensions.height; y++) {
				for (var x = 0; x < this.levelData.dimensions.width; x++) {
					var tileID   = y * this.levelData.dimensions.width + x;
					var tiletData = (this.levelData.cells[tileID] != undefined) ? this.levelData.cells[tileID] : this.levelData.cells[0];

					var position = this.getTilePosition(x, y);
					var left	= position.x;
					var top		= position.y-this.isometry.y;
					var width	= this.cellSize.width;
					var height	= this.cellSize.height;
					var image	= '/ressources/levels/'+this.levelData.name+'/tiles/'+tiletData.background+'.png';

					var tile = document.createElement('div');
					tile.setAttribute('style', 'position:absolute;height:'+height+'px;width:'+width+'px;left:'+left+'px;top:'+top+'px;background:url('+image+');');	
					tile.setAttribute('id', 'cell_'+x+'_'+y);	

					this.container.appendChild(tile);		
				}
			}

			this.cursor = document.createElement('div');
			this.cursor.setAttribute('style', 'position:absolute;height:36px;width:80px;left:-80px;top:-36px;background:url(/ressources/cursor.png)');
			this.container.appendChild(this.cursor);		

			this.skinsCoordinates = [
				[],
				[4, 46, 24, 60],
				[11, 65, 48, 74],
				[10, 63, 46, 76],
				[10, 52, 36, 65],
				[11, 49, 29, 59],
				[6, 54, 61, 60],
				[0, 60, 80, 80],
				[7, 30, 67, 57],
				[6, 51, 21, 60],
				[11, 51, 27, 60],
				[9, 54, 35, 65],
				[6, 54, 35, 66],
				[11, 51, 25, 61],
				[11, 38, 26, 43],
			];

			this.objectsCoordinates = {
				camera: [20, 65, 38, 73]
			}		
		};

		this.destroy = function() {
			Game.container.removeChild(this.container);
		};

		this.getCoordinates = function(mouseX, mouseY) {
			var xx = mouseX - mouseY * 4 / 3;
			var x = Math.floor(xx / 64);

			var yy = mouseY + mouseX / 4;
			var y = Math.floor(yy / 32);

			return {
				x: x,
				y: y
			}
		};

		this.getTilePosition = function(x, y) {
			var dx = this.cellSize.width - this.isometry.x;
			var dy = this.cellSize.height - this.isometry.y;

			return {
				x: x * dx + y * this.isometry.x,
				y: y * dy - x * this.isometry.y
			}
		};

		this.addCharacter = function(characterData) {
			var position 			= this.getTilePosition(characterData.x, characterData.y);
			var skinsCoordinates	= this.skinsCoordinates[characterData.attributes.skin];
			var character			= document.createElement('div');
			character.setAttribute('style', 'position:absolute;width:'+skinsCoordinates[2]+'px;height:'+skinsCoordinates[3]+'px;left:'+(position.x+skinsCoordinates[0])+'px;top:'+(position.y-skinsCoordinates[1])+'px;');
			character.setAttribute('id', 'character_'+characterData.id);
			this.container.appendChild(character);

			var color = '#ffffff';
			if (characterData.type == 'player') color = '#0000ff';
			if (characterData.type == 'npc_ennemy') color = '#ff0000';

			var characterTitle		= document.createElement('div');
			characterTitle.setAttribute('style', 'color:'+color+';text-align:center;position:absolute;width:'+(skinsCoordinates[2]*2)+'px;height:15px;left:'+(-skinsCoordinates[2]/2)+'px;top:-15px;');
			characterTitle.innerHTML = characterData.attributes.name;
			character.appendChild(characterTitle);

			var speachTile		= document.createElement('div');
			speachTile.setAttribute('style', 'color:#ffffff;text-align:center;position:absolute;width:'+(skinsCoordinates[2]*2)+'px;left:'+(-skinsCoordinates[2]/2)+'px;top:-30px;');
			speachTile.setAttribute('id', 'speach_'+characterData.id);
			character.appendChild(speachTile);

			this.setCharacterSkin(characterData.id, characterData.attributes.skin, characterData.appearance, characterData.direction);
			
			if (characterData.isVisible) this.showCharacter(characterData.id);
			if (!characterData.isVisible) this.hideCharacter(characterData.id);
		};

		this.addObject = function(objectData) {
			var position 			= this.getTilePosition(objectData.x, objectData.y);
			var objectsCoordinates	= this.objectsCoordinates[objectData.skin];
			var object				= document.createElement('div');
			object.setAttribute('style', 'position:absolute;width:'+objectsCoordinates[2]+'px;height:'+objectsCoordinates[3]+'px;left:'+(position.x+objectsCoordinates[0])+'px;top:'+(position.y-objectsCoordinates[1])+'px;');
			object.setAttribute('id', 'object_'+objectData.id);
			this.container.appendChild(object);

			this.setObjectSkin(objectData.id, objectData.skin, objectData.appearance);

			if (objectData.isVisible) this.showObject(objectData.id);
			if (!objectData.isVisible) this.hideObject(objectData.id);
		};

		this.characterSpeech = function(id, text) {
			var speach = document.getElementById('speach_'+id);

			speach.innerHTML = text;
			speach.style.top = (-20 - speach.offsetHeight)+'px';

			var oldTimeout = speach.getAttribute('data-timeout');
			clearTimeout(oldTimeout);

			var timeout = setTimeout(function() {
				speach.innerHTML = '';
			}, 2000 + text.length * 100);

			speach.setAttribute('data-timeout', timeout)
		};

		this.removeCharacter = function(id) {
			var character = document.getElementById('character_'+id);

			this.container.removeChild(character)			
		};

		this.removeObject = function(id) {
			var object = document.getElementById('object_'+id);

			this.container.removeChild(object)			
		};

		this.showCharacter = function(id) {
			var character = document.getElementById('character_'+id);
	
			character.style.display = '';
		};

		this.showObject = function(id) {
			var object = document.getElementById('object_'+id);

			object.style.display = '';
		};

		this.hideCharacter = function(id) {
			var character = document.getElementById('character_'+id);

			character.style.display = 'none';
		};

		this.hideObject = function(id) {
			var object = document.getElementById('object_'+id);

			object.style.display = 'none';
		};

		this.setCharacterSkin = function(id, skin, action, direction) {
			var character = document.getElementById('character_'+id);

			var date = new Date();
			var time = date.getTime();

			character.style.background = 'url(/ressources/characters/'+skin+'/'+action+'/'+direction+'.gif?t='+time+')';			
		};

		this.setObjectSkin = function(id, skin, action) {
			var object = document.getElementById('object_'+id);

			var date = new Date();
			var time = date.getTime();

			object.style.background = 'url(/ressources/objects/'+skin+'/'+action+'.gif?t='+time+')';			
		};

		this.setCharacterPosition = function(id, skin, cellX, cellY, dx, dy) {
			var character = document.getElementById('character_'+id);

			var position			= this.getTilePosition(cellX, cellY);
			var skinsCoordinates	= this.skinsCoordinates[skin];

			character.style.left	= (position.x+skinsCoordinates[0]+dx)+'px';			
			character.style.top	= (position.y-skinsCoordinates[1]+dy)+'px';
		};
		
		this.setObjectPosition = function(id, skin, x, y) {
			var object = document.getElementById('object_'+id);

			var position			= this.getTilePosition(x, y);
			var objectsCoordinates	= this.objectsCoordinates[skin];

			object.style.left	= (position.x+objectsCoordinates[0])+'px';			
			object.style.top	= (position.y-objectsCoordinates[1])+'px';			
		};
		
		this.setCenter = function(x, y) {
			var position = this.getTilePosition(x, y);
			
			this.container.style.left	= (Game.gameData.viewport.width / 2 - position.x - this.cellSize.width / 2) +'px';
			this.container.style.top	= (Game.gameData.viewport.height / 2 - position.y - this.cellSize.height / 2) +'px';
			console.log();
		};
	};
})();