//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a sprite-based button without binding it to an input device.
 *
 * @constructor
 * @extends rune.display.Sprite
 *
 * @param {number} x Horizontal position.
 * @param {number} y Vertical position.
 * @param {number} width Frame width in pixels.
 * @param {number} height Frame height in pixels.
 * @param {string} resource Sprite texture resource name.
 *
 * @class
 * @classdesc
 * Uses the named animations idle, focused, pressed and disabled to represent
 * its state. Each animation may contain one or more frames. Missing state
 * animations fall back to idle; without idle, the current frame is retained.
 * No default texture or animations are created. Configure animation through
 * the inherited animation getter or override m_initAnimations(). Menus and
 * input handlers call focus(), blur(), press(), release() and cancel(). This
 * keeps gamepad navigation independent of future pointer input handling.
 * Invisible buttons reject focus and activation. Hiding cancels pending presses;
 * temporary flicker effects do not affect navigation or activation.
 */
rune.ui.Button = function(x, y, width, height, resource) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Whether the button accepts focus and activation.
     *
     * @type {boolean}
     * @private
     */
    this.m_enabled = true;

    /**
     * Whether the button has navigation focus.
     *
     * @type {boolean}
     * @private
     */
    this.m_focused = false;

    /**
     * Whether a valid press is awaiting release.
     *
     * @type {boolean}
     * @private
     */
    this.m_pressed = false;

    /**
     * Handler executed when the button is activated.
     *
     * @type {rune.util.Executable}
     * @private
     */
    this.m_onActivate = null;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.display.Sprite.
     */
    rune.display.Sprite.call(this, x, y, width, height, resource);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.ui.Button.prototype = Object.create(rune.display.Sprite.prototype);
rune.ui.Button.prototype.constructor = rune.ui.Button;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether the button is visible. Hiding clears focus and cancels a press.
 *
 * @member {boolean} visible
 * @memberof rune.ui.Button
 * @instance
 */
Object.defineProperty(rune.ui.Button.prototype, "visible", {
    /**
     * @this rune.ui.Button
     * @ignore
     */
    get : function() {
        return Object.getOwnPropertyDescriptor(rune.display.DisplayObject.prototype, "visible").get.call(this);
    },

    /**
     * @this rune.ui.Button
     * @ignore
     */
    set : function(value) {
        value = Boolean(value);
        Object.getOwnPropertyDescriptor(rune.display.DisplayObject.prototype, "visible").set.call(this, value);
        if (value === false) {
            this.blur();
            this.cancel();
        }
    }
});

/**
 * Whether the button accepts input. Disabling clears focus and cancels a press.
 *
 * @member {boolean} enabled
 * @memberof rune.ui.Button
 * @instance
 */
Object.defineProperty(rune.ui.Button.prototype, "enabled", {
    /**
     * @this rune.ui.Button
     * @ignore
     */
    get : function() {
        return this.m_enabled;
    },

    /**
     * @this rune.ui.Button
     * @ignore
     */
    set : function(value) {
        value = Boolean(value);
        if (this.m_enabled !== value) {
            this.m_enabled = value;
            if (value === false) {
                this.m_focused = false;
                this.m_pressed = false;
            }
            this.m_updateAppearance();
        }
    }
});

/**
 * Whether the button has navigation focus.
 *
 * @member {boolean} focused
 * @memberof rune.ui.Button
 * @instance
 * @readonly
 */
Object.defineProperty(rune.ui.Button.prototype, "focused", {
    /**
     * @this rune.ui.Button
     * @ignore
     */
    get : function() {
        return this.m_focused;
    }
});

/**
 * Whether the button is awaiting release after a valid press.
 *
 * @member {boolean} pressed
 * @memberof rune.ui.Button
 * @instance
 * @readonly
 */
Object.defineProperty(rune.ui.Button.prototype, "pressed", {
    /**
     * @this rune.ui.Button
     * @ignore
     */
    get : function() {
        return this.m_pressed;
    }
});

/**
 * Current visual state: idle, focused, pressed or disabled.
 *
 * @member {string} state
 * @memberof rune.ui.Button
 * @instance
 * @readonly
 */
Object.defineProperty(rune.ui.Button.prototype, "state", {
    /**
     * @this rune.ui.Button
     * @ignore
     */
    get : function() {
        if (this.m_enabled === false) return "disabled";
        if (this.m_pressed === true) return "pressed";
        return this.m_focused === true ? "focused" : "idle";
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.ui.Button.prototype.update = function(step) {
    this.m_updateAppearance();
    rune.display.Sprite.prototype.update.call(this, step);
};

/**
 * @inheritDoc
 */
rune.ui.Button.prototype.dispose = function() {
    this.m_disposeOnActivate();
    rune.display.Sprite.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Gives a visible, enabled button navigation focus.
 *
 * @return {boolean} Whether focus changed.
 */
rune.ui.Button.prototype.focus = function() {
    if (this.m_enabled === false || this['visible'] === false || this.m_focused === true) return false;
    this.m_focused = true;
    this.m_updateAppearance();
    return true;
};

/**
 * Removes focus and cancels any pending press without activating the button.
 *
 * @return {boolean} Whether focus changed.
 */
rune.ui.Button.prototype.blur = function() {
    if (this.m_focused === false) return false;
    this.m_focused = false;
    this.m_pressed = false;
    this.m_updateAppearance();
    return true;
};

/**
 * Begins a press on an enabled, focused button. Repeated presses are ignored.
 *
 * @return {boolean} Whether a new press began.
 */
rune.ui.Button.prototype.press = function() {
    if (this.m_enabled === false || this['visible'] === false || this.m_focused === false || this.m_pressed === true) return false;
    this.m_pressed = true;
    this.m_updateAppearance();
    return true;
};

/**
 * Releases a pending press and activates the button if still enabled and focused.
 * The pressed state is cleared before the activation handler is executed.
 *
 * @return {boolean} Whether the button was activated.
 */
rune.ui.Button.prototype.release = function() {
    if (this.m_pressed === false) return false;
    this.m_pressed = false;
    this.m_updateAppearance();
    return this.m_focused === true ? this.activate() : false;
};

/**
 * Cancels a pending press without changing focus or activating the button.
 * Pointer handlers can use this when the pointer leaves the button.
 *
 * @return {boolean} Whether a press was cancelled.
 */
rune.ui.Button.prototype.cancel = function() {
    if (this.m_pressed === false) return false;
    this.m_pressed = false;
    this.m_updateAppearance();
    return true;
};

/**
 * Activates a visible, enabled button without requiring focus or a press.
 * The handler receives this button as its only argument.
 *
 * @return {boolean} Whether activation was accepted.
 */
rune.ui.Button.prototype.activate = function() {
    if (this.m_enabled === false || this['visible'] === false) return false;
    if (this.m_onActivate != null) {
        this.m_onActivate.execute(this);
    }
    return true;
};

/**
 * Replaces the activation handler. Pass null to remove the existing handler.
 *
 * @param {Function} func Activation handler, or null to remove it.
 * @param {Object} [scope] Handler execution scope.
 *
 * @throws {TypeError} If the handler is neither a function nor null.
 * @return {undefined}
 */
rune.ui.Button.prototype.onActivate = function(func, scope) {
    if (func != null && typeof func !== "function") throw new TypeError();
    this.m_disposeOnActivate();
    if (func != null) {
        this.m_onActivate = new rune.util.Executable(func, scope);
    }
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.ui.Button.prototype.m_construct = function() {
    rune.display.Sprite.prototype.m_construct.call(this);
    this.m_initAnimations();
    this.m_updateAppearance();
    this.immovable = true;
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Configures state animations. The base implementation creates no animations.
 * Override in game code and use animation.create() to define each state.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.Button.prototype.m_initAnimations = function() {
};

/**
 * Plays the animation matching state, falling back to idle when available.
 * Playback restarts only when the selected animation changes, so update() does
 * not restart a running or completed sequence. Override for custom visuals.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.Button.prototype.m_updateAppearance = function() {
    var animations = this.animation;
    if (animations == null) return;
    var animation = animations.find(this.state) || animations.find("idle");
    if (animation != null && animations.current !== animation) {
        animations.gotoAndPlay(animation.name, 0);
    }
};

/**
 * Releases the activation handler and its execution scope.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.Button.prototype.m_disposeOnActivate = function() {
    if (this.m_onActivate != null) {
        this.m_onActivate.dispose();
        this.m_onActivate = null;
    }
};
