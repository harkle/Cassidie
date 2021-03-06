var ThreeEngine = Class.create({
    renderer:			null,
    camera:				null,
    scene:				null,
    levelData:			null,
    skinsCoordinates:	null,
    materials:			null,
    cursor:				null,
    entities:			null,
    ground:				null,
    sprites:			null, 	
    animations:			null,
    animationInterval:	null,
    useWebGL:			null,
    stats:				null,
    destroyed:			false,

    isometry: {
    	x: 32,
    	y: 12		
    },
    cellSize: {
    	width:	80,
    	height: 36
    },

    initialize: function(_useWebGL) {
    	this.useWebGL = _useWebGL;
    },

    setup: function(data) {
    	this.levelData = data;
    	this.destroyed = false;

    	var newContainer = Game.container.cloneNode(true);
    	Game.container.parentNode.replaceChild(newContainer, Game.container);
    	Game.container = newContainer;

    	var width	= Game.gameData.viewport.width;
    	var height	= Game.gameData.viewport.height;

    	if (this.useWebGL) {
    		this.renderer = new THREE.WebGLRenderer({antialias: false});
    	} else {
    		this.renderer = new THREE.CanvasRenderer({antialias: false});			
    	}
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
    	this.animations			= {};

    	this.ground		= new THREE.Geometry();
    	this.sprites	= new THREE.Geometry();
    	
    	var materialsGround		= [];
    	var materialsSprites	= [];

    	//Material
    	for (var i = 0; i < this.levelData.cells.length; i++) {
    		var id = this.levelData.cells[i].background;
    		if (materialsGround[id] == undefined) materialsGround[id] = this.getMaterial('./ressources/levels/tiles/'+id)
    	}

    	//Sprites
    	for (var i = 0; i < this.levelData.cells.length; i++) {
    		var id = this.levelData.cells[i].sprite;
    		if (id != '') {
    			id = parseInt(id);
    			if (materialsSprites[id] == undefined) materialsSprites[id] = this.getMaterial('./ressources/levels/sprites/'+id)
    		}
    	}

    	//Items
    	for (var y = this.levelData.dimensions.height-1; y >= 0; y--) {
    		for (var x = this.levelData.dimensions.width-1; x >= 0; x--) {
    			var tileID		= y * this.levelData.dimensions.width + x;
    			var tiletData	= (this.levelData.cells[tileID] != undefined) ? this.levelData.cells[tileID] : this.levelData.cells[0];

    			var position	= this.getTilePosition(x, y);
    			var left		= position.x;
    			var top			= position.y-this.isometry.y;
    			var width		= this.cellSize.width;
    			var height		= this.cellSize.height;

    			var tile = this.createPlane(width, height, materialsGround, tiletData.background);

    			tile.position.x = left;
    			tile.position.y = top;
    			tile.position.z = 0;

    			tile.matrixAutoUpdate = false;
    			tile.updateMatrix();

    			THREE.GeometryUtils.merge(this.ground, tile);

    			if (tiletData.sprite != '') {
    				var id			= tiletData.sprite;
    				var spriteData	= this.levelData.sprites['s_'+id];
    				
    				var sprite = this.createPlane(spriteData.width, spriteData.height, materialsSprites, parseInt(tiletData.sprite));
    				sprite.position.x = left -spriteData.x;
    				sprite.position.y = top - spriteData.y;
    				sprite.position.z = this.levelData.dimensions.width - x + y + 0.2;

    				sprite.matrixAutoUpdate = false;
    				sprite.updateMatrix();

    				//THREE.GeometryUtils.merge(this.sprites, sprite);
    				this.scene.add(sprite);
    			}
    		}
    	}

    	var meshGround = new THREE.Mesh(this.ground, new THREE.MeshFaceMaterial());
    	this.scene.add(meshGround);

    	/*var meshSprites = new THREE.Mesh(this.sprites, new THREE.MeshFaceMaterial());
    	this.scene.add(meshSprites);*/

    	this.stats = new Stats();
    	this.stats.domElement.style.position = 'absolute';
    	this.stats.domElement.style.top = '0px';
    	this.stats.domElement.style.zIndex = 100;
    	Game.container.appendChild(this.stats.domElement);

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
    		var mousePosition		= CrossBrowser.getMousePosition(e);
    		var containerPosition	= CrossBrowser.findPosition(Game.container);

    		var baseX = mousePosition.left - containerPosition.left + self.camera.position.x;
    		var baseY = mousePosition.top - containerPosition.top + self.camera.position.y;

    		var overTile = self.getCoordinates(baseX, baseY);
    		var position = self.getTilePosition(overTile.x, overTile.y)

    		self.cursor.position.x = position.x;
    		self.cursor.position.y = (position.y-self.isometry.y);

    		var onEntity = false;
    		for (var i = 0; i < Game.level.entities.length; i++) {
    			if (Game.level.entities[i].x == overTile.x && Game.level.entities[i].y == overTile.y) onEntity = true; 
    		}

    		var numTile = overTile.y * self.levelData.dimensions.width + overTile.x;
    		if (numTile >= 0 && numTile < self.levelData.dimensions.width * self.levelData.dimensions.height) {
    			if (onEntity) {
    				self.setCursor('./ressources/cursor_a');					
    			} else if (self.levelData.cells[numTile].accessible) {
    				self.setCursor('./ressources/cursor');					
    			} else {
    				self.setCursor('./ressources/cursor_na');
    			}
    		} else {
    				self.setCursor('./ressources/cursor_na');					
    		}

    		if (!drag) return;
    		dragged = true;

    		var x = mousePosition.left - startX;
    		var y = mousePosition.top - startY;

    		self.camera.position.x -= x;
    		self.camera.position.y -= y;
    		startX = mousePosition.left;
    		startY = mousePosition.top;
    	});

    	CrossBrowser.addEventListener(Game.container, 'mouseup', function(e) {
    		if (!dragged) {
	    		var mousePosition		= CrossBrowser.getMousePosition(e);
	    		var containerPosition	= CrossBrowser.findPosition(Game.container);

    			var baseX = mousePosition.left - containerPosition.left + self.camera.position.x;
    			var baseY = mousePosition.top - containerPosition.top + self.camera.position.y;

    			var clickedTile = self.getCoordinates(baseX, baseY);
    			Game.level.playerCharacter.move(clickedTile.x, clickedTile.y, true);
    		}
    	});

    	CrossBrowser.addEventListener(document, 'mouseup', function(e) {
    		dragged = false;
    		drag	= false;
    	});

    	this.cursor = this.createPlane(this.cellSize.width, this.cellSize.height, [this.getMaterial('./ressources/cursor')]);
    	this.cursor.position.z = 100;
    	this.scene.add(this.cursor);

    	this.render();
    	this.animationInterval = setInterval(function() {
    		self.doAnimation();	
    	}, 100);
    },

    createPlane: function(width, height, material, materialID) {
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
    },

    doAnimation: function() {
    	for (anim in this.animations) {
    		if (this.animations[anim].running) {
    			this.entities[anim].material = this.getMaterial(this.animations[anim].file, this.animations[anim].id % this.animations[anim].numFrame);

    			this.animations[anim].id += 1;

    			if (this.animations[anim].id % this.animations[anim].numFrame == 0 && !this.animations[anim].looping) {
    				this.animations[anim].running = false;
    			}
    		}
    	}
    },

    render: function() {
    	if (this.destroyed) return;

    	this.renderer.render(this.scene, this.camera);  		

    	var self = this;

    	window.requestAnimationFrame(function() {
	    	if (self.destroyed) return;

    		self.render();
    		self.stats.update();
    	}, this.renderer.domElement);
    },

    destroy: function() {
    	clearInterval(this.animationInterval);
    	Game.container.removeChild(this.stats.domElement);
    	Game.container.removeChild(this.renderer.domElement);

    	this.renderer	= null;
    	this.stats		= null;
    	this.destroyed	= true;
    },

    getMaterial: function(file, animationID) {
    	if (animationID == undefined) animationID = '';
    	
    	file = file + animationID;

    	var material = this.materials['r_'+file];

    	if (material == undefined) {
    		material = new THREE.MeshBasicMaterial({
    			map: THREE.ImageUtils.loadTexture(file+'.png'),
    			transparent:true,
    		});

    		this.materials['r_'+file] = material;
    	}

    	return this.materials['r_'+file];
    },

    setCursor: function(file) {
    	this.cursor.material = this.getMaterial(file);
    },

    getCoordinates: function(mouseX, mouseY) {
    	var xx = mouseX - mouseY * 4 / 3;
    	var x = Math.floor(xx / 64);

    	var yy = mouseY + mouseX / 4;
    	var y = Math.floor(yy / 32);

    	return {
    		x: x,
    		y: y
    	}
    },

    getTilePosition: function(x, y) {
    	var dx = this.cellSize.width - this.isometry.x;
    	var dy = this.cellSize.height - this.isometry.y;

    	return {
    		x: x * dx + y * this.isometry.x,
    		y: y * dy - x * this.isometry.y
    	}
    },

    createText: function(text, color, x, y) {
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
    },

    addCharacter: function(characterData) {
    	this.addEntity(characterData);

    	var color = '#ffffff';
    	if (!characterData.isEnnemy) color = '#0000ff';
    	if (characterData.isEnnemy) color = '#ff0000';

    	var characterTitle	= this.createText(characterData.attributes.name, color, this.skinsCoordinates[characterData.id][2] / 2, -15);

    	this.entities[characterData.id].add(characterTitle);
    },

    addEntity: function(data) {
    	this.skinsCoordinates[data.id]	= data.skinCoordinates;

    	var position 			= this.getTilePosition();
    	var entity				= this.createPlane(this.skinsCoordinates[data.id][2], this.skinsCoordinates[data.id][3]);

    	this.scene.add(entity);
    	this.entities[data.id]	= entity;
    	this.animations[data.id]	= {
    		id: 		0,
    		running:	false,
    		file: 		'',
    		numFrame:	0,
    		looping:	false
    	};

    	this.setEntityPosition(data.id, data.x, data.y);

    	var isAnimated = (data.animationList[data.appearance] != undefined) ? true : false;

    	if (isAnimated && data.animationList[data.appearance].numFrame == 1) isAnimated = false;

    	data.setSkin(data.appearance, isAnimated);
    	
    	if (data.isVisible) this.showEntity(data.id);
    	if (!data.isVisible) this.hideEntity(data.id);

    	this.preloadSkins(data);
    },

    preloadSkins: function(data) {
    	var directions = ['ne', 'nw', 'se', 'sw'];

    	for (anim in data.animationList) {

   			for (var n = 0; n < data.animationList[anim].numFrame; n++) {
   				if (data.entityType == 'character') {
	   				var path = './ressources/characters/'+data.attributes.skin+'/'+anim+'/';
		    		for (var i = 0; i < directions.length; i++) {
    					this.getMaterial(path+directions[i]+n);
    				}
   				} else {
	   				var path = './ressources/items/'+data.skin+'/'+anim;
	   				this.getMaterial(path+n);
   				}
    		}
    	}
    },

    characterSpeech: function(id, text) {
    	var oldSpeach = this.entities[id].getChildByName('speach');
    	this.entities[id].remove(oldSpeach);

    	var speach	= this.createText(text, '#ffffff', this.skinsCoordinates[id][2] / 2, -30);

    	this.entities[id].add(speach);

    	self = this;

    	speach.name = 'speach';
    	var timeout = setTimeout(function() {
    		self.entities[id].remove(speach);
    	}, 2000 + text.length * 100);
    },

    removeEntity: function(id) {
    	this.scene.remove(this.entities[id]);
    },

    showEntity: function(id) {
    	this.scene.add(this.entities[id]);
    },

    hideEntity: function(id) {
    	this.scene.remove(this.entities[id]);
    },

    setEntitySkin: function(id, file, isAnimated, animationParameters) {
    	if (isAnimated) {
    		this.animations[id].id			= 0;
    		this.animations[id].running		= true;
    		this.animations[id].file		= file;
    		this.animations[id].numFrame	= animationParameters.numFrame;
    		this.animations[id].looping		= animationParameters.looping;
    		this.entities[id].material 		= this.getMaterial(file+'0');

    	} else {
    		this.animations[id].running		= false;
    		this.entities[id].material		= this.getMaterial(file+'0');
    	}			
    },

    setEntityPosition: function(id, x, y, dx, dy) {
    	if (dx == undefined) dx = 0;
    	if (dy == undefined) dy = 0;

    	var entity				= this.entities[id];
    	var position			= this.getTilePosition(x, y);

    	entity.position.x = position.x+this.skinsCoordinates[id][0]+dx;
    	entity.position.y = position.y-this.skinsCoordinates[id][1]+dy;

    	var z = this.levelData.dimensions.width - x + y;
    	entity.position.z = z;
    },

    setCenter: function(x, y) {
    	var position = this.getTilePosition(x, y);

    	this.camera.position.x	= position.x + this.cellSize.width / 2 - Game.gameData.viewport.width /2;
    	this.camera.position.y	= position.y + this.cellSize.height / 2 - Game.gameData.viewport.height /2;
    }
});
