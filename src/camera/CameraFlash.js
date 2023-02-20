//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the CameraFlash class.
 *
 * @constructor
 * @extends rune.camera.CameraTintTween
 * 
 * @class
 * @classdesc
 * 
 * The CameraFlash class is a subsystem for applying a flash effect to a 
 * Camera object.
 */
rune.camera.CameraFlash = function() {
	
	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend CameraTintTween.
	 */
	rune.camera.CameraTintTween.call(this);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.camera.CameraFlash.prototype = Object.create(rune.camera.CameraTintTween.prototype);
rune.camera.CameraFlash.prototype.constructor = rune.camera.CameraFlash;

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Fills the screen with color that gradually fades away. The flash color can 
 * be changed via the object's color property.
 *
 * @param {number} [duration=750] How long it takes for the flash to fade.
 * @param {Function} [callback=null] A function you want to run when the flash finishes.
 * @param {Object} [scope=null] Scope of callback function.
 *
 * @returns {undefined}
 */
rune.camera.CameraFlash.prototype.start = function(duration, callback, scope) {
	duration = duration || 750;
	this.m_opacity = 1.0;
	this.m_tweens.clear();
	this.m_tweens.create({
		target: this,
		duration: duration,
		scope: this,
		onDispose: function() {
			if (callback) {
				callback.call(scope);
			}
		},
		args: {
			m_opacity: 0.0
		}
	});
}