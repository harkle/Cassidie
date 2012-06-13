CrossBrowser = {
	/**
	 * @author Patrick Poulain
	 * @see http://petitchevalroux.net
	 * @licence GPL
	 */
	getMousePosition: function(event) {
		var e = event || window.event;
		var scroll = new Array((document.documentElement && document.documentElement.scrollLeft) || window.pageXOffset || self.pageXOffset || document.body.scrollLeft,(document.documentElement && document.documentElement.scrollTop) || window.pageYOffset || self.pageYOffset || document.body.scrollTop);;
	
		return {left: e.clientX + scroll[0] - document.body.clientLeft, top: e.clientY + scroll[1] - document.body.clientTop};
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
