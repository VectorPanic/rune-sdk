//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates a left arrow button.
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
 * Uses idle, focused and pressed animations from the left arrow texture.
 */
demo.ui.ButtonLeft = function(x, y) {

    //--------------------------------------------------------------------------
    // SUPER CALL
    //--------------------------------------------------------------------------

    /**
     * Extend rune.ui.Button.
     */
    rune.ui.Button.call(this, x || 0, y || 0, 16, 16, "demo_button_left_16x16");
};

//------------------------------------------------------------------------------
// INHERITANCE
//------------------------------------------------------------------------------

demo.ui.ButtonLeft.prototype = Object.create(rune.ui.Button.prototype);
demo.ui.ButtonLeft.prototype.constructor = demo.ui.ButtonLeft;

//------------------------------------------------------------------------------
// OVERRIDE PROTECTED PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.ui.ButtonLeft.prototype.m_initAnimations = function() {
    rune.ui.Button.prototype.m_initAnimations.call(this);
    this.animation.create("idle",    [0], 6, true);
    this.animation.create("focused", [1], 6, true);
    this.animation.create("pressed", [2], 6, true);
};
