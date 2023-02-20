//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the Stack class.
 * 
 * @constructor
 * 
 * @class
 * @classdesc
 * 
 * The Stack class represents a list of executable objects.
 */
rune.util.Stack = function() {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * The time (specified in milliseconds) it took to execute the contents of 
     * the entire list during the previous execution.
     *
     * @type {number}
     * @private
     */
    this.m_duration = 0.0;

    /**
     * List of executables.
     *
     * @type {Array}
     * @private
     */
    this.m_execs = [];
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The time (specified in milliseconds) it took to execute the contents of 
 * the entire list during the previous execution.
 *
 * @member {number} duration
 * @memberof rune.util.Stack
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Stack.prototype, "duration", {
    /**
     * @this rune.util.Stack
     * @ignore
     */
    get: function() {
        return this.m_duration;
    }
});

/**
 * The length of the stack, ie how many function calls are queued in the stack.
 *
 * @member {number} length
 * @memberof rune.util.Stack
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Stack.prototype, "length", {
    /**
     * @this rune.util.Stack
     * @ignore
     */
    get: function() {
        return this.m_execs.length;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Adds a function to the stack.
 *
 * @param {Function} fn Function to add.
 * @param {Object} [scope=null] The scope of the function call.
 * @param {Array} [args=null] Function argument.
 *
 * @throws {TypeError} Argument must be of valid function type.
 *
 * @return {undefined}
 */
rune.util.Stack.prototype.add = function(fn, scope, args) {
    if (typeof fn === "function") {
        scope = scope || null;
        for (var i = 0; i < this.m_execs.length; i++) {
            var exec = this.m_execs[i];
            if (exec["fn"] === fn && exec["scope"] === scope && exec["args"] === args) {
                return;
            }
        }
        
        this.m_execs.push(new rune.util.Executable(fn, scope, args));
    } else throw new TypeError("Argument must be of valid function type.");
};

/**
 * Empty the entire stack.
 *
 * @param {boolean} [dispose] Whether or not the stack should empty allocated memory. Note that this process renders the object unusable.
 *
 * @return {undefined}
 */
rune.util.Stack.prototype.clear = function(dispose) {
    while (this.m_execs.length > 0) {
        this.m_execs.shift();
    }
    
    this.m_execs = (dispose) ? null : [];
};

/**
 * Process that frees the memory allocated by the current stack. Note that this 
 * process renders the object unusable.
 *
 * @return {undefined}
 */
rune.util.Stack.prototype.dispose = function() {
    this.clear(true);
};

/**
 * Executes all objects in the current stack.
 *
 * @param {...Object} args Functional arguments.
 *
 * @return {undefined}
 */
rune.util.Stack.prototype.execute = function(args) {
    var timestamp = performance.now();
    for (var i = 0, l = this.m_execs.length; i < l; i++) {
        this.m_execs[i].execute.apply(this.m_execs[i], arguments);
    }
    
    this.m_duration = performance.now() - timestamp;
};

/**
 * Removes a function from the stack.
 *
 * @param {Function} fn Function to remove.
 * @param {Object} [scope=null] The scope in which the function will be executed.
 *
 * @return {undefined}
 */
rune.util.Stack.prototype.remove = function(fn, scope) {
    scope = scope || null;
    for (var i = 0; i < this.m_execs.length; i++) {
        var exec = this.m_execs[i];
        if (exec.fn === fn && exec.scope === scope) {
            this.m_execs.splice(i, 1);
            return;
        }
    }
};