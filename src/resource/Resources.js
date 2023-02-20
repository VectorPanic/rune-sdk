//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of Resources.
 *
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Resources class represents a resource library for data to be used 
 * within a Rune application. Resources can be added and removed during runtime.
 */
rune.resource.Resources = function() {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * Objects that enable the loading of new resource files.
	 *
	 * @type {rune.resource.Requester}
	 * @private
	 */
	this.m_requester = null;
	
	/**
	 * The resource library's available resources.
	 *
	 * @type {Array.<rune.resource.Resource>}
	 * @private
	 */
	this.m_resources = [];
	
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
 * The number of resources currently available in the resource library.
 *
 * @member {number} length
 * @memberof rune.resource.Resources
 * @instance
 * @readonly
 */
Object.defineProperty(rune.resource.Resources.prototype, "length", {
	/**
	 * @this rune.resource.Resources
	 * @ignore
	 */
	get : function() {
		return this.m_resources.length;
	}
});

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Add a new resource to the resource library.
 *
 * @param {string} name Resource name (ID).
 * @param {Object} data Resource data.
 *
 * @returns {undefined}
 */
rune.resource.Resources.prototype.add = function(name, data) {
	if (this.get(name) == null) {
		this.m_resources.push(
			new rune.resource.Resource(name, data)
		);
	}
};

/**
 * Empty the resource library.
 *
 * @returns {undefined}
 */
rune.resource.Resources.prototype.clear = function() {
	while (this.m_resources.length) {
		this.m_resources[0].dispose();
		this.m_resources[0] = null;
		this.m_resources.splice(0, 1);
	}
};

/**
 * Retrieve a specific resource from the resource library. Each resource is 
 * identified by a unique name (ID). If the desired resource cannot be found, 
 * null is returned instead.
 *
 * @param {string} name Resource name (ID).
 *
 * @returns {rune.resource.Resource}
 */
rune.resource.Resources.prototype.get = function(name) {
	var i = this.m_resources.length;
	while (i--) {
		if (this.m_resources[i]['name'] == name.toLowerCase()) {
			return this.m_resources[i];
		}
	}
	
	return null;
};

/**
 * Deletes a specific resource from the resource library. Deleted resources 
 * are cleared from memory.
 *
 * @param {string} name Resource name (ID).
 *
 * @returns {boolean}
 */
rune.resource.Resources.prototype.remove = function(name) {
	var i = this.m_resources.length;
	while (i--) {
		if (this.m_resources[i]['name'] == name.toLowerCase()) {
			this.m_resources[i].dispose();
			this.m_resources[i] = null;
			this.m_resources.splice(i, 1);
			
			return true;
		}
	}
	
	return false;
};

/**
 * Request a set of files to load into the resource library during runtime.
 *
 * @param {Object} options Request options.
 *
 * @returns {undefined}
 */
rune.resource.Resources.prototype.request = function(options) {
	this.m_requester.load(options);
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Clears the resource library from memory.
 *
 * @returns {undefined}
 * @ignore
 */
rune.resource.Resources.prototype.dispose = function() {
	this.clear();
	this.m_resources = null;
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
rune.resource.Resources.prototype.m_construct = function() {
	this.m_constructRequester();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the Loader object.
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Resources.prototype.m_constructRequester = function() {
	this.m_disposeLoader();
	if (this.m_requester == null) {
		this.m_requester = new rune.resource.Requester(this);
	}
};

/**
 * Removes the Loader object.
 *
 * @returns {undefined}
 * @private
 */
rune.resource.Resources.prototype.m_disposeLoader = function() {
	if (this.m_requester instanceof rune.resource.Requester) {
		this.m_requester.dispose();
		this.m_requester = null;
	}
};