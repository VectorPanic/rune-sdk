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
 * Adds a function to the stack unless the same function, scope and argument
 * list are already registered. Omitted, null and empty argument lists are
 * equivalent. Non-empty argument lists are compared by reference.
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
        args = args || [];
        
        for (var i = 0; i < this.m_execs.length; i++) {
            var exec = this.m_execs[i];
            var sameArgs = exec["args"] === args || (exec["args"].length === 0 && args.length === 0);
            
            if (exec["fn"] === fn && exec["scope"] === scope && sameArgs) {
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
 * Callbacks removed before their turn are skipped. Callbacks added during
 * execution wait until the next call. Clearing or disposing the stack stops
 * execution of its remaining callbacks.
 *
 * @param {...*} args Functional arguments.
 *
 * @return {undefined}
 */
rune.util.Stack.prototype.execute = function(args) {
    var timestamp = performance.now();

    if (this.m_execs == null) {
        return;
    }

    var execs = this.m_execs.slice();

    for (var i = 0; i < execs.length; i++) {
        if (this.m_execs == null) {
            break;
        }

        var exec = execs[i];
        if (this.m_execs.indexOf(exec) !== -1) {
            exec.execute.apply(exec, arguments);
        }
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
