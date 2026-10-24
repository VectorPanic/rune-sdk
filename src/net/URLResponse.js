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

    /**
     * Cleanup functions for pending media decoders.
     *
     * @type {Array.<Function>}
     * @private
     */
    this.m_decoders = [];
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
 * Encodes response data into an Audio object. Completion and failure are
 * mutually exclusive. Without onError, decoding failures throw from the event.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 * @param {Function} [onError] Receives an Error in the same scope if decoding fails.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asAudio = function(handler, scope, onError) {
    var audio = new Audio();
    audio.setAttribute("preload", "auto");

    this.m_decodeMedia(audio, "oncanplaythrough", handler, scope, onError);
};

/**
 * Encodes response data according to response type. Image and audio failures
 * use onError when supplied; synchronous format errors are still thrown.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 * @param {Function} [onError] Receives an Error if image or audio decoding fails.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asEncodedResource = function(handler, scope, onError) {
    switch (this['type']) {
        case "application/json":
            this.asJSON(handler, scope);
            break;
            
        case "audio/x-wav":
        case "audio/mpeg":
        case "audio/wav":
            this.asAudio(handler, scope, onError);
            break;
                
        case "image/jpeg":
        case "image/png":
        case "image/gif":
            this.asImage(handler, scope, onError);
            break;
            
        case "text/plain":
            this.asText(handler, scope);
            break;
            
        default:
            throw new Error("Unsupported media type.");
    }
};

/**
 * Encodes response data into an Image object. Completion and failure are
 * mutually exclusive. Without onError, decoding failures throw from the event.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 * @param {Function} [onError] Receives an Error in the same scope if decoding fails.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asImage = function(handler, scope, onError) {
    var image = new Image();
    image.decoding = "async";

    this.m_decodeMedia(image, "onload", handler, scope, onError);
};

/**
 * Decodes UTF-8 response text into a JSON object.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asJSON = function(handler, scope) {
	var obj = JSON.parse(this.m_decodeText());
	
    window.setTimeout(function() {
        handler.call(scope, obj);
    }, 0);
};

/**
 * Decodes response data into a UTF-8 text string.
 *
 * @param {Function} handler Called when the encoding is complete.
 * @param {Object} [scope] Scope of execution for the handler.
 *
 * @return {undefined}
 */
rune.net.URLResponse.prototype.asText = function(handler, scope) {
    var m_this = this;
    window.setTimeout(function() {
        handler.call(scope, m_this.m_decodeText());
    }, 0);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Installs completion and failure handlers before assigning the media source.
 * A decoder settles once; disposal removes its pending handlers. Without an
 * error callback, decoding failures throw a descriptive Error from the event.
 *
 * @param {Object} media Image or audio element.
 * @param {string} ready Name of the successful load event property.
 * @param {Function} handler Success callback receiving the decoded element.
 * @param {Object} [scope] Callback scope.
 * @param {Function} [onError] Error callback receiving an Error.
 *
 * @returns {undefined}
 * @private
 */
rune.net.URLResponse.prototype.m_decodeMedia = function(media, ready, handler, scope, onError) {
    var response = this;
    var settled = false;
    var type = this['type'];

    var cleanup = function() {
        if (settled) {
            return false;
        }

        settled = true;
        media[ready] = null;
        media['onerror'] = null;
        response.m_decoders.splice(response.m_decoders.indexOf(cleanup), 1);

        return true;
    };

    var fail = function(error) {
        if (cleanup()) {
            if (typeof onError === "function") {
                onError.call(scope, error);
            } else {
                throw error;
            }
        }
    };

    this.m_decoders.push(cleanup);

    media[ready] = function() {
        if (cleanup()) {
            handler.call(scope, media);
        }
    };

    media['onerror'] = function() {
        fail(new Error('URLResponse: Failed to decode resource of type "' + type + '".'));
    };

    try {
        media['src'] = this.m_data;
    } catch (error) {
        if (settled) {
            throw error;
        }

        fail(error);
    }
};

/**
 * Decodes UTF-8 text without changing the raw payload used for byte counts.
 * Percent-encoded text is already decoded by decodeURIComponent(). Base64
 * payloads require their decoded bytes to be interpreted as UTF-8 separately.
 *
 * @returns {string} Decoded text.
 * @throws {URIError} If the text contains invalid UTF-8.
 * @private
 */
rune.net.URLResponse.prototype.m_decodeText = function() {
    var data = this.m_decodePayload();
    if (!this.m_isBase64()) {
        return data;
    }

    var encoded = [];
    for (var i = 0; i < data.length; i++) {
        var byte = data.charCodeAt(i).toString(16);
        encoded.push('%' + ('0' + byte).slice(-2));
    }

    return decodeURIComponent(encoded.join(''));
};

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
    while (this.m_decoders.length > 0) {
        this.m_decoders[0]();
    }

    this.m_data = "";
};
