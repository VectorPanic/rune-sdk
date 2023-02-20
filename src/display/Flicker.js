//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Flicker object.
 *
 * @constructor
 * @package
 *
 * @param {rune.display.DisplayObject} obj The display object to which the subsystem is connected.
 *
 * @class
 * @classdesc
 * 
 * The Flicker class is a subsystem that applies a flicker effect to display 
 * objects.
 */
rune.display.Flicker = function(obj) {

	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------

	/**
	 * Whether the flicker effect is active (true) or not (false).
	 *
	 * @type {boolean}
	 * @private
	 */
	this.m_active = false;
	
	/**
	 * The display object to which the flicker effect is to be applied.
	 *
	 * @type {rune.display.DisplayObject}
	 * @private
	 */
	this.m_displayObject = obj;

	/**
	 * Duration of the effect.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_duration = 0;

	/**
	 * Flicker frequency.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_frequency = 0;

	/**
	 * Used to calculate the elapsed time for flicker frequency.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_frequencyTicker = 0;

	/**
	 * Callback method for when the flicker effect has reached its end.
	 *
	 * @type {rune.util.Executable}
	 * @private
	 */
	this.m_onComplete = null;

	/**
	 * Whether the flicker effect is in a visible (true) or invisible (false) 
	 * state.
	 *
	 * @type {boolean}
	 * @private
	 */
	this.m_visible = true;
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether the flicker effect is active (true) or not (false).
 *
 * @member {boolean} active
 * @memberof rune.display.Flicker
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Flicker.prototype, "active", {
	/**
	 * @this rune.display.Flicker
	 * @ignore
	 */
	get : function() {
		return this.m_active;
	}
});

/**
 * Whether the flicker effect is in a visible (true) or invisible (false) state.
 * A display object can be visible but made invisible due to the flicker 
 * effect. Use this property together with the display object's visible 
 * property to check whether the object is rendered or not.
 *
 * @member {boolean} visible
 * @memberof rune.display.Flicker
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Flicker.prototype, "visible", {
	/**
	 * @this rune.display.Flicker
	 * @ignore
	 */
	get : function() {
		return this.m_visible;
	}
});

//------------------------------------------------------------------------------
// Public methods (API)
//------------------------------------------------------------------------------

/**
 * Starts the flicker effect with a predetermined intensity and duration. The 
 * effect can be terminated prematurely via the stop method.
 * 
 * @param {number} [duration=3000] Duration in milliseconds.
 * @param {number} [frequency=64] Intensity; a low frequency is high intensity and vice versa.
 * @param {Function} [onComplete]  Callback method.
 * @param {Object} [scope] Scope of callback method.
 *
 * @returns {undefined}
 */
rune.display.Flicker.prototype.start = function(duration, frequency, onComplete, scope) {
	this.m_active     = true;
	this.m_duration   = duration  || 500;
	this.m_frequency  = frequency || 60;
	this.m_onComplete = new rune.util.Executable(onComplete, scope);
	this.m_visible    = false;
};

/**
 * Stops ongoing flicker effect.
 *
 * @param {boolean} [exec=false] Whether the callback method should be executed as a consequence of stopping the flicker effect.
 *
 * @returns {undefined}
 */
rune.display.Flicker.prototype.stop = function(exec) {
	this.m_active    = false;
	this.m_duration  = 0;
	this.m_frequency = 0;
	this.m_visible   = true;

	if (this.m_onComplete != null && exec === true) {
		this.m_onComplete.execute();
		this.m_onComplete.dispose();
		this.m_onComplete = null;
	}
};

//------------------------------------------------------------------------------
// Internal prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Free up memory allocated by the instance.
 * 
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.display.Flicker.prototype.dispose = function() {
	this.m_displayObject = null;
	this.m_onComplete = null;
};

/**
 * Updates the flicker effect.
 * 
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.display.Flicker.prototype.update = function(step) {
	if (this.m_active == true) {
		if (this.m_duration > 0) {
			this.m_duration -= step;
			this.m_frequencyTicker += step;
			if (this.m_frequencyTicker > this.m_frequency) {
				this.m_frequencyTicker = 0;
				this.m_visible = !this.m_visible;
				
				if (this.m_displayObject['parent'] != null) {
					this.m_displayObject['parent'].breakCache();
				}
			}     
		} else {
			this.m_active = false;
			this.m_visible = true;
			this.m_displayObject['parent'].breakCache();
			if (this.m_onComplete != null) {
				this.m_onComplete.execute();
				this.m_onComplete.dispose();
				this.m_onComplete = null;
			}
		}
	}
};