//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Requester class.
 *
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Requester class uses URLLoader to download resource files. Once a file 
 * is downloaded, it is automatically added to a resource library and thus 
 * made available during runtime.
 */
rune.resource.Requester = function(resources) {
    
    /**
     * Request options.
     *
     * @type {rune.resource.RequesterOptions}
     * @private
     */
    this.m_arguments = null;
    
    /**
     * The URLLoader used to retrieve requested files.
     *
     * @type {rune.net.URLLoader}
     * @private
     */
    this.m_loader = null;
    
    /**
     * The number of files that have been requested.
     *
     * @type {number}
     * @private
     */
    this.m_numRequests = 0;
    
    /**
     * Reference to the resource library to which downloaded files should 
     * be added.
     *
     * @type {rune.resource.Resources}
     * @private
     */
    this.m_resources = resources;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The download progression represented by a floating point number between 
 * 0 and 1.
 *
 * @member {number} progress
 * @memberof rune.resource.Requester
 * @instance
 * @readonly
 */
Object.defineProperty(rune.resource.Requester.prototype, "progress", {
    /**
     * @this rune.resource.Requester
     * @ignore
     */
    get : function() {
        if (this.m_arguments) {
            return 1 - (this.m_arguments['batch']['length'] / this.m_numRequests);
        }
        
        return 0;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Cancels file downloads.
 *
 * @returns {undefined}
 */
rune.resource.Requester.prototype.abort = function() {
    this.m_disposeLoader();
    if (this.m_arguments) {
        this.m_arguments.exec("onAbort");
    }
};

/**
 * Begins downloading a batch of requested files.
 *
 * @param {Object} options Loader options.
 *
 * @returns {undefined}
 */
rune.resource.Requester.prototype.load = function(options) {
    this.m_constructArguments(options);
    this.m_constructLoader();
    this.m_processRequests();
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Clears this object from memory.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.resource.Requester.prototype.dispose = function() {
    this.m_disposeLoader();
    this.m_disposeArguments();
    
    this.m_resources = null;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the RequesterOptions object.
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Requester.prototype.m_constructArguments = function(options) {
    this.m_disposeArguments();
    if (this.m_arguments == null) {
        this.m_arguments = new rune.resource.RequesterOptions(options);
        this.m_numRequests = this.m_arguments['batch']['length'];
    }
};

/**
 * Creates the URLLoader object.
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Requester.prototype.m_constructLoader = function() {
    this.m_disposeLoader();
    if (this.m_loader == null) {
        this.m_loader = new rune.net.URLLoader();
    }
};

/**
 * Deletes the RequesterOptions object.
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Requester.prototype.m_disposeArguments = function() {
    if (this.m_arguments instanceof rune.resource.RequesterOptions) {
        this.m_arguments.dispose();
        this.m_arguments = null;
    }
};

/**
 * Deletes the URLLoader object.
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Requester.prototype.m_disposeLoader = function() {
    if (this.m_loader instanceof rune.net.URLLoader) {
        this.m_loader.abort();
        this.m_loader = null;
    }
};

/**
 * Processes available requests. If the initial number of requests is zero, 
 * the callback is executed from the event loop. This is so that all callback 
 * calls are executed "asynchronously".
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Requester.prototype.m_processRequests = function() {
    if (this.m_arguments) {
        var request = this.m_arguments['batch'].shift();
        if (request) {
            this.m_processRequest(request);
        } else {
            if (this.m_numRequests == 0) {
                var m_this = this;
                window.setTimeout(function() {
                    m_this.m_arguments.exec("onComplete");
                }, 0);
            } else {
                this.m_arguments.exec("onComplete");
            }
        }
    } else throw new Error();
};

/**
 * Processing a specific request.
 *
 * @param {rune.resource.Request} request Request to process.
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Requester.prototype.m_processRequest = function(request) {
    if (this.m_loader) {
        this.m_loader.load({
            url: request['path'],
            onComplete: function(response) {
                response.asEncodedResource(function(obj) {
                    this.m_resources.add(request['name'], obj);
                    this.m_arguments.exec("onProgress", [
                        this['progress'], 
                        request['name'], 
                        response['size'],
                        response['type'],
                        obj
                    ]);
                    
                    request.dispose();
                    request = null;
                    
                    this.m_processRequests();
                }, this);
            },
            onError: function() {
                this.m_arguments.exec("onError", [
                    request['name']
                ]);
            },
            scope: this
        });   
    } else throw new Error();
};