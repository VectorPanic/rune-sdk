//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instances a new Request object.
 *
 * @constructor
 * @package
 *
 * @param {string} name Request name (ID).
 * @param {string} path Request path (URL).
 *
 * @class
 * @classdesc
 * 
 * The Request class is used internally by the resource package to represent 
 * individual requests for resource files. A request consists of a unique 
 * name (ID) and a path that refers to the data requested. A path can also 
 * consist of "pure data", then in the form of a Data URL.
 */
rune.resource.Request = function(name, path) {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * Resource name.
	 *
	 * @type {string}
	 * @private
	 */
	this.m_name = name.toLowerCase();
	
	/**
	 * Resource path.
	 *
	 * @type {string}
	 * @private
	 */
	this.m_path = path;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Request name (ID).
 *
 * @member {string} name
 * @memberof rune.resource.Request
 * @instance
 * @readonly
 */
Object.defineProperty(rune.resource.Request.prototype, "name", {
	/**
	 * @this rune.resource.Request
	 * @ignore
	 */
	get : function() {
		return this.m_name;
	}
});

/**
 * Request path (URL).
 *
 * @member {string} path
 * @memberof rune.resource.Request
 * @instance
 * @readonly
 */
Object.defineProperty(rune.resource.Request.prototype, "path", {
	/**
	 * @this rune.resource.Request
	 * @ignore
	 */
	get : function() {
		return this.m_path;
	}
});

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
rune.resource.Request.prototype.dispose = function() {
	this.m_name = "";
	this.m_path = "";
};