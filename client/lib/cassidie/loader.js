/* 
 * Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>. MIT Licensed
 * 
 * Source: https://github.com/chriso/load.js
 */
(function(a){a=a||{};var b={},c,d;c=function(a,d,e){var f=a.halt=!1;a.error=function(a){throw a},a.next=function(c){c&&(f=!1);if(!a.halt&&d&&d.length){var e=d.shift(),g=e.shift();f=!0;try{b[g].apply(a,[e,e.length,g])}catch(h){a.error(h)}}return a};for(var g in b){if(typeof a[g]==="function")continue;(function(e){a[e]=function(){var g=Array.prototype.slice.call(arguments);if(e==="onError"){if(d){b.onError.apply(a,[g,g.length]);return a}var h={};b.onError.apply(h,[g,g.length]);return c(h,null,"onError")}g.unshift(e);if(!d)return c({},[g],e);a.then=a[e],d.push(g);return f?a:a.next()}})(g)}e&&(a.then=a[e]),a.call=function(b,c){c.unshift(b),d.unshift(c),a.next(!0)};return a.next()},d=a.addMethod=function(d){var e=Array.prototype.slice.call(arguments),f=e.pop();for(var g=0,h=e.length;g<h;g++)typeof e[g]==="string"&&(b[e[g]]=f);--h||(b["then"+d.substr(0,1).toUpperCase()+d.substr(1)]=f),c(a)},d("chain",function(a){var b=this,c=function(){if(!b.halt){if(!a.length)return b.next(!0);try{null!=a.shift().call(b,c,b.error)&&c()}catch(d){b.error(d)}}};c()}),d("run",function(a,b){var c=this,d=function(){c.halt||--b||c.next(!0)},e=function(a){c.error(a)};for(var f=0,g=b;!c.halt&&f<g;f++)null!=a[f].call(c,d,e)&&d()}),d("defer",function(a){var b=this;setTimeout(function(){b.next(!0)},a.shift())}),d("onError",function(a,b){var c=this;this.error=function(d){c.halt=!0;for(var e=0;e<b;e++)a[e].call(c,d)}})})(this);

var head = document.getElementsByTagName('head')[0] || document.documentElement;

addMethod('load', function (args, argc) {
	args = args[0];
	argc = args.length;
    for (var queue = [], i = 0; i < argc; i++) {
        (function (i) {
            queue.push(asyncLoadScript(args[i]));
        }(i));
    }
    this.call('run', queue);
});

function asyncLoadScript(src) {
    return function (onload, onerror) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.onload = onload;
        script.onerror = onerror;
        script.onreadystatechange = function () {
            var state = this.readyState;
            if (state === 'loaded' || state === 'complete') {
                script.onreadystatechange = null;
                onload();
            }
        };
        head.insertBefore(script, head.firstChild);
    }
}

/*!
  * domready (c) Dustin Diaz 2012 - License MIT
  *
  * Source: https://github.com/ded/domready
  */
!function(a,b){typeof module!="undefined"?module.exports=b():typeof define=="function"&&typeof define.amd=="object"?define(b):this[a]=b()}("domready",function(a){function m(a){l=1;while(a=b.shift())a()}var b=[],c,d=!1,e=document,f=e.documentElement,g=f.doScroll,h="DOMContentLoaded",i="addEventListener",j="onreadystatechange",k="readyState",l=/^loade|c/.test(e[k]);return e[i]&&e[i](h,c=function(){e.removeEventListener(h,c,d),m()},d),g&&e.attachEvent(j,c=function(){/^c/.test(e[k])&&(e.detachEvent(j,c),m())}),a=g?function(c){self!=top?l?c():b.push(c):function(){try{f.doScroll("left")}catch(b){return setTimeout(function(){a(c)},50)}c()}()}:function(a){l?a():b.push(a)}})

/*
 * Cassidie Loader Class
 *
 * @author Lionel Tardy
 * @class
 *
 * @param scripts {Array, String} List of user's javascript game files
 * @param path {String} Path of cassidie library
 * @param server {String} Server adress
 * @param targetDiv {String} div id where the game should be rendered
 * @param useCustomeEngine {Boolean} Use user's graphic engine instead of standard one
 * @param customEngineFiles {Array, String} List of user's javascript graphic engine files 
 */
Loader = {
	load: function(scripts, path, server, targetDiv, useCustomeEngine, customEngineFiles) {
		domready(function() {
			var customEngineFilesList	= (customEngineFiles instanceof Array) ? customEngineFiles : [customEngineFiles];
			var engineFiles 			= (useCustomeEngine) ? customEngineFilesList: [path+'/lib/three.js/Detector.js', path+'lib/three.js/Three.js', path+'lib/three.js/Stat.js', path+'utils/graphics/threeEngine.js', path+'utils/graphics/divEngine.js'];
			scripts 					= (scripts instanceof Array) ? scripts : [scripts];

			load([
					path+'utils/class.js'
				]).then([
					path+'utils/crossBrowser.js',
					path+'utils/events.js',
					server+'/socket.io/socket.io.js',
					path+'lib/javascript-astar/astar-min.js',					
				]).then([
					path+'cassidie.js',
				]).then([					
					path+'account.js',
					path+'chat.js',
					path+'components/game.js',
					path+'components/level.js',
					path+'components/entity.js'
				]).then([
					path+'components/item.js',
					path+'components/character.js'
				]).then(engineFiles).then(scripts).thenRun(function() {
					Cassidie.start(server, targetDiv, useCustomeEngine);
				}
			);
		});
	}
}