//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Timer object.
 * 
 * @constructor
 *
 * @param {Object} options Timer options.
 * 
 * @class
 * @classdesc
 * 
 * The Timer class represents a countdown timer. A Timer can call functions at 
 * pre-programmed times, for example at the start and end of the countdown. 
 * Timer objects are created via instances of the Timers class.
 */
rune.timer.Timer = function(options) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * If the current Timer object is active (true) or not (false).
     * 
     * @type {boolean}
     * @private
     */
    this.m_active = false;
    
    /**
     * Timer options.
     * 
     * @type {rune.timer.TimerOptions}
     * @private
     */
    this.m_arguments = null;
    
    /**
     * If the Timer object has reached its end and is to be removed by 
     * the handler.
     * 
     * @type {boolean}
     * @private
     */
    this.m_disposed = false;
    
    /**
     * Elapsed time (in milliseconds).
     * 
     * @type {number}
     * @private
     */
    this.m_elapsed = 0.0;
    
    /**
     * If the Timer object is paused.
     * 
     * @type {boolean}
     * @private
     */
    this.m_paused = false;
    
    /**
     * The number of timer repetitions.
     * 
     * @type {number}
     * @private
     */
    this.m_repeats = 0;

    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------

    /**
     *  Invokes secondary class constructor.
     */
    this.m_construct(options);
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * If the current Timer object is active (true) or not (false).
 *
 * @member {boolean} active
 * @memberof rune.timer.Timer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.timer.Timer.prototype, "active", {
    /**
     * @this rune.timer.Timer
     * @ignore
     */
    get : function() {
        return this.m_active;
    }
});

/**
 * If the Timer object has reached its end.
 *
 * @member {boolean} complete
 * @memberof rune.timer.Timer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.timer.Timer.prototype, "complete", {
    /**
     * @this rune.timer.Timer
     * @ignore
     */
    get : function() {
        //@note: +1 because 1 corresponds to two ticks, 0 is one tick
        return (this.m_repeats >= this.m_arguments.repeat + 1);
    }
});

/**
 * Elapsed time (in milliseconds).
 *
 * @member {number} elapsed
 * @memberof rune.timer.Timer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.timer.Timer.prototype, "elapsed", {
    /**
     * @this rune.timer.Timer
     * @ignore
     */
    get : function() {
        return this.m_elapsed;
    }
});

/**
 * If the Timer object has been completed and is about to be removed by 
 * the handler.
 *
 * @member {boolean} disposed
 * @memberof rune.timer.Timer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.timer.Timer.prototype, "disposed", {
    /**
     * @this rune.timer.Timer
     * @ignore
     */
    get : function() {
        return this.m_disposed;
    }
});

/**
 * If the Timer object is paused.
 *
 * @member {boolean} paused
 * @memberof rune.timer.Timer
 * @instance
 */
Object.defineProperty(rune.timer.Timer.prototype, "paused", {
    /**
     * @this rune.timer.Timer
     * @ignore
     */
    get : function() {
        return this.m_paused;
    },
    /**
     * @this rune.timer.Timer
     * @ignore
     */
    set : function(value) {
        var a = value;
        var b = this.m_paused;
        
        this.m_paused = value;
        
        if      (a === true  && a != b) this.m_arguments.onPause.call(this.m_arguments.scope, this);
        else if (a === false && a != b) this.m_arguments.onUnpause.call(this.m_arguments.scope, this);
    }
});

/**
 * The progression of current iteration.
 *
 * @member {number} progressTick
 * @memberof rune.timer.Timer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.timer.Timer.prototype, "progressTick", {
    /**
     * @this rune.timer.Timer
     * @ignore
     */
    get : function() {
        return Math.min((this.m_elapsed % this.m_arguments.duration) / this.m_arguments.duration, 1);
    }
});

/**
 * The progression of the total length.
 *
 * @member {number} progressTotal
 * @memberof rune.timer.Timer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.timer.Timer.prototype, "progressTotal", {
    /**
     * @this rune.timer.Timer
     * @ignore
     */
    get : function() {
        return Math.min(this.m_elapsed / this.m_arguments['durationTotal'], 1);
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Pauses the Timer object. When an object is paused, no time elapses, but the 
 * object is still classified as active. A Timer object can also be paused by 
 * changing the paused property to true.
 *
 * @returns {undefined}
 */
rune.timer.Timer.prototype.pause = function() {
    this.m_paused = true;
};

/**
 * Resets and restarts the Timer object.
 *
 * @returns {undefined}
 */
rune.timer.Timer.prototype.restart = function() {
    this.m_elapsed = 0.0;
};

/**
 * Resumes the Timer object. A Timer object can also be resumed by changing 
 * the paused property to false.
 *
 * @returns {undefined}
 */
rune.timer.Timer.prototype.resume = function() {
    this.m_paused = false;
};

/**
 * Starts the countdown of the Timer object, but only if the object is inactive.
 *
 * @returns {undefined}
 */
rune.timer.Timer.prototype.start = function() {
    if (this.m_active === false) {
        this.m_active = true;
        this.m_elapsed = 0.0;
    }
};

/**
 * Stops and resets the countdown of the Timer object.
 *
 * @returns {undefined}
 */
rune.timer.Timer.prototype.stop = function() {
    this.m_active = false;
    this.m_elapsed = 0.0;
};

//------------------------------------------------------------------------------
// Public prototype methods (Engine)
//------------------------------------------------------------------------------

/**
 * Updating the Timer object.
 *
 * @param {number} step Current time step.
 *
 * @returns {boolean}
 * @package
 * @ignore
 */
rune.timer.Timer.prototype.update = function(step) {
    if (this.m_paused === true || this.m_active === false) return false;
    this.m_updateElapsed(step);
    this.m_updateComplete(step);
    
    return this['complete'];
};

/**
 * Deletes the Timer object.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.timer.Timer.prototype.dispose = function() {
    this.m_disposeTrigger();
    this.m_disposeArguments();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @param {Object} options Timer options.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.timer.Timer.prototype.m_construct = function(options) {
    this.m_initArguments(options);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the object's configuration object.
 *
 * @param {Object} options Timer options.
 *
 * @returns {undefined}
 * @private
 */
rune.timer.Timer.prototype.m_initArguments = function(options) {
    this.m_disposeArguments();
    if (this.m_arguments === null) {
        this.m_arguments = new rune.timer.TimerOptions(options);
    }
    
    this.m_arguments.onStart.call(this.m_arguments.scope, this);
};

/**
 * Updates the amount of elapsed time.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.timer.Timer.prototype.m_updateElapsed = function(step) {
    this.m_elapsed += step;
};

/**
 * Checks whether the timer has reached the end.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.timer.Timer.prototype.m_updateComplete = function(step) {
    if (this.m_arguments != null) {
        var repreats = parseInt(this.m_elapsed / this.m_arguments.duration, 10);
        if (repreats > this.m_repeats) {
            this.m_repeats = repreats;
            this.m_arguments.onTick.call(this.m_arguments.scope, this);
        }
        
        if (this.complete) this.m_arguments.onComplete.call(this.m_arguments.scope, this);
        else this.m_arguments.onUpdate.call(this.m_arguments.scope, this);
    }
};

/**
 * Calls the callback method when the object is aborted.
 *
 * @returns {undefined}
 * @private
 */
rune.timer.Timer.prototype.m_disposeTrigger = function() {
    if (this['complete'] === false && this.m_disposed === false) {
        this.m_arguments.onAbort.call(this.m_arguments.scope, this);
    }
    
    this.m_disposed = true;
};

/**
 * Deletes the Timer object's configuration object.
 *
 * @returns {undefined}
 * @private
 */
rune.timer.Timer.prototype.m_disposeArguments = function() {
    if (this.m_arguments instanceof rune.timer.TimerOptions) {
        this.m_arguments.dispose();
        this.m_arguments = null;
    }
};