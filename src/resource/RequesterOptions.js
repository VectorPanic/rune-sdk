//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instances a new RequesterOptions object.
 *
 * @constructor
 * @package
 *
 * @param {Object} data Loader options.
 *
 * @class
 * @classdesc
 * 
 * The RequesterOptions class represents the settings that can be applied to 
 * a Requester object. The class is internal to the resource package and can 
 * therefore only be instantiated via the Requester class.
 */
rune.resource.RequesterOptions = function(data) {
    
    //--------------------------------------------------------------------------
    // Default arguments
    //--------------------------------------------------------------------------
    
    /**
     * @ignore
     */
    data = data || {};
    
    //--------------------------------------------------------------------------
    // Internal properties
    //--------------------------------------------------------------------------
    
    /**
     * Represents a "batch" of resource files in the form of a Requests object.
     *
     * @type {rune.resource.Requests}
     * @package
     */
    this.batch = data.batch || new rune.resource.Requests();
    
    /**
     * Executed when the Requester object interrupts all loading of requested 
     * files.
     *
     * @type {Function}
     * @package
     */
    this.onAbort = data.onAbort || null;
    
    /**
     * Executed when a file in the current batch has been successfully loaded.
     *
     * @type {Function}
     * @package
     */
    this.onComplete = data.onComplete || null;
    
    /**
     * Executed when loading of a requested file fails.
     *
     * @type {Function}
     * @package
     */
    this.onError = data.onError || null;
    
    /**
     * Executed when a requested file from the current "batch" has been 
     * successfully completed.
     *
     * @type {Function}
     * @package
     */
    this.onProgress = data.onProgress || null;
    
    /**
     * Scope of execution, ie within which object scope callback functions are 
     * to be executed.
     *
     * @type {Object}
     * @package
     */
    this.scope = data.scope || null;
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Clears this object from memory.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.resource.RequesterOptions.prototype.dispose = function() {
    if (this.requests) {
        this.requests.clear();
        this.requests = null;
    }
    
    this.onAbort = null;
    this.onComplete = null;
    this.onError = null;
    this.onProgress = null;
    this.scope = null;
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
rune.resource.RequesterOptions.prototype.exec = function(func, args) {
    if (typeof this[func] === "function") {
        this[func].apply(this.scope, args);
    }
};