//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a URLRequest object.
 * 
 * @constructor
 * @package
 *
 * @param {Object} [options] URLRequest options.
 * 
 * @class
 * @classdesc
 * 
 * The URLRequest class captures all of the information in a single HTTP request.
 */
rune.net.URLRequest = function(options) {
    
    //--------------------------------------------------------------------------
    // Default arguments
    //--------------------------------------------------------------------------
    
    /**
     * @ignore
     */
    options = options || {};
	
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Callback function for when download is canceled.
     *
     * @type {Function}
     * @private
     */
    this.m_onAbort = options.onAbort || null;
    
    /**
     * Callback function on completion.
     *
     * @type {Function}
     * @private
     */
    this.m_onComplete = options.onComplete || null;
    
    /**
     * Callback function in case of error.
     *
     * @type {Function}
     * @private
     */
    this.m_onError = options.onError || null;
    
    /**
     * Scope of execution for callback functions.
     *
     * @type {Object}
     * @private
     */
    this.m_scope = options.scope || null;
    
    /**
     * Path (URL) of the requested data.
     *
     * @type {string}
     * @private
     */
    this.m_url = options.url || null;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Path (URL) of the requested data.
 *
 * @member {string} url
 * @memberof rune.net.URLRequest
 * @instance
 * @readonly
 */
Object.defineProperty(rune.net.URLRequest.prototype, "url", {
    /**
     * @this rune.net.URLRequest
     * @ignore
     */
    get : function() {
        return this.m_url;
    }
});

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Removes the object from memory.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.net.URLRequest.prototype.dispose = function() {
    this.m_onComplete = null;
    this.m_onError = null;
    this.m_scope = null;
    this.m_url = "";
};

/**
 * Executing a callback handler.
 *
 * @param {string} func Callback function.
 * @param {Array} [args] Callback arguments.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.net.URLRequest.prototype.exec = function(func, args) {
	if (typeof this[func] === "function") {
        this[func].apply(this.m_scope, args);
    }
};