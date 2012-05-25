/*
- textes
- anims gifs
- background
- bug creation perso
- decors
*/
(function() {
	this.ThreeEngine = function() {
		this.renderer			= null;
		this.camera				= null;
		this.scene				= null;
		this.levelData			= null;
		this.skinsCoordinates	= null;
		this.materials			= null;
		this.cursor				= null;
		this.entities			= null;
		this.geometry			= null;

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

			var width	= Game.gameData.viewport.width;
			var height	= Game.gameData.viewport.height;

			this.renderer = new THREE.WebGLRenderer({antialias: false});
			this.renderer.setSize(width, height);

			Game.container.appendChild(this.renderer.domElement);

			this.renderer.setClearColorHex(0x000000, 1.0);
			this.renderer.clear();

      		this.camera	= new THREE.OrthographicCamera(0, width, 0, height, -1, 100000);
			this.camera.position.z = 100000;

			this.scene	= new THREE.Scene();
			this.scene.add(this.camera);

			this.skinsCoordinates	= {};
			this.materials			= {};
			this.entities			= {};

			this.geometry = new THREE.Geometry();
			
			var materials = [];

			//Material
			for (var i = 0; i < this.levelData.cells.length; i++) {
				var id = this.levelData.cells[i].background;
				if (materials[id] == undefined) materials[id] = this.getMaterial('./ressources/levels/tiles/'+id, '.png')
			}

			//Objects
			for (var y = this.levelData.dimensions.height-1; y >= 0; y--) {
				for (var x = this.levelData.dimensions.width-1; x >= 0; x--) {
					var tileID		= y * this.levelData.dimensions.width + x;
					var tiletData	= (this.levelData.cells[tileID] != undefined) ? this.levelData.cells[tileID] : this.levelData.cells[0];

					var position	= this.getTilePosition(x, y);
					var left		= position.x;
					var top			= position.y-this.isometry.y;
					var width		= this.cellSize.width;
					var height		= this.cellSize.height;

					var tile = this.createPlane(width, height, materials, tiletData.background);

					tile.position.x = left;
					tile.position.y = top;
					tile.position.z = 0

					tile.matrixAutoUpdate = false;
					tile.updateMatrix();
					
					THREE.GeometryUtils.merge(this.geometry, tile);
				}
			}

			var mesh = new THREE.Mesh(this.geometry, new THREE.MeshFaceMaterial());
			this.scene.add(mesh);

			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			stats.domElement.style.zIndex = 100;
			Game.container.appendChild( stats.domElement );

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
				var baseX = e.clientX-Game.container.offsetLeft+self.camera.position.x;
				var baseY = e.clientY-Game.container.offsetTop+self.camera.position.y;

				var overTile = self.getCoordinates(baseX, baseY);
				var position = self.getTilePosition(overTile.x, overTile.y)

				self.cursor.position.x = position.x;
				self.cursor.position.y = (position.y-self.isometry.y);

				if (!drag) return;
				dragged = true;

				var x = e.clientX - startX;
				var y = e.clientY - startY;

				self.camera.position.x -= x;
				self.camera.position.y -= y;
				startX = e.clientX;
				startY = e.clientY;				
			}, false);

			Game.container.addEventListener('mouseup', function(e) {
				if (!dragged) {
					var baseX = e.clientX-Game.container.offsetLeft+self.camera.position.x;
					var baseY = e.clientY-Game.container.offsetTop+self.camera.position.y;

					var clickedTile = self.getCoordinates(baseX, baseY);
					Game.level.checkCoordinates(clickedTile.x, clickedTile.y);
					Game.level.playerCharacter.move(clickedTile.x, clickedTile.y, true);
				}
			}, false);

			document.addEventListener('mouseup', function(e) {
				dragged = false;
				drag	= false;
			}, false);

			this.cursor = this.createPlane(this.cellSize.width, this.cellSize.height, [this.getMaterial('./ressources/cursor', '.png')]);
			this.cursor.position.z = 100;
			this.scene.add(this.cursor);

			this.render();
		};

		this.createPlane = function(width, height, material, materialID) {
			if (material == undefined) 		material 	= [new THREE.MeshBasicMaterial()];
			if (materialID == undefined) 	materialID 	= 0;
			var geometry = new THREE.Geometry();

			geometry.vertices.push(new THREE.Vector3(0, 0, 0));
			geometry.vertices.push(new THREE.Vector3(width, 0, 0));
			geometry.vertices.push(new THREE.Vector3(width, height, 0));
			geometry.vertices.push(new THREE.Vector3(0, height, 0));

			geometry.faces.push(new THREE.Face4(3,2,1,0,new THREE.Vector3( 0, 1, 0 ), new THREE.Color( 0xffffff ), materialID));
			geometry.faceVertexUvs[0].push([
          		new THREE.UV(0,1),
          		new THREE.UV(1,1),
          		new THREE.UV(1,0),
          		new THREE.UV(0,0)
           	]);

           	geometry.materials = material;

			return new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
		};

		this.render = function() {
			this.renderer.render(this.scene, this.camera);  		

			var self = this;

			window.requestAnimationFrame(function() {
				self.render();
				stats.update();
			}, this.renderer.domElement);
		};

		this.destroy = function() {
			Game.container.removeChild(this.renderer.domElement);
		};

		this.getMaterial = function(file, extension) {
			var material = this.materials['r_'+file];

			if (material == undefined) {
				material = new THREE.MeshBasicMaterial({
					map: THREE.ImageUtils.loadTexture(file+extension),
					transparent:true,
				});

				this.materials['r_'+file] = material;
			}

			return this.materials['r_'+file];
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

		this.createText = function(text, color, x, y) {
			var c 	= document.createElement('canvas');
			var ctx = c.getContext('2d');

			var fontSize = 14;
			ctx.font = fontSize+'px Arial';
			c.width = ctx.measureText(text).width;
			c.height = Math.ceil(fontSize*1.25);
			ctx.fillStyle = color;
			ctx.font = fontSize+'px Arial';
			ctx.fillText(text, 0, fontSize);

			var tex = new THREE.Texture(c);
			tex.needsUpdate = true;
			var plane = this.createPlane(c.width, c.height, [new THREE.MeshBasicMaterial({map: tex, transparent: true})]);

			var textWidth 		= plane.geometry.vertices[1].x;
			plane.position.x	= x - textWidth / 2;
			plane.position.y	= y;
			plane.position.z = 99000;

			return plane;			
		};

		this.addCharacter = function(characterData) {
			this.addEntity(characterData);

			var color = '#ffffff';
			if (!characterData.isEnnemy) color = '#0000ff';
			if (characterData.isEnnemy) color = '#ff0000';

			var characterTitle	= this.createText(characterData.attributes.name, color, this.skinsCoordinates[characterData.id][2] / 2, -15);

			this.entities[characterData.id].add(characterTitle);
		};

		this.addEntity = function(objectData) {
			this.skinsCoordinates[objectData.id]	= objectData.skinCoordinates;

			var position 			= this.getTilePosition();
			var object				= this.createPlane(this.skinsCoordinates[objectData.id][2], this.skinsCoordinates[objectData.id][3]);

			this.scene.add(object);
			this.entities[objectData.id] = object;

			this.setEntityPosition(objectData.id, this.skinsCoordinates[objectData.id], objectData.x, objectData.y);

			if (objectData.objectType == 'object')		this.setEntitySkin(objectData.id, './ressources/objects/'+objectData.skin+'/'+objectData.appearance, '.gif');
			if (objectData.objectType == 'character')	this.setEntitySkin(objectData.id, './ressources/characters/'+objectData.attributes.skin+'/'+objectData.appearance+'/'+objectData.direction, '.gif');

			if (objectData.isVisible) this.showEntity(objectData.id);
			if (!objectData.isVisible) this.hideEntity(objectData.id);
		};

		this.characterSpeech = function(id, text) {
			var oldSpeach = this.entities[id].getChildByName('speach');
			this.entities[id].remove(oldSpeach);

			var speach	= this.createText(text, '#ffffff', this.skinsCoordinates[id][2] / 2, -30);

			
			this.entities[id].add(speach);

			/*var oldTimeout = speach.getAttribute('data-timeout');
			clearTimeout(oldTimeout);*/
			self = this;

			speach.name = 'speach';
			var timeout = setTimeout(function() {
				self.entities[id].remove(speach);
			}, 2000 + text.length * 100);
		};

		this.removeEntity = function(id) {
			this.scene.remove(this.entities[id]);
		};

		this.showEntity = function(id) {
			THREE.SceneUtils.traverseHierarchy(this.entities[id], function ( object ) { object.visible = true; });
		};

		this.hideEntity = function(id) {
			THREE.SceneUtils.traverseHierarchy(this.entities[id], function ( object ) { object.visible = false; });
		};

		this.setEntitySkin = function(id, file, extension) {
			this.entities[id].material = this.getMaterial(file, extension);
		};

		this.setEntityPosition = function(id, skin, x, y, dx, dy) {
			if (dx == undefined) dx = 0;
			if (dy == undefined) dy = 0;
	
			var object				= this.entities[id];
			var position			= this.getTilePosition(x, y);

			object.position.x = position.x+this.skinsCoordinates[id][0]+dx;
			object.position.y = position.y-this.skinsCoordinates[id][1]+dy;

			var z = this.levelData.dimensions.width - x + y * this.levelData.dimensions.width;
			object.position.z = z;		
		};
		
		this.setCenter = function(x, y) {
			var position = this.getTilePosition(x, y);
			
			this.camera.position.x	= position.x + this.cellSize.width / 2 - Game.gameData.viewport.width /2;
			this.camera.position.y	= position.y + this.cellSize.height / 2 - Game.gameData.viewport.height /2;
		};
	};
})();