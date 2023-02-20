//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a URLLoader object.
 * 
 * @constructor
 *
 * @param {Object} [options] A URLRequest object specifying the URL to download. If this parameter is omitted, no load operation begins. If specified, the load operation begins immediately.
 * 
 * @class
 * @classdesc
 * 
 * The URLLoader class downloads data from a URL as text, binary data. It is 
 * useful for downloading text files, XML, or other information to be used in 
 * a dynamic, data-driven application.
 */
rune.net.URLLoader = function(options) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Used to convert blob data to DataURL.
     *
     * @type {FileReader}
     * @private
     */
    this.m_fileReader = null;
    
    /**
     * Describes the current request.
     *
     * @type {rune.net.URLRequest}
     * @private
     */
    this.m_request = null;
    
    /**
     * Response data from the current request.
     *
     * @type {rune.net.URLResponse}
     * @private
     */
    this.m_response = null;
    
    /**
     * For data transfer via HTTP.
     *
     * @type {XMLHttpRequest}
     * @private
     */
    this.m_xhr = null;
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------
    
    /**
     * Invokes secondary class constructor.
     */
    this.m_construct(options);
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the URLResponse object that represents the retrieved data. 
 * The reference is null if no data has been retrieved.
 *
 * @member {rune.net.URLResponse} response
 * @memberof rune.net.URLLoader
 * @instance
 * @readonly
 */
Object.defineProperty(rune.net.URLLoader.prototype, "response", {
    /**
     * @this rune.net.URLLoader
     * @ignore
     */
    get : function() {
        return this.m_response;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Closes the load operation in progress.
 *
 * @return {undefined}
 */
rune.net.URLLoader.prototype.abort = function() {
    this.m_disposeXHR();
    this.m_disposeFileReader();
    this.m_disposeRequest(true);
    this.m_disposeResponse();
};

/**
 * Loads data from the specified URL.
 *
 * @return {undefined}
 */
rune.net.URLLoader.prototype.load = function(options) {
    this.m_constructRequest(options);
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.net.URLLoader.prototype.m_construct = function(options) {
    if (options) {
        this.load(options);
    }
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates a new URLRequest.
 *
 * @param {Object} options URLRequest options.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_constructRequest = function(options) {
    this.m_disposeRequest();
    if (this.m_request == null) {
        this.m_request = new rune.net.URLRequest(options);
        if (rune.util.URL.protocol(this.m_request['url']) === "data") {
            this.m_processRequestData();
        } else {
            this.m_processRequestURL();
        }
    } else throw new Error();
};

/**
 * Creates a new URLResponse.
 *
 * @param {String} data Base64 encoded data.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_constructResponse = function(data) {
    this.m_disposeResponse();
    if (this.m_response == null && this.m_request != null) {
        this.m_response = new rune.net.URLResponse(data);
        this.m_request.exec("m_onComplete", [this.m_response]);
    } else throw new Error();
};

/**
 * Creates a new XMLHttpRequest object.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_constructXHR = function() {
    this.m_disposeXHR();
    if (this.m_xhr == null) {
        this.m_xhr = new XMLHttpRequest();
        this.m_xhr.responseType = "blob";
    }
};

/**
 * Creates a new FileReader object.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_constructFileReader = function() {
    this.m_disposeFileReader();
    if (this.m_fileReader == null) {
        this.m_fileReader = new FileReader();
    }
};

/**
 * Deletes the current URLRequest.
 *
 * @param {boolean} [abort] If the abort handler is to be called.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_disposeRequest = function(abort) {
    if (this.m_request instanceof rune.net.URLRequest) {
        if (abort == true) {
            this.m_request.exec("m_onAbort", [this]);
        }
        
        this.m_request.dispose();
        this.m_request = null;
    }
};

/**
 * Deletes the current URLResponse.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_disposeResponse = function() {
    if (this.m_response instanceof rune.net.URLResponse) {
        this.m_response.dispose();
        this.m_response = null;
    }
};

/**
 * Deletes the current XMLHttpRequest object.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_disposeXHR = function() {
    if (this.m_xhr instanceof XMLHttpRequest) {
        this.m_xhr.abort();
        this.m_xhr = null;
    }
};

/**
 * Deletes the current FileReader object.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_disposeFileReader = function() {
    if (this.m_fileReader instanceof FileReader) {
        this.m_fileReader.abort();
        this.m_fileReader = null;
    }
};

/**
 * Processes the request to "download" DataURL.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_processRequestData = function() {
    if (this.m_request) {
        this.m_constructResponse(this.m_request['url']);
    } else throw new Error();
};

/**
 * Processes the request to retrieve Data from a URL.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_processRequestURL = function() {
    var m_this = this;
    this.m_constructXHR();
    if (this.m_xhr) {
        this.m_xhr.onload = function(event) {
            if (event.target.status === 200) {
                m_this.m_processBlob(event.target.response);
            } else {
                m_this.m_execErrorProcess();
            }
        };
        
        this.m_xhr.onerror = function() {
            m_this.m_execErrorProcess();
        };
        
        this.m_xhr.open("GET", this.m_request['url'], true);
        this.m_xhr.send();
    } else throw new Error();
};

/**
 * Converts a Blob to Base64 string.
 *
 * @param {Blob} blob Blob data.
 *
 * @returns {undefined}
 * @private
 * @suppress {checkTypes}
 */
rune.net.URLLoader.prototype.m_processBlob = function(blob) {
    var m_this = this;
    this.m_constructFileReader();
    if (this.m_fileReader) {
        this.m_fileReader.onloadend = function(event) {
            m_this.m_constructResponse(event.target.result);
        };
        
        this.m_fileReader.readAsDataURL(blob);
    } else throw new Error();
};

/**
 * Execute the error handler.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLLoader.prototype.m_execErrorProcess = function() {
    if (this.m_request) {
        this.m_request.exec("m_onError", [this]);
    } else throw new Error();
};