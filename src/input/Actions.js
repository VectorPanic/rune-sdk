//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates a collection of named input actions and analog axes.
 *
 * @constructor
 * @param {rune.input.Keyboard} [keyboard] Keyboard to read.
 * @param {rune.input.Gamepad} [gamepad] One player's gamepad to read.
 *
 * @class
 * @classdesc
 * Use Inputs.createActions() for automatic updates before scene logic. A directly
 * constructed collection must be updated once before its owner's game logic.
 * Devices are borrowed and are never disposed by this collection.
 */
rune.input.Actions = function(keyboard, gamepad) {

    //--------------------------------------------------------------------------
    // PUBLIC PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Keyboard used by all actions. May be replaced or set to null.
     *
     * @type {rune.input.Keyboard}
     */
    this.keyboard = keyboard || null;

    /**
     * Player's gamepad. May be replaced or set to null.
     *
     * @type {rune.input.Gamepad}
     */
    this.gamepad = gamepad || null;

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Registered actions.
     *
     * @type {Array.<rune.input.Action>}
     * @private
     */
    this.m_actions = [];

    /**
     * Registered analog axes, sampled after digital actions.
     *
     * @type {Array.<rune.input.Axis>}
     * @private
     */
    this.m_axes = [];

    /**
     * Whether action states should be sampled.
     *
     * @type {boolean}
     * @private
     */
    this.m_enabled = true;
};

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE GETTER AND SETTER METHODS
//------------------------------------------------------------------------------

/**
 * Whether actions and axes are sampled. Disabling resets both and retains bindings.
 *
 * @member {boolean} enabled
 * @memberof rune.input.Actions
 * @instance
 * @default true
 */
Object.defineProperty(rune.input.Actions.prototype, "enabled", {
    /**
     * @this rune.input.Actions
     * @ignore
     */
    get : function() {
        return this.m_enabled;
    },

    /**
     * @this rune.input.Actions
     * @ignore
     */
    set : function(value) {
        this.m_enabled = Boolean(value);
        if (!this.m_enabled) {
            this.reset();
        }
    }
});

/**
 * Whether this collection has been disposed.
 *
 * @member {boolean} disposed
 * @memberof rune.input.Actions
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Actions.prototype, "disposed", {
    /**
     * @this rune.input.Actions
     * @ignore
     */
    get : function() {
        return this.m_actions == null;
    }
});

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Creates an action, or returns the existing action with the same name.
 *
 * @param {string} name Non-empty action name.
 * @returns {rune.input.Action} The registered action.
 * @throws {TypeError} If the name is invalid.
 * @throws {Error} If the collection is disposed.
 */
rune.input.Actions.prototype.create = function(name) {
    if (this['disposed']) {
        throw new Error("Actions: Cannot create an action after disposal.");
    }

    var action = this.get(name);
    if (action == null) {
        action = new rune.input.Action(name);
        this.m_actions.push(action);
    }

    return action;
};

/**
 * Finds an action without creating it. Names are matched without regard to case.
 *
 * @param {string} name Action name.
 * @returns {?rune.input.Action} The action, or null if missing or disposed.
 */
rune.input.Actions.prototype.get = function(name) {
    if (this['disposed'] || typeof name !== "string") {
        return null;
    }

    name = name.toUpperCase();
    for (var i = 0; i < this.m_actions.length; i++) {
        if (this.m_actions[i]['name'] === name) {
            return this.m_actions[i];
        }
    }

    return null;
};

/**
 * Creates an analog axis, or returns the existing axis with the same name.
 * Axis names and action names occupy separate namespaces.
 *
 * @example
 * controls.bindKey("LEFT", "A");
 * controls.bindKey("RIGHT", "D");
 * controls.createAxis("MOVE_X")
 *     .bindActions("LEFT", "RIGHT")
 *     .bindStick("left", "x");
 * var movement = controls.getAxis("MOVE_X").value;
 *
 * @param {string} name Non-empty axis name.
 * @returns {rune.input.Axis} The registered axis.
 * @throws {Error} If the name is invalid or the collection is disposed.
 */
rune.input.Actions.prototype.createAxis = function(name) {
    if (this['disposed']) {
        throw new Error("Actions: Cannot create an axis after disposal.");
    }

    var axis = this.getAxis(name);
    if (axis == null) {
        axis = new rune.input.Axis(name);
        this.m_axes.push(axis);
    }

    return axis;
};

/**
 * Finds an axis without creating it. Names are matched without regard to case.
 *
 * @param {string} name Axis name.
 * @returns {?rune.input.Axis} The axis, or null if missing or disposed.
 */
rune.input.Actions.prototype.getAxis = function(name) {
    if (this['disposed'] || typeof name !== "string") {
        return null;
    }

    name = name.toUpperCase();
    for (var i = 0; i < this.m_axes.length; i++) {
        if (this.m_axes[i]['name'] === name) {
            return this.m_axes[i];
        }
    }

    return null;
};

/**
 * Removes and disposes a named axis, leaving actions and devices unchanged.
 *
 * @param {string} name Axis name.
 * @returns {boolean} Whether an axis was removed.
 */
rune.input.Actions.prototype.removeAxis = function(name) {
    var axis = this.getAxis(name);
    if (axis == null) {
        return false;
    }

    this.m_axes.splice(this.m_axes.indexOf(axis), 1);
    axis.dispose();
    return true;
};

/**
 * Adds a key binding, creating the action if needed.
 *
 * @param {string} name Action name.
 * @param {string} key Keyboard key name.
 * @returns {rune.input.Action} The action, for additional bindings.
 * @throws {Error} If the name, key or collection state is invalid.
 */
rune.input.Actions.prototype.bindKey = function(name, key) {
    return this.create(name).bindKey(key);
};

/**
 * Adds a gamepad button binding, creating the action if needed.
 *
 * @param {string} name Action name.
 * @param {number} button Non-negative integer button ID.
 * @returns {rune.input.Action} The action, for additional bindings.
 * @throws {Error} If the name, button or collection state is invalid.
 */
rune.input.Actions.prototype.bindButton = function(name, button) {
    return this.create(name).bindButton(button);
};

/**
 * Reads the combined held state of an action.
 *
 * @param {string} name Action name.
 * @returns {boolean} Whether held. Missing actions return false.
 */
rune.input.Actions.prototype.pressed = function(name) {
    var action = this.get(name);
    return action != null && action['pressed'];
};

/**
 * Reads whether an action became held in the current update.
 *
 * @param {string} name Action name.
 * @returns {boolean} Whether just pressed. Missing actions return false.
 */
rune.input.Actions.prototype.justPressed = function(name) {
    var action = this.get(name);
    return action != null && action['justPressed'];
};

/**
 * Reads whether the last held binding was released in the current update.
 *
 * @param {string} name Action name.
 * @returns {boolean} Whether just released. Missing actions return false.
 */
rune.input.Actions.prototype.justReleased = function(name) {
    var action = this.get(name);
    return action != null && action['justReleased'];
};

/**
 * Combines two actions into an axis. Both or neither held returns zero.
 *
 * @param {string} negativeName Action for -1.
 * @param {string} positiveName Action for 1.
 * @returns {number} -1, 0 or 1.
 */
rune.input.Actions.prototype.axis = function(negativeName, positiveName) {
    var negative = this.pressed(negativeName) ? 1 : 0;
    var positive = this.pressed(positiveName) ? 1 : 0;

    return positive - negative;
};

/**
 * Removes and disposes a named action without affecting input devices.
 *
 * @param {string} name Action name.
 * @returns {boolean} Whether an action was removed.
 */
rune.input.Actions.prototype.remove = function(name) {
    var action = this.get(name);
    if (action == null) {
        return false;
    }

    this.m_actions.splice(this.m_actions.indexOf(action), 1);
    action.dispose();
    return true;
};

/**
 * Removes all actions, axes and their bindings.
 *
 * @returns {undefined}
 */
rune.input.Actions.prototype.clear = function() {
    if (!this['disposed']) {
        while (this.m_axes.length > 0) {
            this.m_axes.pop().dispose();
        }

        while (this.m_actions.length > 0) {
            this.m_actions.pop().dispose();
        }
    }
};

/**
 * Clears sampled states, retaining bindings and leaving devices unchanged.
 *
 * @returns {undefined}
 */
rune.input.Actions.prototype.reset = function() {
    if (!this['disposed']) {
        for (var i = 0; i < this.m_actions.length; i++) {
            this.m_actions[i].reset();
        }

        for (var j = 0; j < this.m_axes.length; j++) {
            this.m_axes[j].reset();
        }
    }
};

//------------------------------------------------------------------------------
// INTERNAL PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Samples actions and then axes once per update, after device updates.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.Actions.prototype.update = function() {
    if (!this.m_enabled || this['disposed']) {
        return;
    }

    for (var i = 0; i < this.m_actions.length; i++) {
        this.m_actions[i].update(this.keyboard, this.gamepad);
    }

    for (var j = 0; j < this.m_axes.length; j++) {
        this.m_axes[j].update(this);
    }
};

/**
 * Releases actions, axes and device references. Safe to call repeatedly.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.Actions.prototype.dispose = function() {
    this.clear();
    this.m_actions = null;
    this.m_axes = null;
    this.m_enabled = false;
    this.keyboard = null;
    this.gamepad = null;
};
