//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates an optional echo for a sound channel.
 *
 * @constructor
 * @package
 * @param {AudioContext} context The channel's audio context.
 * @param {AudioNode} input Channel input, with a separate direct output path.
 * @param {AudioNode} output Channel volume node receiving the delayed signal.
 *
 * @class
 * @classdesc
 *
 * Adds delayed repetitions alongside the channel's unchanged original signal.
 * Audio nodes are created on first activation and reused until clear or dispose.
 * Enable, disable and parameter changes are smoothed over twenty milliseconds.
 * Disabling mutes the echo and its input; the delay buffer drains in the
 * background. Rapid reactivation can make a pending repetition audible again.
 */
rune.media.SoundEcho = function(context, input, output) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * The audio context owned by the channel.
     * @type {AudioContext}
     * @private
     */
    this.m_context = context;

    /**
     * Channel input tapped without changing the direct sound path.
     * @type {AudioNode}
     * @private
     */
    this.m_input = input;

    /**
     * Channel volume node shared by original and delayed sound.
     * @type {AudioNode}
     * @private
     */
    this.m_output = output;

    /**
     * Whether echo is enabled.
     * @type {boolean}
     * @private
     */
    this.m_enabled = false;

    /**
     * Time between repetitions, in seconds.
     * @type {number}
     * @private
     */
    this.m_delay = 0.2;

    /**
     * Amount returned from the delay output to its input.
     * @type {number}
     * @private
     */
    this.m_feedback = 0.3;

    /**
     * Echo output volume relative to the unchanged original signal.
     * @type {number}
     * @private
     */
    this.m_mix = 0.25;

    /**
     * Gain controlling the input to the delay.
     * @type {GainNode}
     * @private
     */
    this.m_send = null;

    /**
     * Delay buffer, allocated only when first enabled.
     * @type {DelayNode}
     * @private
     */
    this.m_delayNode = null;

    /**
     * Gain limiting repeated feedback to a decaying level.
     * @type {GainNode}
     * @private
     */
    this.m_feedbackGain = null;

    /**
     * Gain controlling the delayed signal's output volume.
     * @type {GainNode}
     * @private
     */
    this.m_wet = null;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether echo is enabled. Disabling fades the delayed signal out without
 * changing original playback, playback position or channel volume.
 *
 * @member {boolean} enabled
 * @memberof rune.media.SoundEcho
 * @instance
 * @default false
 * @throws {Error} If the controller is disposed.
 */
Object.defineProperty(rune.media.SoundEcho.prototype, "enabled", {
    /**
     * @this rune.media.SoundEcho
     * @ignore
     */
    get : function() {
        return this.m_enabled;
    },
    /**
     * @this rune.media.SoundEcho
     * @ignore
     */
    set : function(value) {
        if (this.m_context == null) throw new Error("SoundEcho is disposed.");
        value = Boolean(value);
        if (value === this.m_enabled) return;
        if (value && this.m_delayNode == null) this.m_constructNodes();
        this.m_enabled = value;
        this.m_updateGains();
    }
});

/**
 * Time between repetitions in seconds, clamped between 0.01 and 2.0.
 *
 * @member {number} delay
 * @memberof rune.media.SoundEcho
 * @instance
 * @default 0.2
 * @throws {RangeError} If the value is not a finite number.
 */
Object.defineProperty(rune.media.SoundEcho.prototype, "delay", {
    /**
     * @this rune.media.SoundEcho
     * @ignore
     */
    get : function() {
        return this.m_delay;
    },
    /**
     * @this rune.media.SoundEcho
     * @ignore
     */
    set : function(value) {
        this.m_delay = rune.util.Math.clamp(this.m_validateNumber(value), 0.01, 2.0);
        if (this.m_delayNode != null) this.m_ramp(this.m_delayNode.delayTime, this.m_delay);
    }
});

/**
 * Feedback strength, clamped between 0 and 0.95 so repetitions decay.
 * Zero produces a single delayed repetition.
 *
 * @member {number} feedback
 * @memberof rune.media.SoundEcho
 * @instance
 * @default 0.3
 * @throws {RangeError} If the value is not a finite number.
 */
Object.defineProperty(rune.media.SoundEcho.prototype, "feedback", {
    /**
     * @this rune.media.SoundEcho
     * @ignore
     */
    get : function() {
        return this.m_feedback;
    },
    /**
     * @this rune.media.SoundEcho
     * @ignore
     */
    set : function(value) {
        this.m_feedback = rune.util.Math.clamp(this.m_validateNumber(value), 0, 0.95);
        this.m_updateGains();
    }
});

/**
 * Delayed signal volume relative to the original signal, clamped to 0..1.
 * The original signal remains unchanged rather than being crossfaded away.
 *
 * @member {number} mix
 * @memberof rune.media.SoundEcho
 * @instance
 * @default 0.25
 * @throws {RangeError} If the value is not a finite number.
 */
Object.defineProperty(rune.media.SoundEcho.prototype, "mix", {
    /**
     * @this rune.media.SoundEcho
     * @ignore
     */
    get : function() {
        return this.m_mix;
    },
    /**
     * @this rune.media.SoundEcho
     * @ignore
     */
    set : function(value) {
        this.m_mix = rune.util.Math.clamp(this.m_validateNumber(value), 0, 1);
        this.m_updateGains();
    }
});

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Empties delayed audio when the owning channel is cleared. Configuration and
 * activation are retained, but the delay buffer and its connections are reset.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.media.SoundEcho.prototype.clear = function() {
    this.m_disposeNodes();
    if (this.m_enabled && this.m_context != null) {
        this.m_constructNodes();
        this.m_updateGains();
    }
};

/**
 * Disconnects echo nodes without closing the channel's shared audio context.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.media.SoundEcho.prototype.dispose = function() {
    this.m_disposeNodes();
    this.m_enabled = false;
    this.m_context = null;
    this.m_input = null;
    this.m_output = null;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates a parallel delay path and a feedback loop. The direct channel path
 * remains connected. Gains start silent so activation can be faded in.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundEcho.prototype.m_constructNodes = function() {
    var context = this.m_context;
    var input = this.m_input;
    var output = this.m_output;
    if (context == null || input == null || output == null) throw new Error("SoundEcho is disposed.");
    try {
        this.m_send = context.createGain();
        this.m_delayNode = context.createDelay(2.0);
        this.m_feedbackGain = context.createGain();
        this.m_wet = context.createGain();
        this.m_send.gain.value = 0;
        this.m_feedbackGain.gain.value = 0;
        this.m_wet.gain.value = 0;
        this.m_delayNode.delayTime.value = this.m_delay;
        this.m_send.connect(this.m_delayNode);
        this.m_delayNode.connect(this.m_feedbackGain);
        this.m_feedbackGain.connect(this.m_delayNode);
        this.m_delayNode.connect(this.m_wet);
        this.m_wet.connect(output);
        input.connect(this.m_send);
    } catch (error) {
        this.m_disposeNodes();
        throw error;
    }
};

/**
 * Applies enabled state and configured strength without rebuilding the graph.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundEcho.prototype.m_updateGains = function() {
    if (this.m_send == null) return;
    this.m_ramp(this.m_send.gain, this.m_enabled ? 1 : 0);
    this.m_ramp(this.m_feedbackGain.gain, this.m_enabled ? this.m_feedback : 0);
    this.m_ramp(this.m_wet.gain, this.m_enabled ? this.m_mix : 0);
};

/**
 * Smoothly changes an audio parameter, including during a previous transition.
 * Uses cancel-and-hold when available, with a fallback for older contexts.
 *
 * @param {AudioParam} parameter Parameter to adjust.
 * @param {number} value Target value.
 * @returns {undefined}
 * @private
 */
rune.media.SoundEcho.prototype.m_ramp = function(parameter, value) {
    var now = this.m_context.currentTime;
    if (typeof parameter['cancelAndHoldAtTime'] === "function") {
        parameter['cancelAndHoldAtTime'](now);
    } else {
        var current = parameter.value;
        parameter.cancelScheduledValues(now);
        parameter.setValueAtTime(current, now);
    }
    parameter.linearRampToValueAtTime(value, now + 0.02);
};

/**
 * Validates numeric configuration before applying limits.
 *
 * @param {number} value Value to validate.
 * @returns {number} The validated value.
 * @throws {RangeError} If the value is not a finite number.
 * @private
 */
rune.media.SoundEcho.prototype.m_validateNumber = function(value) {
    if (typeof value !== "number" || !isFinite(value)) throw new RangeError("Expected a finite number.");
    return value;
};

/**
 * Breaks the feedback loop and removes only echo connections. The channel's
 * direct connection to its volume node remains intact.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundEcho.prototype.m_disposeNodes = function() {
    if (this.m_send != null) {
        try {
            this.m_input.disconnect(this.m_send);
        } catch (error) {}
        this.m_send.disconnect();
        this.m_send = null;
    }
    if (this.m_feedbackGain != null) {
        this.m_feedbackGain.disconnect();
        this.m_feedbackGain = null;
    }
    if (this.m_delayNode != null) {
        this.m_delayNode.disconnect();
        this.m_delayNode = null;
    }
    if (this.m_wet != null) {
        this.m_wet.disconnect();
        this.m_wet = null;
    }
};
