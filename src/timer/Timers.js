//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the Timers class.
 * 
 * @constructor
 *
 * @param {Object} [scope] Scope within which the Timer object's callback functions are executed.
 * 
 * @class
 * @classdesc
 * 
 * The Timers class represents a handler for Timer objects. All handling of 
 * Timer objects must be done via an instance of this class.
 */
rune.timer.Timers = function(scope) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Pauses all Timer objects that are registered with the Timers instance.
     *
     * @type {boolean}
     * @default false
     */
    this.paused = false;

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * List containing all Timer objects registered with the manager.
     *
     * @type {Array.<rune.timer.Timer>}
     * @private
     */
    this.m_timers = [];

    /**
     * Scope within which the Timer object's callback functions are executed.
     *
     * @type {Object}
     * @private
     */
    this.m_scope = scope || window;
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * The number of Timer objects that are currently registered with the Timer 
 * instance.
 *
 * @member {number} length
 * @memberof rune.timer.Timers
 * @instance
 * @readonly
 */
Object.defineProperty(rune.timer.Timers.prototype, "length", {
    /**
     * @this rune.timer.Timers
     * @ignore
     */
    get : function() {
        return this.m_timers.length;
    }
});

/**
 * The number of registered Timer objects that are currently active. Stopped 
 * Timer objects are inactive, but paused are still considered active.
 *
 * @member {number} numActive
 * @memberof rune.timer.Timers
 * @instance
 * @readonly
 */
Object.defineProperty(rune.timer.Timers.prototype, "numActive", {
    /**
     * @this rune.timer.Timers
     * @ignore
     */
    get : function() {
        var n = 0;
        var i = this.m_timers.length;
        while (i--) {
            if (this.m_timers[i]['active'] == true) {
                n++;
            }
        }
        
        return n;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds the specified Timer object to the handler. Note that new Timer objects 
 * should be created using the create method.
 *
 * @param {rune.timer.Timer} timer Timer object to add.
 * @param {boolean} [autoStart=true] If the Timer object is to be started automatically.
 *
 * @returns {rune.timer.Timer}
 */
rune.timer.Timers.prototype.add = function(timer, autoStart) {
    var i = this.m_timers.indexOf(timer);
    if (i === -1) {
        this.m_timers.push(timer);
        if (autoStart !== false) timer.start();
    }
    
    return timer;
};

/**
 * Removes, and deallocates all registered Timer objects.
 *
 * @returns {undefined}
 */
rune.timer.Timers.prototype.clear = function() {
    for (var i = 0; i < this.m_timers.length; i++) {
        this.remove(this.m_timers[i]);
    }
};

/**
 * Creates and registers a new Timer object according to the specified 
 * options object.
 *
 * @param {Object} options Timer options.
 * @param {boolean} [autoStart=true] If the Timer object is to be started automatically.
 *
 * @returns {rune.timer.Timer} The new Timer object.
 */
rune.timer.Timers.prototype.create = function(options, autoStart) {
    options = options || {};
    options.scope = options.scope || this.m_scope;
    var timer = new rune.timer.Timer(options);
    return this.add(timer, autoStart);
};

/**
 * Removes the specified Timer object from the handler and activates the 
 * deallocation process for that object.
 *
 * @param {rune.timer.Timer} timer Timer to remove.
 *
 * @returns {boolean}
 */
rune.timer.Timers.prototype.remove = function(timer) {
    var i = this.m_timers.indexOf(timer);
    if (i > -1) {
        this.m_timers[i].dispose();
        this.m_timers[i] = null;
        this.m_timers.splice(i, 1);
        
        return true;
    }
    
    return false;
};

/**
 * Deletes Timer objects that have been completed and restarts Timer objects 
 * that have not yet been completed.
 *
 * @returns {undefined}
 */
rune.timer.Timers.prototype.reset = function() {
    for (var i = 0; i < this.m_timers.length; i++) {
        if (this.m_timers[i].disposed) this.m_timers.splice(i, 1);
        else this.m_timers[i].restart();
    }
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Deletes all Timer objects.
 *
 * @returns {undefined}
 * @ignore
 */
rune.timer.Timers.prototype.dispose = function() {
    this.m_disposeTimers();
};

/**
 * Updates all Timer objects.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.timer.Timers.prototype.update = function(step) {
    this.m_updateTimers(step);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Updates all Timer objects.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @private
 */
rune.timer.Timers.prototype.m_updateTimers = function(step) {
    for (var i = 0; i < this.m_timers.length; i++) {
        if (this.m_timers[i].disposed) this.m_timers.splice(i, 1);
        else if (this.m_timers[i]['complete'] === false) this.m_updateTimer(i, step);
    }
};

/**
 * Updating a Timer object.
 *
 * @param {number} index Timer index.
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @private
 */
rune.timer.Timers.prototype.m_updateTimer = function(index, step) {
    if (this.m_timers[index].update(step)) {
        this.m_timers[index].dispose();
        this.m_timers[index] = null;
        this.m_timers.splice(index, 1);
    }
};

/**
 * Deletes all Timer objects.
 *
 * @return {undefined}
 * @private
 */
rune.timer.Timers.prototype.m_disposeTimers = function() {
    for (var i = 0; i < this.m_timers.length; i++) {
        this.m_timers[i].dispose();
        this.m_timers[i] = null;
        this.m_timers.splice(i, 1);
    }
    
    this.m_timers.length = 0;
    this.m_timers = null;
};