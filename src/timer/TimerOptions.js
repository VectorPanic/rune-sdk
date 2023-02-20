//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new TimerOptions instance.
 * 
 * @constructor
 *
 * @param {Object} data Settings data.
 * 
 * @class
 * @classdesc
 * 
 * The TimerOptions class represents settings that can be sent to a Timer 
 * object. The class provides an overview of available settings.
 */
rune.timer.TimerOptions = function(data) {
    
    //--------------------------------------------------------------------------
    // Default arguments
    //--------------------------------------------------------------------------

    /**
     * @ignore
     */
    data = data || {};

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * The length of the timer object in milliseconds.
     *
     * @type {number}
     * @default 1000
     */
    this.duration = data.duration || rune.timer.TimerOptions.DEFAULT_DURATION;
    
    /**
     * This method is activated automatically when a Timer object is deleted 
     * (via dispose), without being completed first.
     *
     * @type {Function}
     */
    this.onAbort = data.onAbort || function(timer) {};

    /**
     * This method is activated automatically when the Timer object is 
     * completed. To be "completed", the entire duration, including any 
     * repetitions, must come to an end.
     *
     * @type {Function}
     */
    this.onComplete = data.onComplete || function(timer) {};

    /**
     * This method is activated automatically when the Timer object is paused.
     *
     * @type {Function}
     */
    this.onPause = data.onPause || function(timer) {};

    /**
     * This method is activated automatically when the Timer object is started.
     *
     * @type {Function}
     */
    this.onStart = data.onStart || function(timer) {};

    /**
     * This method is activated automatically when a Timer object reaches the 
     * end of its iteration. Example: If a Timer object is repeated once, this 
     * method is executed twice.
     *
     * @type {Function}
     */
    this.onTick = data.onTick || function(timer) {};

    /**
     * This method is activated automatically when the Timer object is resumed.
     *
     * @type {Function}
     */
    this.onUnpause = data.onUnpause || function(timer) {};

    /**
     * This method is automatically activated for each tick in which the Timer 
     * object is active.
     *
     * @type {Function}
     */
    this.onUpdate = data.onUpdate || function(timer) {};

    /**
     * The number of times the timer should be repeated. A setting of 0, means 
     * that the timer runs once, but is not repeated.
     *
     * @type {number}
     * @default 0
     */
    this.repeat = data.repeat || 0;

    /**
     * Scope within which callback functions are executed.
     *
     * @type {Object}
     */
    this.scope = data.scope || null;
};

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Standard duration (in milliseconds).
 *
 * @const {number}
 * @ignore
 */
rune.timer.TimerOptions.DEFAULT_DURATION = 1000;

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Duration of the timer object including repetitions.
 *
 * @member {number} durationTotal
 * @memberof rune.timer.TimerOptions
 * @instance
 * @readonly
 */
Object.defineProperty(rune.timer.TimerOptions.prototype, "durationTotal", {
    /**
     * @this rune.timer.TimerOptions
     * @ignore
     */
    get : function() {
        //@note: +1 because 1 corresponds to two ticks, 0 is one tick
        return this.duration * (this.repeat + 1);
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Disposes this object.
 *
 * @returns {undefined}
 * @ignore
 */
rune.timer.TimerOptions.prototype.dispose = function() {
    this.duration = 0;
    this.onAbort = null;
    this.onComplete = null;
    this.onPause = null;
    this.onStart = null;
    this.onTick = null;
    this.onUnpause = null;
    this.onUpdate = null;
    this.repeat = 0;
};