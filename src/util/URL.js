//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object of the URL class.
 *
 * @constructor
 *
 * @class
 * @classdesc
 *
 * The URL class offers static methods for handling a string according to the 
 * Uniform Resource Locator (URL) format.
 */
rune.util.URL = function() {
	console.warn("This class is not meant to be instantiated; all content is static.");
};

//--------------------------------------------------------------------------
// Public static methods
//--------------------------------------------------------------------------

/**
 * Returns the fragment identifier of the URL, ie. the ID on the page that 
 * the URL is trying to target.
 * 
 * @param {string} url URL to process.
 * 
 * @returns {string}
 */
rune.util.URL.fragment = function(url) {
	var a = document.createElement("a");
		a.href = url;
		
	return a.hash.substring(1);
};

/**
 * Returns the host section of a URL.
 * 
 * @param {string} url URL to process.
 * 
 * @returns {string}
 */
rune.util.URL.host = function(url) {
	var a = document.createElement("a");
		a.href = url;
		
	return a.host.split(":")[0];
};

/**
 * Returns the path of the URL for the location, which will be the empty 
 * string if there is no path.
 * 
 * @param {string} url URL to process.
 * 
 * @returns {string}
 */
rune.util.URL.path = function(url) {
	var a = document.createElement("a");
		a.href = url;
	
	return a.pathname;
};

/**
 * Returns the port number of the URL. If the URL does not contain an explicit 
 * port number, it will be set to -1.
 * 
 * @param {string} url URL to process.
 * 
 * @returns {number}
 */
rune.util.URL.port = function(url) {
	return parseInt(url.split("/")[2].split(":")[1], 10) || -1;
};

/**
 * Returns the protocol scheme of the URL.
 * 
 * @param {string} url URL to process.
 * 
 * @returns {string}
 */
rune.util.URL.protocol = function(url) {
	var a = document.createElement("a");
		a.href = url;
	
	return a.protocol.split(":")[0];
};