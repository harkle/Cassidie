/**
 * The worst graphic engine ever... just absolute div
 */
(function() {
	this.DivEngine = function() {
		this.scene 				= null;
		this.skinsCoordinates	= null;
		this.entities			= null;
		this.animations			= null;
		this.animationInterval	= null;

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

			var newContainer = Game.container.cloneNode(true);
			Game.container.parentNode.replaceChild(newContainer, Game.container);
			Game.container = newContainer;

			var width	= Game.gameData.viewport.width;
			var height	= Game.gameData.viewport.height;

			this.skinsCoordinates	= {};
			this.entities			= {};
			this.animations			= {};

			this.scene = document.createElement('div');
			this.scene.setAttribute('style', 'position:absolute;height:'+height+'px;width:'+width+'px;left:0px;top:0px;');			
			Game.container.appendChild(this.scene);		

			//Tiles
			for (var y = 0; y < this.levelData.dimensions.height; y++) {
				for (var x = this.levelData.dimensions.width-1; x >= 0; x--) {
					var tileID   = y * this.levelData.dimensions.width + x;
					var tiletData = (this.levelData.cells[tileID] != undefined) ? this.levelData.cells[tileID] : this.levelData.cells[0];

					var position = this.getTilePosition(x, y);
					var left	= position.x;
					var top		= position.y-this.isometry.y;
					var width	= this.cellSize.width;
					var height	= this.cellSize.height;
					var image	= './ressources/levels/tiles/'+tiletData.background+'.png';

					var tile = document.createElement('div');
					tile.setAttribute('style', 'position:absolute;height:'+height+'px;z-index:0;width:'+width+'px;left:'+left+'px;top:'+top+'px;background:url('+image+');');	
					tile.setAttribute('id', 'cell_'+x+'_'+y);	

					this.scene.appendChild(tile);		

					if (tiletData.sprite != '') {
						var id			= tiletData.sprite;
						var spriteData	= this.levelData.sprites['s_'+id];

						var image  = './ressources/levels/sprites/'+tiletData.sprite+'.png';
						var sprite = document.createElement('div');
						sprite.setAttribute('style', 'position:absolute;height:'+spriteData.height+'px;z-index:0;z-index:'+(this.levelData.dimensions.width - x + y)+';width:'+spriteData.width+'px;left:'+(left -spriteData.x)+'px;top:'+(top - spriteData.y)+'px;background:url('+image+');');	
						sprite.setAttribute('id', 'sprite_'+x+'_'+y);	

						this.scene.appendChild(sprite);		
					}
				}
			}
			
			this.cursor = document.createElement('div');
			this.cursor.setAttribute('style', 'z-index:20000;position:absolute;height:36px;width:80px;left:-80px;top:-36px;background:url(./ressources/cursor.png)');
			this.scene.appendChild(this.cursor);		

			//Events
			var self 	= this;
			var drag	= false;
			var dragged = false;
			var startX;
			var startY;
			CrossBrowser.addEventListener(Game.container, 'mousedown', function(e) {
				var mousePosition = CrossBrowser.getMousePosition(e);

				startX	= mousePosition.left;
				startY	= mousePosition.top;
				drag	= true;
			});

			CrossBrowser.addEventListener(Game.container, 'mousemove', function(e) {
				var mousePosition = CrossBrowser.getMousePosition(e);

				var baseX = mousePosition.left - Game.container.offsetLeft - parseInt(self.scene.style.left);
				var baseY = mousePosition.top - Game.container.offsetTop - parseInt(self.scene.style.top);

				var overTile = self.getCoordinates(baseX, baseY);
				var position = self.getTilePosition(overTile.x, overTile.y)

				self.cursor.style.left = position.x+'px';
				self.cursor.style.top = (position.y-self.isometry.y)+'px';

				if (!drag) return;
				dragged = true;

				var x = mousePosition.left - startX;
				var y = mousePosition.top - startY;

				var cX = parseInt(self.scene.style.left);
				var cY = parseInt(self.scene.style.top);

				self.scene.style.left	= (cX + x)+'px';
				self.scene.style.top	= (cY + y)+'px';
				startX = mousePosition.left;
				startY = mousePosition.top;
			}, false);

			CrossBrowser.addEventListener(Game.container, 'mouseup', function(e) {
				if (!dragged) {
					var mousePosition = CrossBrowser.getMousePosition(e);

					var baseX = mousePosition.left - Game.container.offsetLeft - parseInt(self.scene.style.left);
					var baseY = mousePosition.top - Game.container.offsetTop - parseInt(self.scene.style.top);
					
					var clickedTile = self.getCoordinates(baseX, baseY);
					Game.level.checkCoordinates(clickedTile.x, clickedTile.y);
					Game.level.playerCharacter.move(clickedTile.x, clickedTile.y, true);
				}
			}, false);

			CrossBrowser.addEventListener(document, 'mouseup', function(e) {
				dragged = false;
				drag	= false;
			});

			this.animationInterval = setInterval(function() {
				self.doAnimation();	
			}, 100);
		};
		
		this.destroy = function() {
			clearInterval(this.animationInterval);
			Game.container.removeChild(this.scene);
		};

		this.doAnimation = function() {
			for (anim in this.animations) {
				if (this.animations[anim].running) {
					this.setEntityBackgroundImage(anim, this.animations[anim].file, this.animations[anim].id % this.animations[anim].numFrame);

					this.animations[anim].id += 1;

					if (this.animations[anim].id % this.animations[anim].numFrame == 0 && !this.animations[anim].looping) {
						this.animations[anim].running = false;
					}
				}
			}
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

		this.setEntityBackgroundImage = function(id, file, animationID) {
			if (animationID == undefined) animationID = '';

			var object = this.entities[id];
			object.style.background = 'url('+file+animationID+'.png)';			
		};

		this.createText = function(text, color, x, y) {
		};
		
		this.addCharacter = function(characterData) {
			this.addEntity(characterData);

			var color = '#ffffff';
			if (!characterData.isEnnemy) color = '#0000ff';
			if (characterData.isEnnemy) color = '#ff0000';

			var characterTitle		= document.createElement('div');
			characterTitle.setAttribute('style', 'color:'+color+';text-align:center;position:absolute;width:'+(this.skinsCoordinates[characterData.id][2]*2)+'px;height:15px;left:'+(-this.skinsCoordinates[characterData.id][2]/2)+'px;top:-15px;');
			characterTitle.innerHTML = characterData.attributes.name;
			this.entities[characterData.id].appendChild(characterTitle);

			var speachTile		= document.createElement('div');
			speachTile.setAttribute('style', 'color:#ffffff;text-align:center;position:absolute;width:'+(this.skinsCoordinates[characterData.id][2]*2)+'px;left:'+(-this.skinsCoordinates[characterData.id][2]/2)+'px;top:-30px;');
			speachTile.setAttribute('id', 'speach_'+characterData.id);

			this.entities[characterData.id].appendChild(speachTile);
		};

		this.addEntity = function(objectData) {
			this.skinsCoordinates[objectData.id]	= objectData.skinCoordinates;
			
			var position 			= this.getTilePosition(objectData.x, objectData.y);
			var object				= document.createElement('div');
			object.setAttribute('style', 'position:absolute;z-index:'+(this.levelData.dimensions.width - objectData.x + objectData.y)+';width:'+this.skinsCoordinates[objectData.id][2]+'px;height:'+this.skinsCoordinates[objectData.id][3]+'px;');
			object.setAttribute('id', 'entity_'+objectData.id);
			this.scene.appendChild(object);

			this.entities[objectData.id]	= object;
			this.animations[objectData.id]	= {
				id: 		0,
				running:	false,
				file: 		'',
				numFrame:	0,
				looping:	false
			};

			this.setEntityPosition(objectData.id, objectData.x, objectData.y);

			var isAnimated = (objectData.animationList[objectData.appearance] != undefined) ? true : false;

			objectData.setSkin(objectData.appearance, isAnimated);
			
			if (objectData.isVisible) this.showEntity(objectData.id);
			if (!objectData.isVisible) this.hideEntity(objectData.id);
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

		this.removeEntity = function(id) {
			var object = this.entities[id];

			this.container.removeChild(object)			
		};

		this.showEntity = function(id) {
			var object = this.entities[id];

			object.style.display = '';			
		};

		this.hideEntity = function(id) {
			var object = this.entities[id];

			object.style.display = 'none';			
		};

		this.setEntitySkin = function(id, file, isAnimated, animationParameters) {
			if (isAnimated) {
				this.animations[id].id			= 0;
				this.animations[id].running		= true;
				this.animations[id].file		= file;
				this.animations[id].numFrame	= animationParameters.numFrame;
				this.animations[id].looping		= animationParameters.looping;

				this.setEntityBackgroundImage(id, file+'0');
			} else {
				this.animations[id].running		= false;

				this.setEntityBackgroundImage(id, file);
			}			
		};

		this.setEntityPosition = function(id, x, y, dx, dy) {
			if (dx == undefined) dx = 0;
			if (dy == undefined) dy = 0;

			var object				= this.entities[id];
			var position			= this.getTilePosition(x, y);

			object.style.left	= (position.x+this.skinsCoordinates[id][0]+dx)+'px';			
			object.style.top	= (position.y-this.skinsCoordinates[id][1]+dy)+'px';
			object.style.zIndex = this.levelData.dimensions.width - x + y
		};

		this.setCenter = function(x, y) {
			var position = this.getTilePosition(x, y);
			
			this.scene.style.left	= (Game.gameData.viewport.width / 2 - position.x - this.cellSize.width / 2) +'px';
			this.scene.style.top	= (Game.gameData.viewport.height / 2 - position.y - this.cellSize.height / 2) +'px';
		};
	}
})();