//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates a right arrow button.
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
 * Uses idle, focused and pressed animations from the right arrow texture.
 */
demo.ui.ButtonRight = function(x, y) {

    //--------------------------------------------------------------------------
    // SUPER CALL
    //--------------------------------------------------------------------------

    /**
     * Extend rune.ui.Button.
     */
    rune.ui.Button.call(this, x || 0, y || 0, 16, 16, "demo_button_right_16x16");
};

//------------------------------------------------------------------------------
// INHERITANCE
//------------------------------------------------------------------------------

demo.ui.ButtonRight.prototype = Object.create(rune.ui.Button.prototype);
demo.ui.ButtonRight.prototype.constructor = demo.ui.ButtonRight;

//------------------------------------------------------------------------------
// OVERRIDE PROTECTED PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.ui.ButtonRight.prototype.m_initAnimations = function() {
    rune.ui.Button.prototype.m_initAnimations.call(this);
    this.animation.create("idle",    [0], 6, true);
    this.animation.create("focused", [1], 6, true);
    this.animation.create("pressed", [2], 6, true);
};
