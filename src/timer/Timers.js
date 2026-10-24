//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
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
    // PUBLIC PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Pauses all Timer objects that are registered with the Timers instance.
     *
     * @type {boolean}
     * @default false
     */
    this.paused = false;

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
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
// PUBLIC GETTER AND SETTER METHODS
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
// PUBLIC PROTOTYPE METHODS (API)
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
    while (this.m_timers.length > 0) {
        this.remove(this.m_timers[0]);
    }
};

/**
 * Creates and registers a new Timer object according to the specified 
 * options object. The supplied options are not modified.
 *
 * @param {Object} options Timer options.
 * @param {boolean} [autoStart=true] If the Timer object is to be started automatically.
 *
 * @returns {rune.timer.Timer} The new Timer object.
 */
rune.timer.Timers.prototype.create = function(options, autoStart) {
    var settings = new rune.timer.TimerOptions(options);
    settings.scope = settings.scope || this.m_scope;

    var timer = new rune.timer.Timer(settings);

    return this.add(timer, autoStart);
};

/**
 * Creates and starts a timer that invokes the callback once on completion.
 * Uses the same duration handling as create(). The callback receives the timer
 * and runs in the manager's scope unless another scope is supplied.
 *
 * @param {number} delay Delay in milliseconds.
 * @param {Function} callback Function to invoke when the timer completes.
 * @param {Object} [scope] Callback scope; defaults to the manager's scope.
 *
 * @returns {rune.timer.Timer} The new timer, which can be paused or removed.
 */
rune.timer.Timers.prototype.once = function(delay, callback, scope) {
    return this.create({
        duration: delay,
        repeat: 0,
        onComplete: callback,
        scope: scope
    });
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
        if (this.m_timers[i].disposed) {
            this.m_timers.splice(i, 1);
            i--;
        }
        else this.m_timers[i].restart();
    }
};

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE METHODS (ENGINE)
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
// PRIVATE PROTOTYPE METHODS
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
    if (this.paused == true) {
        return;
    }
    
    // CALLBACKS MAY REMOVE TIMERS OR DISPOSE THE MANAGER. NEW TIMERS WAIT
    // UNTIL THE NEXT UPDATE, AND EACH REMAINING TIMER IS UPDATED ONCE.
    var timers = this.m_timers.slice();
    for (var i = 0; i < timers.length; i++) {
        var timer = timers[i];
        if (this.m_timers == null) return;
        if (this.m_timers.indexOf(timer) < 0) continue;
        if (timer.disposed || timer['complete'] === true) {
            this.remove(timer);
        } else {
            this.m_updateTimer(timer, step);
        }
    }
};

/**
 * Updating a Timer object.
 *
 * @param {rune.timer.Timer} timer Timer to update.
 * @param {number} step Current time step.
 *
 * @return {boolean}
 * @private
 */
rune.timer.Timers.prototype.m_updateTimer = function(timer, step) {
    if (timer.update(step) && this.m_timers != null && this.m_timers.indexOf(timer) >= 0) {
        return this.remove(timer);
    }

    return false;
};

/**
 * Deletes all Timer objects.
 *
 * @return {undefined}
 * @private
 */
rune.timer.Timers.prototype.m_disposeTimers = function() {
    while (this.m_timers.length > 0) {
        this.remove(this.m_timers[0]);
    }
    
    this.m_timers = null;
};
