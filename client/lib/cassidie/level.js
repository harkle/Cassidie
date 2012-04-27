(function() {
	this.Level = function(data) {
		this.levelData			= data;
		this.characters 		= [];
		this.pathfinder 		= null;
		this.skinsCoordinates	= null;

		this.buildLevel = function() {
			var self = this;

			var elements = Cassidie.container.childNodes;
			for (var i = 0; i < elements.length; i++) {
				Cassidie.container.removeChild(elements[i]);
			}

			var container = document.createElement('div');
			var width	= this.levelData.level.dimensions.width * this.levelData.level.isometry.x;
			var height	= this.levelData.level.dimensions.height * this.levelData.level.isometry.y;
			container.setAttribute('style', 'position:absolute;height:'+height+'px;width:'+width+'px;left:'+this.levelData.level.viewport.x+'px;top:'+this.levelData.level.viewport.y+'px;');
			Cassidie.container.appendChild(container);		

			var drag	= false;
			var dragged = false;
			var startX;
			var startY;
			container.addEventListener('mousedown', function(e) {
				drag	= true;
				startX	= e.clientX;
				startY	= e.clientY;
			}, false);

			container.addEventListener('mousemove', function(e) {
				if (!drag) return;
				dragged = true;

				var x = e.clientX - startX;
				var y = e.clientY - startY;
				
				var cX = parseInt(container.style.left);
				var cY = parseInt(container.style.top);

				container.style.left	= (cX + x)+'px';
				container.style.top		= (cY + y)+'px';
				startX = e.clientX;
				startY = e.clientY;
			}, false);

			container.addEventListener('mouseup', function(e) {
				if (!dragged) {
					var baseX = e.clientX-container.parentNode.offsetLeft-parseInt(container.style.left);
					var baseY = e.clientY-container.parentNode.offsetTop-parseInt(container.style.top);

					var clickedTile = self.getCoordinates(baseX, baseY);
					self.moveCharacter(self.levelData.character.id, clickedTile.x, clickedTile.y, true);
				}

				dragged = false;
				drag	= false;
			}, false);

			for (var y = 0; y < this.levelData.level.dimensions.height; y++) {
				for (var x = 0; x < this.levelData.level.dimensions.width; x++) {
					var tileID   = y * this.levelData.level.dimensions.width + x;
					var tiletData = (this.levelData.level.cells[tileID] != undefined) ? this.levelData.level.cells[tileID] : this.levelData.level.cells[0];

					var position = this.getTilePosition(x, y);
					var left	= position.x;
					var top		= position.y-this.levelData.level.isometry.y;
					var width	= this.levelData.level.cellSize.width;
					var height	= this.levelData.level.cellSize.height;
					var image	= '/ressources/levels/'+this.levelData.level.name+'/tiles/'+tiletData.background+'.png';

					var tile = document.createElement('div');
					tile.setAttribute('style', 'position:absolute;height:'+height+'px;width:'+width+'px;left:'+left+'px;top:'+top+'px;background:url('+image+');');	
					tile.setAttribute('id', 'cell_'+x+'_'+y);	

					container.appendChild(tile);		
				}
			}

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

			//Personnage du joueur
			this.createCharacter(this.levelData.character, container);

			//Personnages autres
			for (var i = 0; i < this.levelData.level.characters.length; i++) {
				if (this.levelData.character.id != this.levelData.level.characters[i].id) this.createCharacter(this.levelData.level.characters[i], container);
			}

			Cassidie.socket.removeAllListeners('level_character_leave');
			Cassidie.socket.on('level_character_enter', function(data) {
				self.createCharacter(data, container);
			});

			Cassidie.socket.removeAllListeners('level_character_leave');
			Cassidie.socket.on('level_character_leave', function(data) {
				self.removeCharacter(data.id);
			});

			Cassidie.socket.removeAllListeners('character_moved');
			Cassidie.socket.on('character_moved', function(data) {
				self.moveCharacter(data.id, data.x, data.y, false);
			});
		};

		this.createCharacter = function(data, container) {
			var position 			= this.getTilePosition(data.x, data.y);
			var skinsCoordinates	= this.skinsCoordinates[data.attributes.skin];
			var character			= document.createElement('div');
			character.setAttribute('style', 'position:absolute;width:'+skinsCoordinates[2]+'px;height:'+skinsCoordinates[3]+'px;left:'+(position.x+skinsCoordinates[0])+'px;top:'+(position.y-skinsCoordinates[1])+'px;');
			character.setAttribute('id', 'character_'+data.id);

			var self = this;
			character.addEventListener('click', function() {
				alert(data.attributes.name);
			});
			container.appendChild(character);

			data.characterDiv = character;
			data.direction  = 'se';
			data.action		= 'standing';
			data.cellX 		= 0;
			data.cellY 		= 0;
			data.intervalID = 0;
			
			this.setCharacterBackground(data);
			
			this.characters.push(data);
			
			if (data.isMoving) {
				this.moveCharacter(data.id, data.destinationX, data.destinationY, (data.id == this.levelData.character.id) ? true : false);
			}
		};

		this.removeCharacter = function(id) {
			for (var i = this.characters.length-1; i >= 0; i--) {
				if (this.characters[i].id == id) {
					this.characters[i].characterDiv.parentNode.removeChild(this.characters[i].characterDiv);
					this.characters.splice(i, 1);
				}
			}	
		};

		this.moveCharacter = function(id, x, y, notiyOthers) {
			var character 	= this.getCharacter(id);
			var position	= this.getTilePosition(x, y);

			var cells = [];
			for (var j = 0; j < this.levelData.level.dimensions.height; j++) {
				var row = [];
				for (var i = 0; i < this.levelData.level.dimensions.width; i++) {
					var tileID   = i * this.levelData.level.dimensions.width + j;
					var tiletData = (this.levelData.level.cells[tileID] != undefined) ? this.levelData.level.cells[tileID] : this.levelData.level.cells[0];

					if (tiletData.accessible) {
						row.push(0);
					} else {
						row.push(1);
					}
				}
				cells.push(row);
			}
			if(cells[x][y] == 1) return;

			var graph = new Graph(cells);

			var start	= graph.nodes[character.x][character.y];
			var end 	= graph.nodes[x][y];

			var path = astar.search(graph.nodes, start, end);
			if(path.length == 0) return;
			
			if (notiyOthers) Cassidie.socket.emit('character_move', {x: x, y: y});		

			for (var i = 0; i < path.length; i++) {
				var cell = document.getElementById('cell_'+path[i].x+'_'+path[i].y);
				
				cell.style.opacity = 0.5;
			}

			this.moveCharacterCell(character, path, notiyOthers);
		};
		
		this.setCharacterBackground = function(character) {
			character.characterDiv.style.background = 'url(/ressources/characters/'+character.attributes.skin+'/'+character.action+'/'+character.direction+'.gif)';			
		};
			
		this.moveCharacterCell = function(character, path, notiyOthers) {
			clearInterval(character.intervalID);

			var currentCell = 0;
			var self = this;
			var step = 0;
			var cx = character.x - path[currentCell].x;
			var cy = character.y - path[currentCell].y;
			
			var dx = 0;
			var dy = 0;
			
			//down right OK
			if (cx == 0 && cy == -1) {
			    dx = -character.cellX + self.levelData.level.isometry.x;
			    dy = -character.cellY + self.levelData.level.cellSize.height - self.levelData.level.isometry.y;
			    character.direction = 'se';
			}

			//up left
			if (cx == 0 && cy == 1) {
			    dx = -character.cellX- self.levelData.level.isometry.x;
			    dy = -character.cellY- (self.levelData.level.cellSize.height - self.levelData.level.isometry.y);
			    character.direction = 'nw';
			}

			//down left OK
			if (cx == 1 && cy == 0) {
			    dx = -character.cellX - (self.levelData.level.cellSize.width - self.levelData.level.isometry.x);
			    dy = -character.cellY + self.levelData.level.isometry.y;
			    character.direction = 'sw';
			}

			//up right OK
			if (cx == -1 && cy == 0) {
			    dx = -character.cellX + self.levelData.level.cellSize.width - self.levelData.level.isometry.x;
			    dy = -character.cellY - self.levelData.level.isometry.y;
			    character.direction = 'ne';
			}
			
			character.action = 'walking';
			this.setCharacterBackground(character);

			var speed = 20;
			dx /= speed;
			dy /= speed;

			this.moveCharacterStep(character, path, dx, dy, speed, notiyOthers);
		};

		this.moveCharacterStep = function(character, path, dx, dy, speed, notiyOthers) {
			var step = 0;
			var self = this;
			character.intervalID = setInterval(function() {
				character.cellX += dx;
				character.cellY += dy;

				var position			= self.getTilePosition(character.x, character.y);
				var skinsCoordinates	= self.skinsCoordinates[character.attributes.skin];
	
				character.characterDiv.style.left	= (position.x+skinsCoordinates[0]+character.cellX)+'px';			
				character.characterDiv.style.top	= (position.y-skinsCoordinates[1]+character.cellY)+'px';

				if (step == speed-1) {
					character.x = path[0].x;
					character.y = path[0].y;
					character.cellX = 0;
					character.cellY = 0;
					var position			= self.getTilePosition(character.x, character.y);
					character.characterDiv.style.left	= (position.x+skinsCoordinates[0]+character.cellX)+'px';			
					character.characterDiv.style.top	= (position.y-skinsCoordinates[1]+character.cellY)+'px';
					clearInterval(character.intervalID);
					path.splice(0,1);
					
					if (path.length > 0 ) {
						self.moveCharacterCell(character, path, notiyOthers);
						if (notiyOthers) Cassidie.socket.emit('character_set_position', {x: character.x, y: character.y, end: false});
					} else {
						character.action = 'standing';
						self.setCharacterBackground(character);
						if (notiyOthers) Cassidie.socket.emit('character_set_position', {x: character.x, y: character.y, end: true});
					}
				}
				step++;
			}, 40);			
		};

		this.getCoordinates = function(baseX, baseY) {
			var xx = baseX - baseY * 4 / 3;
			var x = Math.floor(xx / 64);

			var yy = baseY + baseX / 4;
			var y = Math.floor(yy / 32);

			return {
				x: x,
				y: y
			}
		};

		this.getCharacter = function(id) {
			for (var i = 0; i < this.characters.length; i++)	{
				if (this.characters[i].id == id) return this.characters[i];
			}		
		};

		this.getTilePosition = function(x, y) {
			var dx = this.levelData.level.cellSize.width - this.levelData.level.isometry.x;
			var dy = this.levelData.level.cellSize.height - this.levelData.level.isometry.y;

			return {
				x: x * dx + y * this.levelData.level.isometry.x,
				y: y * dy - x * this.levelData.level.isometry.y
			}
		};

		this.destroy = function() {
			for (var i = 0; i < this.characters.length; i++)	{
				clearInterval(this.characters[i].intervalID);
				delete this.characters[i].intervalID;
				delete this.characters[i].cellX;
				delete this.characters[i].cellY;
				delete this.characters[i].characterDiv;				
			}

			var elements = Cassidie.container.childNodes;
			for (var i = 0; i < elements.length; i++) {
				Cassidie.container.removeChild(elements[i]);
			}
		};

		this.buildLevel();
	};

	this.Level.prototype	= Events.Observable;
})();