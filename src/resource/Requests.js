//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Requests class.
 *
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Requests class represents a list (batch) containing the name and path 
 * of files (resources) to be used by the current application.
 */
rune.resource.Requests = function() {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * List containing all requests registered by the object.
	 *
	 * @type {Array.<rune.resource.Request>}
	 * @private
	 */
	this.m_requests = [];
	
	//--------------------------------------------------------------------------
	// Constructor call
	//--------------------------------------------------------------------------
	
	/**
	 * Invokes secondary class constructor.
	 */
	this.m_construct();
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The number of registered requested resources.
 *
 * @member {number} length
 * @memberof rune.resource.Requests
 * @instance
 * @readonly
 */
Object.defineProperty(rune.resource.Requests.prototype, "length", {
	/**
	 * @this rune.resource.Requests
	 * @ignore
	 */
	get : function() {
		return this.m_requests.length;
	}
});

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Add a new resource request.
 *
 * @param {string} name Resource name (ID).
 * @param {string} path Resource path.
 *
 * @returns {undefined}
 */
rune.resource.Requests.prototype.add = function(name, path) {
	if (this.get(name) == null) {
		this.m_requests.push(
			new rune.resource.Request(name, path)
		);
	}
};

/**
 * Clears the entire list (batch) of requests.
 *
 * @returns {undefined}
 */
rune.resource.Requests.prototype.clear = function() {
	while (this.m_requests.length) {
		this.m_requests[0].dispose();
		this.m_requests[0] = null;
		this.m_requests.splice(0, 1);
	}
};

/**
 * Retrieve a resource request based on its name.
 *
 * @param {string} name Resource name (ID).
 *
 * @returns {rune.resource.Request}
 */
rune.resource.Requests.prototype.get = function(name) {
	var i = this.m_requests.length;
	while (i--) {
		if (this.m_requests[i]['name'] == name.toLowerCase()) {
			return this.m_requests[i];
		}
	}
	
	return null;
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Removes the first request from the list.
 *
 * @returns {rune.resource.Request}
 * @package
 * @ignore
 */
rune.resource.Requests.prototype.shift = function() {
	return this.m_requests.shift();
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
rune.resource.Requests.prototype.m_construct = function() {
	//@note: override to add resource requests.
};