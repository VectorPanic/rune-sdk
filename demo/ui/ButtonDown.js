//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates a down arrow button.
 *
 * @constructor
 * @extends rune.ui.Button
 *
 * @param {number} [x] The x position of the object.
 * @param {number} [y] The y position of the object.
 *
 * @class
 * @classdesc
 *
 * Uses idle, focused and pressed animations from the down arrow texture.
 */
demo.ui.ButtonDown = function(x, y) {

    //--------------------------------------------------------------------------
    // SUPER CALL
    //--------------------------------------------------------------------------

    /**
     * Extend rune.ui.Button.
     */
    rune.ui.Button.call(this, x || 0, y || 0, 16, 16, "demo_button_down_16x16");
};

//------------------------------------------------------------------------------
// INHERITANCE
//------------------------------------------------------------------------------

demo.ui.ButtonDown.prototype = Object.create(rune.ui.Button.prototype);
demo.ui.ButtonDown.prototype.constructor = demo.ui.ButtonDown;

//------------------------------------------------------------------------------
// OVERRIDE PROTECTED PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.ui.ButtonDown.prototype.m_initAnimations = function() {
    rune.ui.Button.prototype.m_initAnimations.call(this);
    this.animation.create("idle",    [0], 6, true);
    this.animation.create("focused", [1], 6, true);
    this.animation.create("pressed", [2], 6, true);
};
