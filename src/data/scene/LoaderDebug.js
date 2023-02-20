//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new LoaderDebug object.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @param {rune.system.Config} options
 *
 * @class
 * @classdesc
 * 
 * The LoaderDebug class is a Scene that loads and encodes the resources that 
 * the current application uses during runtime. The Scene uses the developer 
 * console to show what resources are loaded and is customized to perform the 
 * task as quickly as possible. This class is used automatically when the 
 * current application is executed in debug mode.
 */
rune.data.LoaderDebug = function(options) {

	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------

	/**
	 * An instance of the Config class.
	 *
	 * @type {rune.system.Config}
	 * @private
	 */
	this.m_options = options;

	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend Scene.
	 */
	rune.scene.Scene.call(this);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.data.LoaderDebug.prototype = Object.create(rune.scene.Scene.prototype);
rune.data.LoaderDebug.prototype.constructor = rune.data.LoaderDebug;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @override
 */
rune.data.LoaderDebug.prototype.init = function() {
	rune.scene.Scene.prototype.init.call(this);
	this.m_initConsole();
	this.m_initResources();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Initiates the developer console in full screen mode.
 *
 * @returns {undefined}
 * @private
 */
rune.data.LoaderDebug.prototype.m_initConsole = function() {
	this['console'].passive = true;
	this['console'].set(1.0, 0.0);
};

/**
 * Starts loading resource files.
 *
 * @returns {undefined}
 * @private
 */
rune.data.LoaderDebug.prototype.m_initResources = function() {
	var Batch = this.m_options.resources || rune.resource.Requests;
	var batch = new Batch();
	this['application']['resources'].request({
		batch: batch,
		onProgress: this.m_onProgress,
		onComplete: this.m_onComplete,
		onError: this.m_onError,
		scope: this
	});
};

/**
 * Automatically called when a resource file is loaded successfully.
 *
 * @param {number} progress Loading progress.
 * @param {string} name Resource name.
 * @param {number} size Resource size.
 * @param {string} type Resource (MIME) type.
 * @param {Object} resource Loaded resource.
 *
 * @return {undefined}
 * @private
 */
rune.data.LoaderDebug.prototype.m_onProgress = function(progress, name, size, type, resource) {
	this['console'].log("Loaded: " + name + " [" + type + "]");
};

/**
 * Called automatically when all resources have been successfully loaded.
 *
 * @return {undefined}
 * @private
 */
rune.data.LoaderDebug.prototype.m_onComplete = function() {
    var scenes = (this.m_options.scene != null) ? [new this.m_options.scene()] : [new rune.scene.Scene()];
    this['application']['scenes'].load(scenes);
	this['console'].log("Loading completed.");
	this['console'].hide(function() {
		this['console'].passive = false;
	}, this);
};

/**
 * Called automatically when a resource cannot be loaded.
 *
 * @return {undefined}
 * @private
 */
rune.data.LoaderDebug.prototype.m_onError = function(request) {
	this['console'].log("Error: Could not load " + request + ".");
};