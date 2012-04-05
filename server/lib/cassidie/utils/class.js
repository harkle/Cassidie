/* 
 * Tools and base for javascript class
 *
 * Inspired by John Resig http://ejohn.org/
 */
(function() {
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