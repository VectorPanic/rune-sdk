//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of Tween.
 * 
 * @constructor
 *
 * @param {Object} options Tween object settings.
 *
 * @class
 * @classdesc
 * 
 * The Tween class represents a linear interpolation between a beginning and 
 * ending value.
 */
rune.tween.Tween = function(options) {
    
    //--------------------------------------------------------------------------
    // Default arguments
    //--------------------------------------------------------------------------
    
    /**
     * @ignore
     */
    options = options || {};
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Sets the behavior of a repeating animation.
     *
     * @type {string}
     * @private
     */
    this.m_behavior = options.behavior || rune.tween.Tween.LOOP;
    
    /**
     * The number of times that this animation repeats.
     *
     * @type {number}
     * @private
     */
    this.m_cycles = Math.max(options['cycles'], 1) || 1;
    
    /**
     * The length of the animation, in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_duration = options.duration || 2500;
    
    /**
     * The easing behavior for this effect
     *
     * @type {Function}
     * @private
     */
    this.m_easing = options.easing || rune.tween.Sine.easeInOut;
    
    /**
     * The number of times the animation has been repeated.
     *
     * @type {number}
     * @private
     */
    this.m_numCycles = 0;
    
    /**
     * Callback method.
     *
     * @type {Function}
     * @private
     */
    this.m_onDispose = options.onDispose || null;
    
    /**
     * Callback method.
     *
     * @type {Function}
     * @private
     */
    this.m_onInit = options.onInit || null;
    
    /**
     * Callback method.
     *
     * @type {Function}
     * @private
     */
    this.m_onUpdate = options.onUpdate || null;
    
    /**
     * If the animation plays backwards.
     *
     * @type {boolean}
     * @private
     */
    this.m_reversing = false;
    
    /**
     * If the animation is currently playing.
     *
     * @type {boolean}
     * @private
     */
    this.m_running = true;
    
    /**
     * Scope for callback methods.
     *
     * @type {Object}
     * @private
     */
    this.m_scope = options.scope || this;
    
    /**
     * Elapsed time for current cycle.
     *
     * @type {number}
     * @private
     */
    this.m_timeCycle = 0;
    
    /**
     * Object to animate.
     *
     * @type {Object}
     * @private
     */
    this.m_target = options.target || null;
    
    /**
     * Values to animate.
     * 
     * @type {Object}
     * @private
     */
    this.m_values = this.m_createTweenValues(options['args']);
};

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Specifies that a repeating animation should progress in a forward direction 
 * on every iteration.
 *
 * @type {string}
 */
rune.tween.Tween.LOOP = "loop";

/**
 * Specifies that a repeating animation should reverse direction on every 
 * iteration. For example, a reversing animation would play forward on the 
 * even iterations and in reverse on the odd iterations.
 *
 * @type {string}
 */
rune.tween.Tween.REVERSE = "reverse";

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * If the animation is completed, ie completed the number of requested cycles. 
 * Completed animations are automatically removed by the handler.
 *
 * @member {boolean} complete
 * @memberof rune.tween.Tween
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tween.Tween.prototype, "complete", {
    /**
     * @this rune.tween.Tween
     * @ignore
     */
    get : function() {
        return (this.m_numCycles >= this.m_cycles);
    }
});

/**
 * The progression of the current cycle.
 *
 * @member {boolean} complete
 * @memberof rune.tween.Tween
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tween.Tween.prototype, "progress", {
    /**
     * @this rune.tween.Tween
     * @ignore
     */
    get : function() {
        if (this['complete'] == false) {
            var p = this.m_timeCycle / this.m_duration;
            return Math.round((((this.m_reversing) ? (1 - p) : p)) * 10) / 10;
        }
        
        return 1.0;
    }
});

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Called by the manager when the animation is initiated.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.tween.Tween.prototype.init = function() {
    this.m_exec("m_onInit", false);
};

/**
 * Called by the manager when the animation is updated.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.tween.Tween.prototype.update = function(step) {
    if (this.m_running == true && this['complete'] == false) {
        this.m_updatePlayhead(step);
        this.m_updateValues(step);
        this.m_exec("m_onUpdate", false);
    }
    
    return this['complete'];
};

/**
 * Called by the manager when the animation is completed. The call is made 
 * before the animation is removed from the handler.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.tween.Tween.prototype.dispose = function() {
    this.m_exec("m_onDispose", true);
    
    this.m_values = null;
    this.m_target = null;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Calculates the position of playback.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.tween.Tween.prototype.m_updatePlayhead = function(step) {
    if (this.m_reversing == true) this.m_timeCycle -= step;
    else this.m_timeCycle += step;
    
    this.m_timeCycle = rune.util.Math.clamp(this.m_timeCycle, 0, this.m_duration);
    
    switch(this.m_behavior) {
        case rune.tween.Tween.REVERSE:
            this.m_updatePlayheadReverse(step);
            break;
        
        default:
            this.m_updatePlayheadLoop(step);
            break;
    }
};

/**
 * Calculates the position of reversed playback.
 * 
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.tween.Tween.prototype.m_updatePlayheadReverse = function(step) {
    if ((this.m_reversing == false) && (this.m_timeCycle >= this.m_duration)) {
        this.m_timeCycle = this.m_duration;
        this.m_reversing = !this.m_reversing;
        this.m_numCycles++;
    }
    
    if ((this.m_reversing == true) && (this.m_timeCycle <= 0)) {
        this.m_timeCycle = 0;
        this.m_reversing = !this.m_reversing;
        this.m_numCycles++;
    }
};

/**
 * Calculates the looped playback position.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.tween.Tween.prototype.m_updatePlayheadLoop = function(step) {
    if (this.m_timeCycle >= this.m_duration) {
        this.m_numCycles++;
        
        if (this['complete']) this.m_timeCycle = this.m_duration;
        else this.m_timeCycle = 0;      
    }
};

/**
 * Updates the properties to be interpolated / animated.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.tween.Tween.prototype.m_updateValues = function(step) {
    for (var i = 0; i < this.m_values.length; i++) {
        this.m_target[this.m_values[i]['name']] = this.m_easing(
            this.m_timeCycle,
            this.m_values[i]['start'],
            this.m_values[i]['delta'],
            this.m_duration
        );
    }
};

/**
 * Creates a TweenValue object for each argument to be interpolated.
 *
 * @param {Object} args Objects containing properties to interpolate.
 *
 * @returns {Array.<rune.tween.TweenValue>}
 * @private
 */
rune.tween.Tween.prototype.m_createTweenValues = function(args) {
    var values = [];
    for (var arg in args) {
        if (arg in this.m_target) {
            var value = new rune.tween.TweenValue(
                arg,
                this.m_target[arg],
                args[arg]
            );
            
            values.push(value);
        }
    }
    
    return values;
};

/**
 * Execute requested callback method.
 *
 * @param {string} name Name of callback.
 * @param {boolean} complete If the animation must be completed before the callback method can be called.
 *
 * @returns {undefined}
 * @private
 */
rune.tween.Tween.prototype.m_exec = function(name, complete) {
    if (this['complete'] == complete) {
        if (typeof this[name] === "function") {
            this[name].call(
                this.m_scope, 
                this.m_target, 
                this
            );
        }
    }
};