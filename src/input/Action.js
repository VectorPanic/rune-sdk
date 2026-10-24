//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates a named digital action. Usually created through Actions.bindKey()
 * or Actions.bindButton(). Names and keys are matched without regard to case.
 *
 * @constructor
 * @param {string} name Action name, such as "JUMP".
 * @throws {TypeError} If the name is not a non-empty string.
 *
 * @class
 * @classdesc
 * Combines keyboard keys and gamepad buttons into a single held state. Press
 * and release edges belong to the combined action, not individual bindings.
 */
rune.input.Action = function(name) {
    if (typeof name !== "string" || name.trim().length === 0) {
        throw new TypeError("Action: Expected a non-empty name.");
    }

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Normalized action name.
     *
     * @type {string}
     * @private
     */
    this.m_name = name.toUpperCase();

    /**
     * Keyboard bindings.
     *
     * @type {Array.<string>}
     * @private
     */
    this.m_keys = [];

    /**
     * Gamepad button bindings.
     *
     * @type {Array.<number>}
     * @private
     */
    this.m_buttons = [];

    /**
     * Combined state from the current update.
     *
     * @type {boolean}
     * @private
     */
    this.m_current = false;

    /**
     * Combined state from the previous update.
     *
     * @type {boolean}
     * @private
     */
    this.m_previous = false;
};

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE GETTER AND SETTER METHODS
//------------------------------------------------------------------------------

/**
 * The normalized action name.
 *
 * @member {string} name
 * @memberof rune.input.Action
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Action.prototype, "name", {
    /**
     * @this rune.input.Action
     * @ignore
     */
    get : function() {
        return this.m_name;
    }
});

/**
 * Whether any binding is held in the current update.
 *
 * @member {boolean} pressed
 * @memberof rune.input.Action
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Action.prototype, "pressed", {
    /**
     * @this rune.input.Action
     * @ignore
     */
    get : function() {
        return this.m_current;
    }
});

/**
 * Whether the action became held in the current update.
 *
 * @member {boolean} justPressed
 * @memberof rune.input.Action
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Action.prototype, "justPressed", {
    /**
     * @this rune.input.Action
     * @ignore
     */
    get : function() {
        return this.m_current && !this.m_previous;
    }
});

/**
 * Whether the last held binding was released in the current update.
 *
 * @member {boolean} justReleased
 * @memberof rune.input.Action
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Action.prototype, "justReleased", {
    /**
     * @this rune.input.Action
     * @ignore
     */
    get : function() {
        return !this.m_current && this.m_previous;
    }
});

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Adds a keyboard binding, ignoring duplicates. Unknown key names read as released.
 *
 * @param {string} key Keyboard key name, such as "SPACE".
 * @returns {rune.input.Action} This action.
 * @throws {TypeError} If the key is not a non-empty string.
 * @throws {Error} If the action is disposed.
 */
rune.input.Action.prototype.bindKey = function(key) {
    if (this.m_keys == null) {
        throw new Error("Action: Cannot bind a disposed action.");
    }

    if (typeof key !== "string" || key.trim().length === 0) {
        throw new TypeError("Action: Expected a non-empty key name.");
    }

    key = key.toUpperCase();
    if (this.m_keys.indexOf(key) === -1) {
        this.m_keys.push(key);
    }

    return this;
};

/**
 * Adds a gamepad button binding, ignoring duplicates.
 *
 * @param {number} button Non-negative integer button ID.
 * @returns {rune.input.Action} This action.
 * @throws {RangeError} If the button ID is not a non-negative finite integer.
 * @throws {Error} If the action is disposed.
 */
rune.input.Action.prototype.bindButton = function(button) {
    if (this.m_buttons == null) {
        throw new Error("Action: Cannot bind a disposed action.");
    }

    if (typeof button !== "number" || !isFinite(button) || button < 0 || Math.floor(button) !== button) {
        throw new RangeError("Action: Expected a non-negative integer button ID.");
    }

    if (this.m_buttons.indexOf(button) === -1) {
        this.m_buttons.push(button);
    }

    return this;
};

/**
 * Removes a keyboard binding. State changes are sampled on the next update.
 *
 * @param {string} key Key name.
 * @returns {boolean} Whether a binding was removed.
 */
rune.input.Action.prototype.unbindKey = function(key) {
    var index = this.m_keys != null && typeof key === "string" ? this.m_keys.indexOf(key.toUpperCase()) : -1;
    if (index === -1) {
        return false;
    }

    this.m_keys.splice(index, 1);
    return true;
};

/**
 * Removes a gamepad binding. State changes are sampled on the next update.
 *
 * @param {number} button Button ID.
 * @returns {boolean} Whether a binding was removed.
 */
rune.input.Action.prototype.unbindButton = function(button) {
    var index = this.m_buttons != null ? this.m_buttons.indexOf(button) : -1;
    if (index === -1) {
        return false;
    }

    this.m_buttons.splice(index, 1);
    return true;
};

/**
 * Removes all bindings. Any held action is released on the next update.
 *
 * @returns {undefined}
 */
rune.input.Action.prototype.clear = function() {
    if (this.m_keys != null) {
        this.m_keys.length = 0;
        this.m_buttons.length = 0;
    }
};

/**
 * Clears held and edge states without changing bindings or generating a release.
 *
 * @returns {undefined}
 */
rune.input.Action.prototype.reset = function() {
    this.m_current = false;
    this.m_previous = false;
};

//------------------------------------------------------------------------------
// INTERNAL PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Samples the combined state once per update, after devices have been updated.
 *
 * @param {rune.input.Keyboard} keyboard Keyboard, or null.
 * @param {rune.input.Gamepad} gamepad Gamepad, or null.
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.Action.prototype.update = function(keyboard, gamepad) {
    if (this.m_keys == null) {
        return;
    }

    this.m_previous = this.m_current;
    this.m_current = false;

    for (var i = 0; keyboard != null && i < this.m_keys.length; i++) {
        if (keyboard.pressed(this.m_keys[i])) {
            this.m_current = true;
            return;
        }
    }

    for (var j = 0; gamepad != null && gamepad['active'] && j < this.m_buttons.length; j++) {
        if (gamepad.pressed(this.m_buttons[j])) {
            this.m_current = true;
            return;
        }
    }
};

/**
 * Releases bindings and clears sampled state. Does not dispose input devices.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.Action.prototype.dispose = function() {
    this.reset();
    this.m_keys = null;
    this.m_buttons = null;
};
