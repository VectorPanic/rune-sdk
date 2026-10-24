//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
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
// PUBLIC PROTOTYPE GETTER AND SETTER METHODS
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
// PUBLIC PROTOTYPE METHODS (API)
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
        this.m_disposeArguments();
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
// INTERNAL PROTOTYPE METHODS
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
// PRIVATE PROTOTYPE METHODS
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
        this.m_numRequests = 0;
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
 * @throws {Error} If request options have not been initialized.
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
                var args = this.m_arguments;
                window.setTimeout(function() {
                    if (m_this.m_arguments === args) {
                        args.exec("onComplete");
                        m_this.m_disposeLoader();
                        m_this.m_disposeArguments();
                    }
                }, 0);
            } else {
                this.m_arguments.exec("onComplete");
                this.m_disposeLoader();
                this.m_disposeArguments();
            }
        }
    } else {
        throw new Error("Requester: Cannot process requests without initialized request options.");
    }
};

/**
 * Processing a specific request.
 *
 * @param {rune.resource.Request} request Request to process.
 *
 * @throws {Error} If the URLLoader has not been initialized.
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Requester.prototype.m_processRequest = function(request) {
    if (this.m_loader) {
        var args = this.m_arguments;
        var fail = function(error) {
            if (this.m_arguments !== args || request == null) {
                return;
            }
            
            var failed = request;
            request = null;
            this.m_execRequestError(failed, error);
        };
        
        this.m_loader.load({
            url: request['path'],
            onComplete: function(response) {
                if (this.m_arguments !== args || request == null) {
                    return;
                }
                
                try {
                    response.asEncodedResource(function(obj) {
                        if (this.m_arguments !== args || request == null) {
                            return;
                        }
                        
                        var completed = request;
                        request = null;
                        try {
                            this.m_resources.add(completed['name'], obj);
                            args.exec("onProgress", [
                                this['progress'],
                                completed['name'],
                                response['size'],
                                response['type'],
                                obj
                            ]);
                        } finally {
                            completed.dispose();
                        }
                        
                        if (this.m_arguments === args) {
                            this.m_processRequests();
                        }
                    }, this, function(error) {
                        fail.call(this, error);
                    });
                } catch (error) {
                    if (request == null) {
                        throw error;
                    }
                    
                    fail.call(this, error);
                }
            },
            onError: function() {
                fail.call(this, null);
            },
            scope: this
        });   
    } else {
        throw new Error("Requester: Cannot process a resource without an initialized URLLoader.");
    }
};

/**
 * Executes request error handling.
 *
 * @param {rune.resource.Request} request Request that failed.
 * @param {Error} [error] Network or decoding failure.
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Requester.prototype.m_execRequestError = function(request, error) {
    if (this.m_arguments == null || request == null) {
        return;
    }

    var name = request['name'];
    var handler = this.m_arguments.onError;
    var scope = this.m_arguments.scope;

    this.m_disposeLoader();
    this.m_disposeArguments();
    request.dispose();

    if (typeof handler === "function") {
        handler.call(scope, name, error || new Error('Requester: Failed to load resource "' + name + '".'));
    }
};
