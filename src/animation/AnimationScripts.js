//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new AnimationScripts object.
 *
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The AnimationScripts class is a handler for executing program code as part 
 * of an animation sequence. Via this handler, a function call can be linked 
 * to a keyframe within the current animation. The function call is called when 
 * the keyframe is played back as part of the animation sequence.
 */
rune.animation.AnimationScripts = function() {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * List containing registered scripts.
	 *
	 * @type {Array.<rune.util.Executable>}
	 * @private
	 */
	this.m_scripts = [];
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Returns the number of scripts registered by the handler.
 *
 * @member {number} length
 * @memberof rune.animation.AnimationScripts
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.AnimationScripts.prototype, "length", {
	/**
	 * @this rune.animation.AnimationScripts
	 * @ignore
	 */
	get : function() {
		return this.m_scripts.length;
	}
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds a new script to the current animation sequence. The script is added to 
 * a specific keyframe and there can only be one script per keyframe.
 *
 * @param {number} index Index of the keyframe to which the script is to be added.
 * @param {Function} callback Reference to the function that represents the script.
 * @param {Object} scope Scope within which the script is executed.
 *
 * @returns {undefined}
 */
rune.animation.AnimationScripts.prototype.add = function(index, callback, scope) {
	this.m_scripts[index] = new rune.util.Executable(
		callback,
		scope
	);
};

/**
 * Deletes a script from a keyframe.
 *
 * @param {number} index Index of the keyframe whose script is to be deleted.
 *
 * @returns {undefined}
 */
rune.animation.AnimationScripts.prototype.remove = function(index) {
	if (this.m_scripts[index]) {
		this.m_scripts[index].dispose();
		this.m_scripts[index] = null;
	}
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Executes the script of a keyframe.
 *
 * @param {number} index Index of the keyframe whose script is to be executed.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.animation.AnimationScripts.prototype.exec = function(index) {
	if (this.m_scripts[index] != null) {
		this.m_scripts[index].execute();
	}
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Clears memory allocated by this instance.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.animation.AnimationScripts.prototype.dispose = function() {
	while (this.m_scripts.length) {
        if (this.m_scripts[0] != null) {
            this.m_scripts[0].dispose();
            this.m_scripts[0] = null;
        }
        
        this.m_scripts.splice(0, 1);
	}
	
	this.m_scripts = null;
};