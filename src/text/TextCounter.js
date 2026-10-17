//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Animates a numeric value and formats it as bitmap text.
 *
 * @constructor
 *
 * @param {rune.text.BitmapField} field Target field, retained but not owned.
 *
 * @class
 * @classdesc
 *
 * Animates a numeric value and formats it as bitmap text. BitmapField manages 
 * its lifecycle automatically.
 */
rune.text.TextCounter = function(field) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Target field, not owned by the effect.
     * @type {rune.text.BitmapField}
     * @private
     */
    this.m_field = field;

    /**
     * Optional completion callback.
     * @type {rune.util.Executable}
     * @private
     */
    this.m_onComplete = null;

    /**
     * Numeric state used as the tween target.
     * @type {{value: number}}
     * @private
     */
    this.m_state = {value: 0};
    var initial = Number(field['text']);
    if (isFinite(initial)) this.m_state.value = initial;

    /**
     * Final value for the current animation.
     * @type {number}
     * @private
     */
    this.m_target = 0;

    /**
     * Current SDK tween, or null while idle.
     * @type {rune.tween.Tween}
     * @private
     */
    this.m_tween = null;

    /**
     * Optional formatter receiving the raw numeric value.
     * @type {Function}
     * @private
     */
    this.m_formatter = null;

    /**
     * Formatter execution scope.
     * @type {Object}
     * @private
     */
    this.m_scope = null;

    /**
     * Identifier guarding against formatter-driven restarts.
     * @type {number}
     * @private
     */
    this.m_generation = 0;
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether the value is being animated.
 * @member {boolean} running
 * @memberof rune.text.TextCounter
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.TextCounter.prototype, "running", {
    /**
     * @this rune.text.TextCounter
     * @ignore
     */
    get : function() {
        return this.m_tween != null;
    }
});

/**
 * Current raw numeric value. Assigning a finite number stops animation and
 * displays it immediately. The default formatter rounds to the nearest integer.
 * @member {number} value
 * @memberof rune.text.TextCounter
 * @instance
 */
Object.defineProperty(rune.text.TextCounter.prototype, "value", {
    /**
     * @this rune.text.TextCounter
     * @ignore
     */
    get : function() {
        return this.m_state.value;
    },
    /**
     * @this rune.text.TextCounter
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        if (typeof value !== "number" || !isFinite(value) || this.m_field == null) return;
        this.stop();
        this.m_field.stopTextEffects();
        this.m_field['maxVisibleCharacters'] = Infinity;
        this.m_state.value = value;
        this.m_target = value;
        this.m_renderValue();
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Animates from the current value to a finite target using an SDK linear tween.
 * Stops other text animations. Zero duration and an unchanged target complete
 * immediately. Retargeting starts at the current raw value, without a jump.
 *
 * @param {number} value The target numeric value.
 * @param {number} [duration=600] Duration in milliseconds, clamped to zero.
 * @return {undefined}
 * @suppress {accessControls}
 */
rune.text.TextCounter.prototype.to = function(value, duration) {
    if (this.m_field == null || typeof value !== "number" || !isFinite(value)) return;
    this.stop();
    this.m_field.stopTextEffects();
    this.m_field['maxVisibleCharacters'] = Infinity;
    this.m_target = value;
    duration = (typeof duration === "number" && isFinite(duration)) ? Math.max(0, duration) : 600;
    this.m_tween = new rune.tween.Tween({
        target: this.m_state,
        duration: duration,
        transition: rune.tween.Linear.easeIn,
        args: {value: value}
    });
    this.m_tween.init();
    if (duration === 0 || this.m_state.value === value) this.complete();
    else this.m_renderValue();
};

/**
 * Jumps to the target and invokes onComplete once if running.
 * @return {undefined}
 */
rune.text.TextCounter.prototype.complete = function() {
    if (this.m_field == null) return;
    var running = this.m_tween != null;
    this.stop();
    this.m_state.value = this.m_target;
    var generation = this.m_generation;
    this.m_renderValue();
    if (running && generation === this.m_generation && this.m_onComplete != null) {
        this.m_onComplete.execute(this.m_field);
    }
};

/**
 * Stops at the current value without invoking onComplete.
 * @return {undefined}
 * @suppress {accessControls}
 */
rune.text.TextCounter.prototype.stop = function() {
    this.m_generation++;
    if (this.m_tween != null) this.m_tween.dispose();
    this.m_tween = null;
};

/**
 * Sets a formatter receiving the raw numeric value and returning display text.
 * Passing null restores integer formatting. Refreshes the field immediately.
 * @param {Function} func Formatter, or null for rounded integer text.
 * @param {Object} [scope] Formatter execution scope.
 * @return {undefined}
 */
rune.text.TextCounter.prototype.setFormatter = function(func, scope) {
    this.m_formatter = typeof func === "function" ? func : null;
    this.m_scope = scope || null;
    this.m_renderValue();
};

/**
 * Registers or clears a completion callback receiving the field.
 * @param {Function} func Callback, or null to clear it.
 * @param {Object} [scope] Callback execution scope.
 * @return {undefined}
 */
rune.text.TextCounter.prototype.onComplete = function(func, scope) {
    if (this.m_onComplete != null) this.m_onComplete.dispose();
    this.m_onComplete = func ? new rune.util.Executable(func, scope) : null;
};

/**
 * Releases the tween, callback and formatter without disposing the field.
 * @return {undefined}
 */
rune.text.TextCounter.prototype.dispose = function() {
    this.stop();
    if (this.m_onComplete != null) this.m_onComplete.dispose();
    this.m_onComplete = null;
    this.m_formatter = null;
    this.m_scope = null;
    this.m_field = null;
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Advances the SDK tween and updates text only when its formatted value changes.
 * @param {number} step Elapsed milliseconds.
 * @return {undefined}
 * @package
 * @ignore
 * @suppress {accessControls}
 */
rune.text.TextCounter.prototype.update = function(step) {
    if (this.m_tween == null || typeof step !== "number" || !isFinite(step) || step <= 0) return;
    var tween = this.m_tween;
    tween.update(step);
    if (tween['complete']) this.complete();
    else this.m_renderValue();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Formats and assigns the current value without cancelling this animation.
 * Formatter callbacks may stop, restart or dispose this effect safely.
 * @return {undefined}
 * @private
 * @suppress {accessControls}
 */
rune.text.TextCounter.prototype.m_renderValue = function() {
    if (this.m_field == null) return;
    var generation = this.m_generation;
    var text = this.m_formatter != null ? this.m_formatter.call(this.m_scope, this.m_state.value) : String(Math.round(this.m_state.value));
    if (generation === this.m_generation && this.m_field != null) this.m_field.setTextFromEffect(text, this);
};
