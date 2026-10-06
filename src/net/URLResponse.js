//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of URLResponse. Note that new instances can only be 
 * created by URLLoader objects.
 * 
 * @constructor
 * @package
 *
 * @class
 * @classdesc
 * 
 * The URLResponse class represents a response from a URLLoader. The class 
 * stores response data as URL Data (RFC2397), but can also encode to other 
 * data formats such as Audio, Image and JSON.
 */
rune.net.URLResponse = function(data) {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * Data (according to RFC2397).
	 *
	 * @type {string}
	 * @private
	 */
	this.m_data = data || "";
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The content type of the retrieved raw data.
 *
 * @member {string} type
 * @memberof rune.net.URLResponse
 * @instance
 * @readonly
 */
Object.defineProperty(rune.net.URLResponse.prototype, "type", {
	/**
	 * @this rune.net.URLResponse
	 * @ignore
	 */
	get : function() {
		var type = this.m_data.match(/^data:([^;,]+)/);
		if (type != null && type.length > 1) return type[1];
		else return "application/octet-stream";
	}
});

/**
 * The raw data retrieved by the URLLoader object. Note that the data is 
 * according to the URL Data format (RFC2397).
 *
 * @member {string} data
 * @memberof rune.net.URLResponse
 * @instance
 * @readonly
 */
Object.defineProperty(rune.net.URLResponse.prototype, "data", {
	/**
	 * @this rune.net.URLResponse
	 * @ignore
	 */
	get : function() {
		return this.m_data;
	}
});

/**
 * The size of the raw data in bytes. Note that the Base64 format is used to 
 * store the data and therefore compresses the file size compared to the 
 * original file.
 *
 * @member {number} size
 * @memberof rune.net.URLResponse
 * @instance
 * @readonly
 */
Object.defineProperty(rune.net.URLResponse.prototype, "size", {
    /**
     * @this rune.net.URLResponse
     * @ignore
     */
    get : function() {
        return this.m_decodePayload().length;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Encodes response data into an Audio object.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asAudio = function(handler, scope) {
	var audio = new Audio(this.m_data);
		audio.setAttribute("preload", "auto");
		audio.oncanplaythrough = function() {
			audio.oncanplaythrough = null;
			handler.call(scope, audio);
		};
};

/**
 * Encodes response data according to response type.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asEncodedResource = function(handler, scope) {
    switch (this['type']) {
        case "application/json":
            this.asJSON(handler, scope);
            break;
            
        case "audio/x-wav":
        case "audio/mpeg":
        case "audio/wav":
            this.asAudio(handler, scope);
            break;
                
        case "image/jpeg":
        case "image/png":
        case "image/gif":
            this.asImage(handler, scope);
            break;
            
        case "text/plain":
            this.asText(handler, scope);
            break;
            
        default:
            throw new Error("Unsupported media type.");
    }
};

/**
 * Encodes response data into an Image object.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asImage = function(handler, scope) {
	var img = new Image();
		img.src = this.m_data;
        img.decoding = "async";
		img.onload = function() {
			img.onload = null;
			handler.call(scope, img);
		};
};

/**
 * Encodes response data into an JSON object.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asJSON = function(handler, scope) {
	var obj = JSON.parse(this.m_decodePayload());
	
    window.setTimeout(function() {
        handler.call(scope, obj);
    }, 0);
};

/**
 * Encodes response data into a plain text string.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asText = function(handler, scope) {
    var m_this = this;
    window.setTimeout(function() {
        handler.call(scope, m_this.m_decodePayload());
    }, 0);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Decodes the data payload from the Data URL.
 *
 * @returns {string}
 * @private
 */
rune.net.URLResponse.prototype.m_decodePayload = function() {
    var payload = this.m_getPayload();
    if (this.m_isBase64()) {
        return window.atob(payload);
    }

    return decodeURIComponent(payload);
};

/**
 * Returns the payload section from the Data URL.
 *
 * @returns {string}
 * @private
 */
rune.net.URLResponse.prototype.m_getPayload = function() {
    var data = this.m_data.split(",");
    if (data.length > 1) return data.slice(1).join(",");
    else return "";
};

/**
 * Checks if the Data URL payload is Base64 encoded.
 *
 * @returns {boolean}
 * @private
 */
rune.net.URLResponse.prototype.m_isBase64 = function() {
    return /;base64(?:,|$)/.test(this.m_data);
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Deletes the response data.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.net.URLResponse.prototype.dispose = function() {
    this.m_data = "";
};
