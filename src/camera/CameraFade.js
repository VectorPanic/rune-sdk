//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the CameraFade class.
 *
 * @constructor
 * @extends rune.camera.CameraTintTween
 * 
 * @class
 * @classdesc
 * 
 * The CameraFade class represents a subsystem for fading in and out, a 
 * Camera object.
 */
rune.camera.CameraFade = function() {
	
	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend CameraTint.
	 */
	rune.camera.CameraTintTween.call(this);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.camera.CameraFade.prototype = Object.create(rune.camera.CameraTintTween.prototype);
rune.camera.CameraFade.prototype.constructor = rune.camera.CameraFade;

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Fade in from fill color.
 *
 * @param {number} [duration=1000] The time it takes in milliseconds to fade in.
 * @param {Function} [callback=null] A function you want to run when the fade finishes.
 * @param {Object} [scope=null] Scope of callback function.
 *
 * @returns {undefined}
 */
rune.camera.CameraFade.prototype.in = function(duration, callback, scope) {
	duration = duration || 1000;
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

/**
 * Fade to fill color.
 *
 * @param {number} [duration=1000] The time it takes in milliseconds to fade out.
 * @param {Function} [callback=null] A function you want to run when the fade finishes.
 * @param {Object} [scope=null] Scope of callback function.
 *
 * @returns {undefined}
 */
rune.camera.CameraFade.prototype.out = function(duration, callback, scope) {
	duration = duration || 1000;
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
			m_opacity: 1.0
		}
	});
}