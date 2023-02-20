//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of CameraShake.
 *
 * @constructor
 * 
 * @class
 * @classdesc
 * 
 * The CameraShake class represents a subsystem for applying a shake effect to 
 * camera objects.
 */
rune.camera.CameraShake = function() {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Shake amount in x and y axis.
     *
     * @type {rune.geom.Point}
     * @private
     */
    this.m_ammount = new rune.geom.Point(0, 0);

    /**
     * Method to call when the effect is over.
     *
     * @type {Function}
     * @private
     */
    this.m_callback = null;

    /**
     * How long the camera should shake. Time is given in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_duration = 0.0;

    /**
     * Whether the effect should gradually diminish.
     *
     * @type {boolean}
     * @private
     */
    this.m_easing = false;

    /**
     * Elapsed time in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_elapsed = 0.0;

    /**
     * Shake offset.
     *
     * @type {rune.geom.Point}
     * @private
     */
    this.m_offset = new rune.geom.Point();

    /**
     * Remaining time in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_remaining = 0;

    /**
     * Execution scope for possible callback method.
     *
     * @type {Object}
     * @private
     */
    this.m_scope = null;
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Current offset in the x axis.
 *
 * @member {number} x
 * @memberof rune.camera.CameraShake
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.CameraShake.prototype, "x", {
    /**
     * @this rune.camera.CameraShake
     * @ignore
     */
    get : function() {
        return this.m_offset.x;
    }
});

/**
 * Current offset in the y axis.
 *
 * @member {number} y
 * @memberof rune.camera.CameraShake
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.CameraShake.prototype, "y", {
    /**
     * @this rune.camera.CameraShake
     * @ignore
     */
    get : function() {
        return this.m_offset.y;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Activates the shake effect according to specified parameters.
 *
 * @param {number} duration Shake duration (in milliseconds).
 * @param {number} [ammountX=5] Shake offset in x axis.
 * @param {number} [ammountY=5] Shake offset in y axis.
 * @param {boolean} [easing=false] Shake easing.
 * @param {Function} [callback] Callback function.
 * @param {Object} [scope] Scope of execution.
 * 
 * @returns {undefined}
 */
rune.camera.CameraShake.prototype.start = function(duration, ammountX, ammountY, easing, callback, scope) {
    this.m_elapsed = 0.0;
    this.m_duration = duration;
    this.m_remaining = this.m_duration;
    this.m_ammount.x = parseInt(ammountX, 10) || 5;
    this.m_ammount.y = parseInt(ammountY, 10) || 5;
    this.m_easing = Boolean(easing);
    this.m_callback = callback || null;
    this.m_scope = scope || window;
};

/**
 * Stops ongoing effect.
 *
 * @param {boolean} [triggerCallback=false] If the callback is to be activated.
 * 
 * @returns {undefined}
 */
rune.camera.CameraShake.prototype.stop = function(triggerCallback) {
    this.m_active = false;
    this.m_ammount.x = 0.0;
    this.m_ammount.y = 0.0;
    this.m_offset.x  = 0.0;
    this.m_offset.y  = 0.0;

    if (triggerCallback === true && typeof this.m_callback === "function") {
        this.m_callback.call(this.m_scope);
    }
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Updates the logic of the effect. This method is called automatically by the 
 * current camera and thus should not be called manually.
 *
 * @param {number} step Current time step.
 * 
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraShake.prototype.update = function(step) {
    if (this.m_remaining > 0) {
        this.m_remaining -= step;
        
        var e = (this.m_easing) ? this.m_remaining / this.m_duration : 1.0;
        var x = this.m_ammount.x * e;
        var y = this.m_ammount.y * e;
        
        this.m_offset.x = rune.util.Math.random(-x, x);
        this.m_offset.y = rune.util.Math.random(-y, y);
        
        if (this.m_remaining <= 0) {
            this.stop(true);
        }
    }
};

/**
 * Removes the subsystem (CameraShake).
 * 
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraShake.prototype.dispose = function() {
    this.m_offset = null;
    this.m_ammount = null;
    this.m_callback = null;
};