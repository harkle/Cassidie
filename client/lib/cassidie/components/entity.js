this.Entity = Events.Observable.extend({
    id:			null,
    x:			null,
    y:			null,
    isVisible:	null,
    level:		null,

    initialize: function(data, level) {
    	for (attribute in data) {
    		eval('this.'+attribute+'=data[attribute]');
    	}

    	this.level = level;	
    },

    setParameter: function(parameter, value, notify) {
    	if (notify == undefined) notify = true;

    	eval('this.'+parameter+'=value');

    	if (notify) Cassidie.socket.emit('entity_set_parameter', {id: this.id, parameter: parameter, value: value});
    },

    getData: function() {
    	var returnObject = {};

    	for (attribute in this) {
    		if (typeof this[attribute] != 'function' && attribute != 'level' && attribute != 'intervalID' && attribute != 'cellX' && attribute!= 'cellY') eval('returnObject.'+attribute+'=this[attribute]');
    	}

    	return returnObject;
    },

    move: function(x, y) {
    	this.x = x;
    	this.y = y;
    },

    show: function() {
    	this.isVisible = true;
    },

    hide:function() {
    	this.isVisible = false;
    },

    destroy: function() {
    },

    setSkin: function(appearance, isAnimated) {
    	this.appearance = appearance;

    	var animationParameters = (this.animationList[appearance] != undefined) ? this.animationList[appearance] : {numFrame: 1, looping: false};
    	Game.engine.setEntitySkin(this.id, './ressources/items/'+this.skin+'/'+this.appearance, isAnimated, animationParameters);
    },

    triggerAction: function() {
    	Cassidie.socket.emit('action_triggered', {targetId: this.id});
    	Game.trigger(Events.ACTION_TRIGGERED, this);
    }
});