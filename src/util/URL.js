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
 * Relative URLs are resolved against the document's base URL. Components use
 * the browser's normalized representation, including omission of default ports.
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
 * Returns the hostname of a URL without its port. IPv6 addresses retain their
 * surrounding brackets.
 * 
 * @param {string} url URL to process.
 * 
 * @returns {string}
 */
rune.util.URL.host = function(url) {
	var a = document.createElement("a");
		a.href = url;
		
	return a.hostname;
};

/**
 * Returns the normalized pathname of a URL, excluding its query and fragment.
 * For HTTP and HTTPS URLs, an empty path is represented as a slash.
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
 * Returns the normalized port number of a URL, or -1 if its port is empty.
 * Default protocol ports are normalized to an empty port by the browser.
 * Relative URLs inherit their port from the document's base URL.
 * 
 * @param {string} url URL to process.
 * 
 * @returns {number}
 */
rune.util.URL.port = function(url) {
	var a = document.createElement("a");
		a.href = url;

	return a.port === "" ? -1 : parseInt(a.port, 10);
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
