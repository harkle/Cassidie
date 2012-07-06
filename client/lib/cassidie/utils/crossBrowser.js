var CrossBrowser = {
	getMousePosition: function(event) {
		var e 		= event || window.event;
		var scroll	= {left: (document.documentElement && document.documentElement.scrollLeft) || window.pageXOffset || self.pageXOffset || document.body.scrollLeft, top: (document.documentElement && document.documentElement.scrollTop) || window.pageYOffset || self.pageYOffset || document.body.scrollTop};
	
		return {left: e.clientX + scroll.left - document.body.clientLeft, top: e.clientY + scroll.top - document.body.clientTop};
	},

	findPosition: function(obj) {
		var curleft = curtop = 0;

		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
		}

		return {left: curleft, top: curtop};
	},

	addEventListener: function(element, eventName, handler) {
		if (element.addEventListener) {
			element.addEventListener(eventName, handler, false);
		} else if (element.attachEvent) {
			element.attachEvent('on' + eventName, handler);
		} else {
			element['on' + eventName] = handler;
		}
	},

	removeEventListener: function(element, eventName, handler) {
		if (element.addEventListener) {
			element.removeEventListener(eventName, handler, false);
		} else if (element.detachEvent) {
			element.detachEvent('on' + eventName, handler);
		} else {
			element['on' + eventName] = null;
		}
	}
}

if (!window.console) {
	console = {};
	console.log = function(message) { };
}