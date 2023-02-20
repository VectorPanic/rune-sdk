//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Resource object.
 *
 * @constructor
 * @package
 *
 * @param {string} name Resource name (ID).
 * @param {Object} data Resource data.
 *
 * @class
 * @classdesc
 * 
 * The Resource class represents data that is meant to be used within a Rune 
 * application. Resource data can consist of images, audio, plain text, JSON 
 * and XML data.
 */
rune.resource.Resource = function(name, data) {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * Resource data.
	 *
	 * @type {Object}
	 * @private
	 */
	this.m_data = data;
	
	/**
	 * Resource name.
	 *
	 * @type {string}
	 * @private
	 */
	this.m_name = name.toLowerCase();
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Resource data.
 *
 * @member {Object} data
 * @memberof rune.resource.Resource
 * @instance
 * @readonly
 */
Object.defineProperty(rune.resource.Resource.prototype, "data", {
	/**
	 * @this rune.resource.Resource
	 * @ignore
	 */
	get : function() {
		return this.m_data;
	}
});

/**
 * Resource name (ID).
 *
 * @member {string} name
 * @memberof rune.resource.Resource
 * @instance
 * @readonly
 */
Object.defineProperty(rune.resource.Resource.prototype, "name", {
	/**
	 * @this rune.resource.Resource
	 * @ignore
	 */
	get : function() {
		return this.m_name;
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
rune.resource.Resource.prototype.dispose = function() {
	this.m_data = null;
	this.m_name = "";
};