//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates a named analog axis owned by an Actions collection.
 *
 * @constructor
 * @param {string} name Non-empty axis name, matched without regard to case.
 * @throws {TypeError} If the name is invalid.
 *
 * @class
 * @classdesc
 * Combines action pairs and gamepad stick components into a value from -1 to 1.
 * The strongest binding wins; ties favor the first registered binding. Stick
 * values use the gamepad's existing dead zone. Bindings are sampled after actions.
 */
rune.input.Axis = function(name) {
    if (typeof name !== "string" || name.trim().length === 0) {
        throw new TypeError("Axis: Expected a non-empty name.");
    }

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Normalized axis name.
     * @type {string}
     * @private
     */
    this.m_name = name.toUpperCase();

    /**
     * Ordered action pair and stick bindings.
     * @type {Array.<Object>}
     * @private
     */
    this.m_bindings = [];

    /**
     * Sampled value from -1 to 1.
     * @type {number}
     * @private
     */
    this.m_value = 0;
};

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE GETTER AND SETTER METHODS
//------------------------------------------------------------------------------

/**
 * Normalized axis name.
 * @member {string} name
 * @memberof rune.input.Axis
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Axis.prototype, "name", {
    /**
     * @this rune.input.Axis
     * @ignore
     */
    get : function() {
        return this.m_name;
    }
});

/**
 * Current sampled value. Reading does not resample devices.
 * @member {number} value
 * @memberof rune.input.Axis
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Axis.prototype, "value", {
    /**
     * @this rune.input.Axis
     * @ignore
     */
    get : function() {
        return this.m_value;
    }
});

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Adds an action pair. Missing actions read as released and may be created later.
 * Duplicate bindings are ignored. Changes are sampled on the next update.
 *
 * @param {string} negative Action name for -1.
 * @param {string} positive Action name for 1.
 * @returns {rune.input.Axis} This axis.
 * @throws {Error} If a name is invalid or the axis is disposed.
 */
rune.input.Axis.prototype.bindActions = function(negative, positive) {
    if (typeof negative !== "string" || negative.trim().length === 0 ||
        typeof positive !== "string" || positive.trim().length === 0) {
        throw new TypeError("Axis: Expected two non-empty action names.");
    }

    return this.m_bind("actions", negative.toUpperCase(), positive.toUpperCase());
};

/**
 * Adds one stick component, retaining the gamepad's existing dead zone.
 * Duplicate bindings are ignored. Changes are sampled on the next update.
 *
 * @param {string} stick Left or right, matched without regard to case.
 * @param {string} component X or y, matched without regard to case.
 * @returns {rune.input.Axis} This axis.
 * @throws {Error} If the binding is invalid or the axis is disposed.
 */
rune.input.Axis.prototype.bindStick = function(stick, component) {
    stick = typeof stick === "string" ? stick.toLowerCase() : "";
    component = typeof component === "string" ? component.toLowerCase() : "";
    if ((stick !== "left" && stick !== "right") || (component !== "x" && component !== "y")) {
        throw new TypeError("Axis: Expected a left/right stick and an x/y component.");
    }

    return this.m_bind("stick", stick, component);
};

/**
 * Removes all bindings. The value becomes zero on the next update.
 * @returns {undefined}
 */
rune.input.Axis.prototype.clear = function() {
    if (this.m_bindings != null) {
        this.m_bindings.length = 0;
    }
};

/**
 * Resets the sampled value without changing bindings.
 * @returns {undefined}
 */
rune.input.Axis.prototype.reset = function() {
    this.m_value = 0;
};

//------------------------------------------------------------------------------
// INTERNAL PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Samples bindings after the collection's digital actions.
 * @param {rune.input.Actions} actions Owning collection and borrowed gamepad.
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.Axis.prototype.update = function(actions) {
    this.reset();
    if (this.m_bindings == null) {
        return;
    }

    for (var i = 0; i < this.m_bindings.length; i++) {
        var binding = this.m_bindings[i];
        var value = 0;
        if (binding['type'] === "actions") {
            value = actions.axis(binding['first'], binding['second']);
        } else if (actions.gamepad != null && actions.gamepad['active']) {
            var stick = binding['first'] === "left" ? actions.gamepad['stickLeft'] : actions.gamepad['stickRight'];
            value = stick != null ? stick[binding['second']] : 0;
        }
        
        if (typeof value === "number" && isFinite(value)) {
            value = Math.max(-1, Math.min(1, value));
            if (Math.abs(value) > Math.abs(this.m_value)) {
                this.m_value = value;
            }
        }
    }
};

/**
 * Releases bindings and resets the value. Safe to call repeatedly.
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.Axis.prototype.dispose = function() {
    this.reset();
    this.m_bindings = null;
};

//------------------------------------------------------------------------------
// PRIVATE PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Registers a unique binding while preserving binding order.
 * @param {string} type Binding type.
 * @param {string} first First binding argument.
 * @param {string} second Second binding argument.
 * @returns {rune.input.Axis} This axis.
 * @throws {Error} If the axis is disposed.
 * @private
 */
rune.input.Axis.prototype.m_bind = function(type, first, second) {
    if (this.m_bindings == null) {
        throw new Error("Axis: Cannot bind a disposed axis.");
    }

    for (var i = 0; i < this.m_bindings.length; i++) {
        var binding = this.m_bindings[i];
        if (binding['type'] === type && binding['first'] === first && binding['second'] === second) {
            return this;
        }
    }

    this.m_bindings.push({'type': type, 'first': first, 'second': second});
    return this;
};
