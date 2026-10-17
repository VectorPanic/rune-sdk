//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a typewriter for a bitmap text field.
 *
 * @constructor
 * @param {rune.text.BitmapField} field The target field, retained but not owned.
 * @class
 * @classdesc
 * Reveals text over time without changing its full layout. BitmapField creates,
 * updates and disposes its writer automatically. Character positions use UTF-16
 * code units, matching BitmapField; spaces and newlines consume time as well.
 */
rune.text.Typewriter = function(field) {
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Target text field.
     * @type {rune.text.BitmapField}
     * @private
     */
    this.m_field = field;

    /**
     * Whether text is currently being revealed.
     * @type {boolean}
     * @private
     */
    this.m_running = false;

    /**
     * Milliseconds between characters.
     * @type {number}
     * @private
     */
    this.m_interval = 40;

    /**
     * Accumulated time not yet consumed by a character.
     * @type {number}
     * @private
     */
    this.m_elapsed = 0;

    /**
     * Number of source characters revealed in the current run.
     * @type {number}
     * @private
     */
    this.m_index = 0;

    /**
     * Run identifier guarding against callback-driven restarts or cancellation.
     * @type {number}
     * @private
     */
    this.m_generation = 0;

    /**
     * Optional per-character callback.
     * @type {rune.util.Executable}
     * @private
     */
    this.m_onCharacter = null;

    /**
     * Optional completion callback.
     * @type {rune.util.Executable}
     * @private
     */
    this.m_onComplete = null;
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether the writer is revealing text.
 * @member {boolean} running
 * @memberof rune.text.Typewriter
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.Typewriter.prototype, "running", {
    /**
     * @this rune.text.Typewriter
     * @ignore
     */
    get : function() {
        return this.m_running;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Replaces the field text and starts revealing it after the first interval.
 * Empty text completes immediately. Callback registrations survive restarts.
 *
 * @param {string} text The full text to display.
 * @param {number} [interval=40] Positive milliseconds per character.
 * @return {undefined}
 * @suppress {accessControls}
 */
rune.text.Typewriter.prototype.start = function(text, interval) {
    if (this.m_field == null) return;
    this.stop();
    this.m_field.stopTextEffects();
    this.m_field['text'] = text;
    this.m_interval = (typeof interval === "number" && isFinite(interval) && interval > 0) ? interval : 40;
    this.m_index = 0;
    this.m_elapsed = 0;
    this.m_field['maxVisibleCharacters'] = 0;
    this.m_running = true;
    if (this.m_field['text'].length === 0) this.complete();
};

/**
 * Reveals all remaining text and invokes onComplete once if currently running.
 * Skipped characters do not trigger onCharacter callbacks.
 *
 * @return {undefined}
 */
rune.text.Typewriter.prototype.complete = function() {
    if (this.m_field == null) return;
    var running = this.m_running;
    this.stop();
    this.m_index = this.m_field['text'].length;
    this.m_field['maxVisibleCharacters'] = Infinity;
    if (running && this.m_onComplete != null) this.m_onComplete.execute(this.m_field);
};

/**
 * Stops revealing text, preserving the current visible characters. Does not
 * invoke onComplete. Assigning different field text stops and reveals it fully.
 *
 * @return {undefined}
 */
rune.text.Typewriter.prototype.stop = function() {
    this.m_generation++;
    this.m_running = false;
    this.m_elapsed = 0;
};

/**
 * Registers or clears the per-character callback. Receives the character,
 * its zero-based source index and the field, including spaces and newlines.
 *
 * @param {Function} func Callback, or null to remove it.
 * @param {Object} [scope] Callback execution scope.
 * @return {undefined}
 */
rune.text.Typewriter.prototype.onCharacter = function(func, scope) {
    if (this.m_onCharacter != null) this.m_onCharacter.dispose();
    this.m_onCharacter = func ? new rune.util.Executable(func, scope) : null;
};

/**
 * Registers or clears the completion callback. Receives the target field.
 *
 * @param {Function} func Callback, or null to remove it.
 * @param {Object} [scope] Callback execution scope.
 * @return {undefined}
 */
rune.text.Typewriter.prototype.onComplete = function(func, scope) {
    if (this.m_onComplete != null) this.m_onComplete.dispose();
    this.m_onComplete = func ? new rune.util.Executable(func, scope) : null;
};

/**
 * Stops the writer and releases callbacks and its field reference. The field is
 * not disposed, and its current visible text is retained.
 *
 * @return {undefined}
 */
rune.text.Typewriter.prototype.dispose = function() {
    this.stop();
    if (this.m_onCharacter != null) this.m_onCharacter.dispose();
    if (this.m_onComplete != null) this.m_onComplete.dispose();
    this.m_onCharacter = null;
    this.m_onComplete = null;
    this.m_field = null;
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Advances the writer, retaining fractional time and catching up after slow
 * frames. A callback may stop, restart, complete or dispose the writer safely.
 *
 * @param {number} step Elapsed milliseconds.
 * @return {undefined}
 * @package
 * @ignore
 */
rune.text.Typewriter.prototype.update = function(step) {
    if (!this.m_running || typeof step !== "number" || !isFinite(step) || step <= 0) return;
    this.m_elapsed += step;
    var generation = this.m_generation;
    while (this.m_running && this.m_elapsed >= this.m_interval) {
        this.m_elapsed -= this.m_interval;
        var index = this.m_index++;
        this.m_field['maxVisibleCharacters'] = this.m_index;
        if (this.m_onCharacter != null) {
            this.m_onCharacter.execute(this.m_field['text'].charAt(index), index, this.m_field);
        }
        if (generation !== this.m_generation) return;
        if (this.m_index >= this.m_field['text'].length) this.complete();
    }
};
