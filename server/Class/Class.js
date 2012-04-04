/* 
 * Tools and base for javascript class
 *
 * Inspired by John Resig http://ejohn.org/
 */
(function() {
	/*function type( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	};
	
	function isArray( obj ) {
		return type(obj) === "array";
	};
	
	function isPlainObject( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	};

	function isFunction( obj ) {
		return type(obj) === "function";
	};

	function extend() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;
	
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !isFunction(target) ) {
			target = {};
		}
	
		// extend jQuery itself if only one argument is passed
		if ( length === i ) {
			target = this;
			--i;
		}
	
		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if ( (options = arguments[ i ]) != null ) {
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];
	
					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}
	
					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {
						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
	
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}
	
						// Never move original objects, clone them
						target[ name ] = extend( deep, clone, copy );
	
					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}
	
		// Return the modified object
		return target;
	};
*/
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    //Dummy class
    this.Class = function() {
        
        //Function to remap "this" on callback
        this.call = function() {
            var self = this;
            var args = $.makeArray(arguments);
            var func = args.shift();
        
            if (typeof func != 'function') func = eval('self.'+func);
            return function() {
                func.apply(self, arguments);
            }
        }
    };

    //Create a new Class that inherits from this class
    this.Class.create = function(prop1, prop2) {
        var prop = (prop2 == undefined) ? prop1 : prop2;
        
        //extend(Class, prop1);

        var _super = this.prototype;

        // Instantiate a base class (but only create the instance, don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof prop[name] == "function" && 
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function(name, fn){
                return function() {
                    var tmp = this._super;

                    // Add a new ._super() method that is the same method but on the super-class
                    this._super = _super[name];

                    // The method only need to be bound temporarily, so we remove it when we're done executing
                    var ret = fn.apply(this, arguments);        
                    this._super = tmp;

                    return ret;
                };
            })(name, prop[name]) :
            prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.initialize )
                this.initialize.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();