//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Reveals the original text through temporary random glyphs.
 *
 * @constructor
 * @param {rune.text.BitmapField} field Target field, retained but not owned.
 * @class
 * @classdesc
 * Reveals the original text through temporary random glyphs. BitmapField manages its lifecycle automatically.
 */
rune.text.TextScramble = function(field) {
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
     * Whether the effect is running.
     * @type {boolean}
     * @private
     */
    this.m_running = false;

    /**
     * Effect duration in milliseconds.
     * @type {number}
     * @private
     */
    this.m_duration = 800;

    /**
     * Elapsed effect time in milliseconds.
     * @type {number}
     * @private
     */
    this.m_elapsed = 0;

    /**
     * Time since the last random pattern in milliseconds.
     * @type {number}
     * @private
     */
    this.m_refresh = 0;

    /**
     * Requested random glyph alphabet.
     * @type {string}
     * @private
     */
    this.m_characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    /**
     * Alphabet filtered to glyphs supported by the current font.
     * @type {string}
     * @private
     */
    this.m_choices = "";

    /**
     * Temporary glyphs indexed by source-text position.
     * @type {string}
     * @private
     */
    this.m_display = "";
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether the text is currently scrambled.
 * @member {boolean} running
 * @memberof rune.text.TextScramble
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.TextScramble.prototype, "running", {
    /**
     * @this rune.text.TextScramble
     * @ignore
     */
    get : function() {
        return this.m_running;
    }
});

/**
 * Random glyph alphabet. Unsupported glyphs and whitespace are ignored.
 * An empty supported alphabet renders the original text. Applied on next start.
 * @member {string} characters
 * @memberof rune.text.TextScramble
 * @instance
 */
Object.defineProperty(rune.text.TextScramble.prototype, "characters", {
    /**
     * @this rune.text.TextScramble
     * @ignore
     */
    get : function() {
        return this.m_characters;
    },
    /**
     * @this rune.text.TextScramble
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        if (typeof value === "string") this.m_characters = value;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Starts or restarts the effect, stopping other text animations on the field.
 * Original text, wrapping and alignment remain unchanged while glyphs vary.
 * Whitespace is preserved. Empty text and zero duration complete immediately.
 *
 * @param {string} text The final text.
 * @param {number} [duration=800] Duration in milliseconds, clamped to zero.
 * @return {undefined}
 * @suppress {accessControls}
 */
rune.text.TextScramble.prototype.start = function(text, duration) {
    if (this.m_field == null) return;
    this.m_field.stopTextEffects();
    this.m_field['text'] = text;
    this.m_field['maxVisibleCharacters'] = Infinity;
    this.m_duration = (typeof duration === "number" && isFinite(duration)) ? Math.max(0, duration) : 800;
    this.m_elapsed = 0;
    this.m_refresh = 0;
    this.m_choices = "";
    for (var i = 0; i < this.m_characters.length; i++) {
        var char = this.m_characters.charAt(i);
        if (!/\s/.test(char) && this.m_field['format'].getCharRect(char.charCodeAt(0)) != null) {
            this.m_choices += char;
        }
    }
    this.m_running = true;
    if (this.m_duration === 0 || this.m_field['text'].length === 0) this.complete();
    else this.m_updateDisplay();
};

/**
 * Restores the original text and invokes onComplete once if running.
 * @return {undefined}
 */
rune.text.TextScramble.prototype.complete = function() {
    var running = this.m_running;
    this.stop();
    if (running && this.m_onComplete != null) this.m_onComplete.execute(this.m_field);
};

/**
 * Cancels scrambling and restores the original glyphs without a callback.
 * @return {undefined}
 * @suppress {accessControls}
 */
rune.text.TextScramble.prototype.stop = function() {
    var running = this.m_running;
    this.m_running = false;
    this.m_display = "";
    if (running && this.m_field != null) this.m_field.breakCache();
};

/**
 * Registers or clears a completion callback receiving the field.
 * @param {Function} func Callback, or null to clear it.
 * @param {Object} [scope] Callback execution scope.
 * @return {undefined}
 */
rune.text.TextScramble.prototype.onComplete = function(func, scope) {
    if (this.m_onComplete != null) this.m_onComplete.dispose();
    this.m_onComplete = func ? new rune.util.Executable(func, scope) : null;
};

/**
 * Releases the effect and its callback. The field is not disposed.
 * @return {undefined}
 */
rune.text.TextScramble.prototype.dispose = function() {
    this.stop();
    if (this.m_onComplete != null) this.m_onComplete.dispose();
    this.m_onComplete = null;
    this.m_field = null;
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Advances time and refreshes random glyphs at most every 40 milliseconds.
 * @param {number} step Elapsed milliseconds.
 * @return {undefined}
 * @package
 * @ignore
 */
rune.text.TextScramble.prototype.update = function(step) {
    if (!this.m_running || typeof step !== "number" || !isFinite(step) || step <= 0) return;
    this.m_elapsed += step;
    this.m_refresh += step;
    if (this.m_elapsed >= this.m_duration) this.complete();
    else if (this.m_refresh >= 40) {
        this.m_refresh %= 40;
        this.m_updateDisplay();
    }
};

/**
 * Returns a temporary glyph at a source position, or the original glyph.
 * @param {number} index Position in the full source text.
 * @param {number} original Original glyph code.
 * @return {number} Glyph code to render.
 * @package
 * @ignore
 */
rune.text.TextScramble.prototype.getCharCode = function(index, original) {
    return this.m_running && index < this.m_display.length ? this.m_display.charCodeAt(index) : original;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Generates a temporary string, progressively locking a prefix to the original.
 * Does not assign field.text, so the full layout and source positions stay fixed.
 * @return {undefined}
 * @private
 * @suppress {accessControls}
 */
rune.text.TextScramble.prototype.m_updateDisplay = function() {
    var text = this.m_field['text'];
    var locked = Math.floor(text.length * this.m_elapsed / this.m_duration);
    this.m_display = "";
    for (var i = 0; i < text.length; i++) {
        var char = text.charAt(i);
        if (i >= locked && !/\s/.test(char) && this.m_choices.length > 0) {
            char = this.m_choices.charAt(Math.floor(Math.random() * this.m_choices.length));
        }
        this.m_display += char;
    }
    this.m_field.breakCache();
};
