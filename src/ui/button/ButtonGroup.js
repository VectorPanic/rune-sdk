//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a container that manages button focus and navigation.
 *
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {number} [x=0] Horizontal position.
 * @param {number} [y=0] Vertical position.
 *
 * @class
 * @classdesc
 * Accepts Button children and navigates in insertion order, independently of
 * display depth or sorting. Navigation skips hidden or disabled buttons and wraps by
 * default; set wrap to false to stop at the ends. The
 * first enabled button receives focus. Game code positions the children and
 * supplies input through next(), previous(), select(), press() and release().
 * Focus is reconciled during update(), selection queries and input calls, so
 * hiding or disabling the selected button moves focus to the next available button.
 * Button focus is owned by the group while the button is a child.
 * The pixel buffer automatically fits the buttons, including negative positions,
 * scaling and rotation. Child coordinates remain relative to the group origin.
 * Inherited autoSize is enabled by default and can be disabled for manual sizing.
 */
rune.ui.ButtonGroup = function(x, y) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Buttons in insertion order, independent of the display list order.
     *
     * @type {Array.<rune.ui.Button>}
     * @private
     */
    this.m_buttons = [];

    /**
     * Currently selected button, or null when none is enabled.
     *
     * @type {rune.ui.Button}
     * @private
     */
    this.m_selected = null;

    /**
     * Button whose press originated in this group.
     *
     * @type {rune.ui.Button}
     * @private
     */
    this.m_pressed = null;

    /**
     * Whether group navigation and activation are enabled.
     *
     * @type {boolean}
     * @private
     */
    this.m_enabled = true;

    /**
     * Whether explicit navigation wraps at the ends.
     *
     * @type {boolean}
     * @private
     */
    this.m_wrap = true;

    /**
     * Handler executed after the selected button changes.
     *
     * @type {rune.util.Executable}
     * @private
     */
    this.m_onChange = null;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.display.DisplayObjectContainer.
     */
    rune.display.DisplayObjectContainer.call(this, x, y, 0, 0);
    
    //--------------------------------------------------------------------------
    // Override public properties
    //--------------------------------------------------------------------------
    
    /**
     * @inheritDoc
     */
    this.immovable = true;
    
    /**
     * @inheritDoc
     */
    this['autoSize'] = true;
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.ui.ButtonGroup.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.ui.ButtonGroup.prototype.constructor = rune.ui.ButtonGroup;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Selected button, or null when no button is enabled.
 *
 * @member {rune.ui.Button} selected
 * @memberof rune.ui.ButtonGroup
 * @instance
 * @readonly
 */
Object.defineProperty(rune.ui.ButtonGroup.prototype, "selected", {
    /**
     * @this rune.ui.ButtonGroup
     * @ignore
     */
    get : function() {
        this.m_updateSelection();
        return this.m_selected;
    }
});

/**
 * Selected insertion-order index, or -1 when no button is enabled.
 * This index is independent of the child's display depth.
 *
 * @member {number} selectedIndex
 * @memberof rune.ui.ButtonGroup
 * @instance
 * @readonly
 */
Object.defineProperty(rune.ui.ButtonGroup.prototype, "selectedIndex", {
    /**
     * @this rune.ui.ButtonGroup
     * @ignore
     */
    get : function() {
        this.m_updateSelection();
        return this.m_buttons.indexOf(this.m_selected);
    }
});

/**
 * Whether navigation and activation are enabled. Disabling cancels a press
 * and clears visual focus while retaining the selected button.
 *
 * @member {boolean} enabled
 * @memberof rune.ui.ButtonGroup
 * @instance
 */
Object.defineProperty(rune.ui.ButtonGroup.prototype, "enabled", {
    /**
     * @this rune.ui.ButtonGroup
     * @ignore
     */
    get : function() {
        return this.m_enabled;
    },

    /**
     * @this rune.ui.ButtonGroup
     * @ignore
     */
    set : function(value) {
        value = Boolean(value);
        if (this.m_enabled !== value) {
            this.m_enabled = value;
            if (value === false) this.cancel();
            this.m_updateSelection();
        }
    }
});

/**
 * Whether next() and previous() wrap at the ends. Defaults to true.
 *
 * @member {boolean} wrap
 * @memberof rune.ui.ButtonGroup
 * @instance
 */
Object.defineProperty(rune.ui.ButtonGroup.prototype, "wrap", {
    /**
     * @this rune.ui.ButtonGroup
     * @ignore
     */
    get : function() {
        return this.m_wrap;
    },

    /**
     * @this rune.ui.ButtonGroup
     * @ignore
     */
    set : function(value) {
        value = Boolean(value);
        if (this.m_wrap !== value) {
            this.m_wrap = value;
        }
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds a Button at a display depth. Newly added buttons are appended to the
 * navigation order. Moving an existing child only changes its display depth.
 * Inherited addChild() also uses this method.
 *
 * @param {rune.display.DisplayObject} child Button to add.
 * @param {number} index Display list index.
 *
 * @throws {TypeError} If child is not a Button.
 * @return {rune.display.DisplayObject} Added button.
 */
rune.ui.ButtonGroup.prototype.addChildAt = function(child, index) {
    if (!(child instanceof rune.ui.Button)) throw new TypeError("ButtonGroup accepts Button children.");
    var button = /** @type {rune.ui.Button} */ (child);
    rune.display.DisplayObjectContainer.prototype.addChildAt.call(this, child, index);
    if (button['parent'] === this && this.m_buttons.indexOf(button) === -1) {
        button.cancel();
        button.blur();
        this.m_buttons.push(button);
    }
    this.m_updateSelection();
    return child;
};

/**
 * Removes a button and moves selection to its next enabled successor.
 * Inherited removeChildAt() and removeChildren() also use this method.
 *
 * @param {rune.display.DisplayObject} child Button to remove.
 * @param {boolean} [dispose=false] Whether to dispose the removed button.
 *
 * @return {rune.display.DisplayObject} Removed button, or null when disposed.
 */
rune.ui.ButtonGroup.prototype.removeChild = function(child, dispose) {
    var index = this.m_buttons.indexOf(/** @type {rune.ui.Button} */ (child));
    var selected = child === this.m_selected;
    if (index !== -1) {
        this.m_buttons[index].cancel();
        this.m_buttons[index].blur();
        this.m_buttons.splice(index, 1);
        if (selected) this.m_selected = null;
        if (child === this.m_pressed) this.m_pressed = null;
    }
    var result = rune.display.DisplayObjectContainer.prototype.removeChild.call(this, child, dispose);
    if (selected) this.m_setSelection(this.m_findButton(index - 1, 1), /** @type {rune.ui.Button} */ (child));
    this.m_updateSelection();
    return result;
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.ui.ButtonGroup.prototype.update = function(step) {
    this.m_updateSelection();
    rune.display.DisplayObjectContainer.prototype.update.call(this, step);
    this.m_updateSelection();
};

/**
 * @inheritDoc
 */
rune.ui.ButtonGroup.prototype.dispose = function() {
    this.cancel();
    this.m_disposeOnChange();
    this.m_enabled = false;
    rune.display.DisplayObjectContainer.prototype.dispose.call(this);
    this.m_buttons.length = 0;
    this.m_selected = null;
    this.m_pressed = null;
};

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Selects the next enabled button in insertion order. Respects wrap.
 *
 * @return {boolean} Whether selection changed.
 */
rune.ui.ButtonGroup.prototype.next = function() {
    if (this.m_enabled === false) return false;
    this.m_updateSelection();
    var button = this.m_findButton(this.m_buttons.indexOf(this.m_selected), 1, this.m_wrap);
    return button != null ? this.m_setSelection(button) : false;
};

/**
 * Selects the previous enabled button in insertion order. Respects wrap.
 *
 * @return {boolean} Whether selection changed.
 */
rune.ui.ButtonGroup.prototype.previous = function() {
    if (this.m_enabled === false) return false;
    this.m_updateSelection();
    var button = this.m_findButton(this.m_buttons.indexOf(this.m_selected), -1, this.m_wrap);
    return button != null ? this.m_setSelection(button) : false;
};

/**
 * Activates the selected button directly. Any pending group press is cancelled
 * first so a later release cannot trigger a second activation.
 * Activation is cancelled if a focus-change callback disables the group.
 *
 * @return {boolean} Whether activation was accepted.
 */
rune.ui.ButtonGroup.prototype.select = function() {
    if (this.m_enabled === false) return false;
    this.m_updateSelection();
    this.cancel();
    return this.m_enabled === true && this.m_selected != null ? this.m_selected.activate() : false;
};

/**
 * Begins a press on the selected button.
 *
 * @return {boolean} Whether a new press began.
 */
rune.ui.ButtonGroup.prototype.press = function() {
    if (this.m_enabled === false) return false;
    this.m_updateSelection();
    if (this.m_selected != null && this.m_selected.press()) {
        this.m_pressed = this.m_selected;
        return true;
    }
    return false;
};

/**
 * Releases the button pressed through this group. Navigation, removal or
 * disabling cancels that press, so another button cannot receive its release.
 *
 * @return {boolean} Whether the button was activated.
 */
rune.ui.ButtonGroup.prototype.release = function() {
    if (this.m_enabled === false) return false;
    this.m_updateSelection();
    var button = this.m_pressed;
    this.m_pressed = null;
    return button != null && button === this.m_selected ? button.release() : false;
};

/**
 * Cancels a press begun through this group without changing selection.
 *
 * @return {boolean} Whether a press was cancelled.
 */
rune.ui.ButtonGroup.prototype.cancel = function() {
    var button = this.m_pressed;
    this.m_pressed = null;
    return button != null ? button.cancel() : false;
};

/**
 * Focuses a button by its insertion-order index without activating it.
 * Invalid indices, hidden or disabled buttons and disabled groups are ignored.
 *
 * @param {number} index Insertion-order index.
 *
 * @return {boolean} Whether selection changed.
 */
rune.ui.ButtonGroup.prototype.focusAt = function(index) {
    if (typeof index !== "number" || index !== Math.floor(index) ||
        index < 0 || index >= this.m_buttons.length) return false;
    return this.focusButton(this.m_buttons[index]);
};

/**
 * Focuses a visible, enabled child button without activating it.
 *
 * @param {rune.ui.Button} button Button belonging to this group.
 *
 * @return {boolean} Whether selection changed.
 */
rune.ui.ButtonGroup.prototype.focusButton = function(button) {
    if (this.m_enabled === false || this.m_buttons.indexOf(button) === -1 ||
        button.enabled === false || button['visible'] === false) return false;
    return this.m_setSelection(button);
};

/**
 * Replaces the selection-change handler. Receives previous button, new button
 * and this group. Either button may be null. No event is emitted when the same
 * button remains selected or when registering the handler. Pass null to remove.
 *
 * @param {Function} func Handler, or null to remove it.
 * @param {Object} [scope] Handler execution scope.
 *
 * @throws {TypeError} If func is neither a function nor null.
 * @return {undefined}
 */
rune.ui.ButtonGroup.prototype.onChange = function(func, scope) {
    if (func != null && typeof func !== "function") throw new TypeError();
    this.m_disposeOnChange();
    if (func != null) this.m_onChange = new rune.util.Executable(func, scope);
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Restores a valid selection and ensures only its button has focus.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.ButtonGroup.prototype.m_updateSelection = function() {
    var index = this.m_buttons.indexOf(this.m_selected);
    if (index === -1 || this.m_selected.enabled === false || this.m_selected['visible'] === false) {
        this.m_setSelection(this.m_findButton(index, 1));
    }
    for (var i = 0; i < this.m_buttons.length; i++) {
        if (this.m_enabled === true && this.m_buttons[i] === this.m_selected) {
            this.m_buttons[i].focus();
        } else {
            this.m_buttons[i].blur();
        }
    }
};

/**
 * Finds an enabled button after an insertion-order index. Each button is
 * examined at most once; null is returned when none is enabled.
 *
 * @param {number} index Starting index, excluded until navigation wraps.
 * @param {number} direction Navigation direction, 1 or -1.
 * @param {boolean} [wrap=true] Whether to search past the ends. Automatic focus
 * repair always wraps so an available button is retained.
 *
 * @return {rune.ui.Button} Matching button, or null.
 * @protected
 * @ignore
 */
rune.ui.ButtonGroup.prototype.m_findButton = function(index, direction, wrap) {
    var count = this.m_buttons.length;
    for (var i = 0; i < count; i++) {
        index += direction;
        if (wrap === false && (index < 0 || index >= count)) return null;
        index = (index + count) % count;
        if (this.m_buttons[index].enabled === true && this.m_buttons[index]['visible'] === true) {
            return this.m_buttons[index];
        }
    }
    return null;
};

/**
 * Changes selection, cancelling a pending press and clearing previous focus.
 *
 * @param {rune.ui.Button} button Next selected button, or null.
 * @param {rune.ui.Button} [previous] Removed selection for notification only.
 *
 * @return {boolean} Whether selection changed.
 * @protected
 * @ignore
 */
rune.ui.ButtonGroup.prototype.m_setSelection = function(button, previous) {
    previous = previous === undefined ? this.m_selected : previous;
    if (previous === button) return false;
    this.cancel();
    if (this.m_selected != null) this.m_selected.blur();
    this.m_selected = button;
    if (this.m_enabled === true && this.m_selected != null) this.m_selected.focus();
    if (this.m_onChange != null) this.m_onChange.execute(previous, button, this);
    return true;
};

/**
 * Releases the selection-change handler and its execution scope.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.ButtonGroup.prototype.m_disposeOnChange = function() {
    if (this.m_onChange != null) {
        this.m_onChange.dispose();
        this.m_onChange = null;
    }
};
