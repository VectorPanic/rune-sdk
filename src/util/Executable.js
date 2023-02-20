//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the Executable class.
 * 
 * @constructor
 *
 * @param {Function} [fn] A function.
 * @param {Object} [scope] Scope of execution.
 * @param {Array} [args] Function argument.
 * @param {boolean} [async] Asynchronous execution.
 * 
 * @class
 * @classdesc
 * 
 * The Executable class represents a JavaScript function with associated 
 * arguments and the scope within which the function is intended to be executed.
 */
rune.util.Executable = function(fn, scope, args, async) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Whether the function should be executed asynchronously, ie as part of 
     * the event loop.
     *
     * @type {boolean}
     * @private
     */
    this.m_async = async || false;

    /**
     * The function to be executed.
     *
     * @type {Function}
     * @private
     */
    this.m_fn = fn || function() {};

    /**
     * Scope within which the function is to be executed.
     *
     * @type {Object}
     * @private
     */
    this.m_scope = scope || null;
    
    /**
     * Function argument.
     *
     * @type {Array}
     * @private
     */
    this.m_args = args || [];
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * List of possible function arguments.
 *
 * @member {Array} args
 * @memberof rune.util.Executable
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Executable.prototype, "args", {
    /**
     * @this rune.util.Executable
     * @ignore
     */
    get : function() {
        return this.m_args;
    }
});

/**
 * Function to execute.
 *
 * @member {Function} fn
 * @memberof rune.util.Executable
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Executable.prototype, "fn", {
    /**
     * @this rune.util.Executable
     * @ignore
     */
    get : function() {
        return this.m_fn;
    }
});

/**
 * Execution scope. If this reference is null, execution is performed within 
 * the global scope of JavaScript (ie window).
 *
 * @member {Object} scope
 * @memberof rune.util.Executable
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Executable.prototype, "scope", {
    /**
     * @this rune.util.Executable
     * @ignore
     */
    get : function() {
        return this.m_scope;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Resets the object's internal memory references. Note that this process 
 * frees up memory and renders the object unusable.
 *
 * @return {undefined}
 */
rune.util.Executable.prototype.dispose = function() {
    this.m_args = null;
    this.m_fn = null;
    this.m_scope = null;
};

/**
 * Executes the assigned function of the object.
 *
 * @param {...*} [args] Optional arguments.
 *
 * @throws {TypeError} If the specified function cannot be executed.
 *
 * @return {undefined}
 */
rune.util.Executable.prototype.execute = function(args) {
    args = this.m_args.concat(Array.prototype.slice.call(arguments));
    if (typeof this.m_fn === "function") {
        if (this.m_async === true) {
            var m_this = this;
            window.setTimeout(function(args) {
                m_this.m_fn.apply(m_this.m_scope, args);
            }, 0);
        } else {
            this.m_fn.apply(this.m_scope, args);   
        }
    } else throw new TypeError();
};