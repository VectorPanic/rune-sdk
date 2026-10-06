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
    this.m_cycles = this.m_parseCycles(options['cycles']);

    /**
     * The length of the animation, in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_duration = this.m_parseDuration(options['duration']);

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
    this.m_values = this.m_createTweenValues(options['args'] || {});
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
 * @member {number} progress
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
            if (this.m_duration == 0) return 1.0;
            
            var p = this.m_timeCycle / this.m_duration;
            return Math.round((((this.m_reversing) ? (1 - p) : p)) * 10) / 10;
        }
        
        return 1.0;
    }
});

/**
 * Object that is animated.
 *
 * @member {Object} target
 * @memberof rune.tween.Tween
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tween.Tween.prototype, "target", {
    /**
     * @this rune.tween.Tween
     * @ignore
     */
    get : function() {
        return this.m_target;
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
    if (this.m_running == true && this.m_values != null && this['complete'] == false) {
        step = this.m_parseStep(step);
        if (step == 0 && this.m_duration > 0) return this['complete'];

        if (this.m_duration == 0) {
            this.m_numCycles = this.m_cycles;
            this.m_timeCycle = this.m_duration;
        } else {
            this.m_updatePlayhead(step);
        }
        
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
    
    this.m_running = false;
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
    while (step > 0 && this['complete'] == false) {
        var distance = this.m_reversing ? this.m_timeCycle : this.m_duration - this.m_timeCycle;
        
        if (step >= distance) {
            step -= distance;
            this.m_timeCycle = this.m_reversing ? 0 : this.m_duration;
            this.m_reversing = !this.m_reversing;
            this.m_numCycles++;
        } else {
            this.m_timeCycle += this.m_reversing ? -step : step;
            step = 0;
        }
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
    this.m_timeCycle += step;

    if (this.m_timeCycle >= this.m_duration) {
        this.m_numCycles += Math.floor(this.m_timeCycle / this.m_duration);
        this.m_numCycles = Math.min(this.m_numCycles, this.m_cycles);
        
        if (this['complete']) this.m_timeCycle = this.m_duration;
        else this.m_timeCycle = this.m_timeCycle % this.m_duration;
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
        if (this.m_duration == 0) {
            this.m_target[this.m_values[i]['name']] = this.m_values[i]['end'];
        } else {
            this.m_target[this.m_values[i]['name']] = this.m_easing(
                this.m_timeCycle,
                this.m_values[i]['start'],
                this.m_values[i]['delta'],
                this.m_duration
            );
        }
    }
};

/**
 * Parses the number of animation cycles.
 *
 * @param {*} value Value to parse.
 *
 * @returns {number}
 * @private
 */
rune.tween.Tween.prototype.m_parseCycles = function(value) {
    if (typeof value === "number" && isFinite(value)) {
        return Math.max(Math.floor(value), 1);
    }

    return 1;
};

/**
 * Parses the animation duration.
 *
 * @param {*} value Value to parse.
 *
 * @returns {number}
 * @private
 */
rune.tween.Tween.prototype.m_parseDuration = function(value) {
    if (typeof value === "number" && isFinite(value)) {
        return Math.max(value, 0);
    }

    return 2500;
};

/**
 * Parses the update time step.
 *
 * @param {*} value Value to parse.
 *
 * @returns {number}
 * @private
 */
rune.tween.Tween.prototype.m_parseStep = function(value) {
    if (typeof value === "number" && isFinite(value)) {
        return Math.max(value, 0);
    }

    return 0;
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
    if (args != null && this.m_target != null) {
        for (var arg in args) {
            if (Object.prototype.hasOwnProperty.call(args, arg) && arg in this.m_target) {
                var value = new rune.tween.TweenValue(
                    arg,
                    this.m_target[arg],
                    args[arg]
                );
                
                values.push(value);
            }
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