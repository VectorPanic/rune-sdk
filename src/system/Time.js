//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Time class.
 *
 * @constructor
 *
 * @param {number} [framerate=60] Target framerate.
 * 
 * @class
 * @classdesc
 * 
 * The Time class is used to calculate the elapsed time within an application. 
 * Calculated time is used to run the application's update and rendering loop.
 */
rune.system.Time = function(framerate) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Buffer for elapsed time between fixed time steps.
     *
     * @type {number}
     * @private
     */
    this.m_buffer = 0;
    
    /**
     * Timestamp for the current point in time, ie the current frame.
     *
     * @type {number}
     * @private
     */
    this.m_currentTime = 0;
    
    /**
     * Current frame rate, ie an indication of whether the application is 
     * executed at the requested frame rate. If the application is executed 
     * correctly, the current frame rate should be the same as the requested 
     * frame rate.
     *
     * @type {number}
     * @private
     */
    this.m_currentFramerate = 0;
    
    /**
     * Timestamp from previous frame (tick).
     *
     * @type {number}
     * @private
     */
    this.m_previousTime = 0;
    
    /**
     * Represents the rendering stack, ie a list of methods that aim to draw 
     * the application's graphics to the screen for each active frame.
     *
     * @type {rune.util.Stack}
     * @private
     */
    this.m_render = new rune.util.Stack();
    
    /**
     * Describes the theoretical length of a frame in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_step = 1000 / (framerate || 60);
    
    /**
     * List of timestamps.
     *
     * @type {Array}
     * @private
     */
    this.m_ticks = [];
    
    /**
     * Request ID from latest requestAnimationFrame call.
     *
     * @type {number}
     * @private
     */
    this.m_timeLoopID = 0;
    
    /**
     * Represents the update stack, ie a list of methods that aim to perform 
     * the necessary calculations for each frame. This stack is always executed 
     * before the rendering stack.
     *
     * @type {rune.util.Stack}
     * @private
     */
    this.m_update = new rune.util.Stack();
}

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Current frame rate, ie an indication of whether the application is 
 * executed at the requested frame rate. If the application is executed 
 * correctly, the current frame rate should be the same as the requested 
 * frame rate.
 *
 * @member {number} currentFramerate
 * @memberof rune.system.Time
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Time.prototype, "currentFramerate", {
    /**
     * @this rune.system.Time
     * @ignore
     */
    get: function() {
        return rune.util.Math.clamp(this.m_currentFramerate, 0, this['targetFramerate']);
    },
});

/**
 * Current frame rate divided by target frame rate.
 *
 * @member {number} quotient
 * @memberof rune.system.Time
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Time.prototype, "quotient", {
    /**
     * @this rune.system.Time
     * @ignore
     */
    get: function() {
        return this['currentFramerate'] / this['targetFramerate'];
    },
});

/**
 * Represents the rendering stack, ie a list of methods that aim to draw 
 * the application's graphics to the screen for each active frame.
 *
 * @member {rune.util.Stack} render
 * @memberof rune.system.Time
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Time.prototype, "render", {
    /**
     * @this rune.system.Time
     * @ignore
     */
    get: function() {
        return this.m_render;
    }
});

/**
 * Time scale relative to the system's maximum capacity. An application can 
 * calculate up to 60 ticks per second, this corresponds to scale 1.0. If an 
 * application is executed at 30 ticks per second, the time scale is 2.0. This 
 * information is important if you want to create an application that is 
 * executed at the same speed regardless of the application's frame rate.
 *
 * @member {number} scale
 * @memberof rune.system.Time
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Time.prototype, "scale", {
    /**
     * @this rune.system.Time
     * @ignore
     */
    get: function() {
        return this.m_step / ((1 / 60) * 1000);
    }
});

/**
 * Describes the theoretical length of a frame in milliseconds.
 *
 * @member {number} step
 * @memberof rune.system.Time
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Time.prototype, "step", {
    /**
     * @this rune.system.Time
     * @ignore
     */
    get: function() {
        return this.m_step;
    }
});

/**
 * Target framerate.
 *
 * @member {number} framerate
 * @memberof rune.system.Time
 * @instance
 */
Object.defineProperty(rune.system.Time.prototype, "targetFramerate", {
    /**
     * @this rune.system.Time
     * @ignore
     */
    get: function() {
        return Math.ceil(1000 / this.m_step);
    },

    /**
     * @this rune.system.Time
     * @ignore
     */
    set: function(value) {
        this.m_step = 1000 / value;
    }
});

/**
 * Represents the update stack, ie a list of methods that aim to perform 
 * the necessary calculations for each frame. This stack is always executed 
 * before the rendering stack.
 *
 * @member {rune.util.Stack} update
 * @memberof rune.system.Time
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Time.prototype, "update", {
    /**
     * @this rune.system.Time
     * @ignore
     */
    get: function() {
        return this.m_update;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Resets the update and rendering loop.
 *
 * @return {undefined}
 */
rune.system.Time.prototype.reset = function() {
    this.m_currentTime  = window.performance.now();
    this.m_previousTime = this.m_currentTime - this.m_step;
};

/**
 * Starts the update and rendering loop.
 *
 * @return {undefined}
 */
rune.system.Time.prototype.start = function() {
    this.m_initTimeLoop();
};

/**
 * Stops the update and rendering loop.
 *
 * @param {boolean} [clear=false] Whether the update and render stacks should be emptied or not.
 *
 * @return {undefined}
 */
rune.system.Time.prototype.stop = function(clear) {
    this.m_disposeTimeLoop();
    if (clear === true) {
        this.m_update.clear();
        this.m_render.clear();
    }
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Stops and deletes all memory allocations associated with the object.
 *
 * @returns {undefined}
 * @ignore
 */
rune.system.Time.prototype.dispose = function() {
    this.stop(true);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Starts the loop that represents time.
 *
 * @throws {Error} If the runtime environment does not support requestAnimationFrame.
 *
 * @return {undefined}
 * @private
 */
rune.system.Time.prototype.m_initTimeLoop = function() {
    if (window.requestAnimationFrame !== undefined) {
        this.m_tick = this.m_tick.bind(this);
        this.m_timeLoopID = window.requestAnimationFrame(this.m_tick);
    } else throw new Error();
};

/**
 * Calculates tick.
 *
 * @return {undefined}
 * @private
 */
rune.system.Time.prototype.m_tick = function() {
    this.m_previousTime = this.m_currentTime;
    this.m_currentTime  = window.performance.now();

    this.m_buffer += this.m_currentTime - this.m_previousTime;

    if (this.m_buffer > this.m_step) {
        
        while(this.m_ticks.length > 0 && this.m_ticks[0] <= this.m_currentTime - 1000) {
            this.m_ticks.shift();
        }
        
        this.m_ticks.push(this.m_currentTime);
        this.m_currentFramerate = this.m_ticks.length;
        
        while (this.m_buffer > this.m_step) {
            this.m_buffer -= this.m_step;
            this.m_execUpdateStack();
        }
        
        this.m_execRenderStack();
    }
    
    this.m_requestID = window.requestAnimationFrame(this.m_tick);
};

/**
 * Executes the contents of the update stack.
 *
 * @throws {Error} On missing stack.
 *
 * @return {undefined}
 * @private
 */
rune.system.Time.prototype.m_execUpdateStack = function() {
    if (this.m_update != null) {
        this.m_update.execute(this['step']);
    } else throw new Error();
};

/**
 * Executes the contents of the render stack.
 *
 * @throws {Error} On missing stack.
 *
 * @return {undefined}
 * @private
 */
rune.system.Time.prototype.m_execRenderStack = function() {
    if (this.m_render != null) {
        this.m_render.execute();
    } else throw new Error();
};

/**
 * Stops the loop that represents time.
 *
 * @throws {Error} If the runtime environment does not support requestAnimationFrame.
 *
 * @return {undefined}
 * @private
 */
rune.system.Time.prototype.m_disposeTimeLoop = function() {
    if (window.cancelAnimationFrame !== undefined) {
        window.cancelAnimationFrame(this.m_timeLoopID);
        this.m_timeLoopID = 0;
    } else throw new Error();
};