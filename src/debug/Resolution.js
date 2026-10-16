//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a panel showing the game's internal rendering resolution.
 *
 * @constructor
 * @extends rune.text.BitmapField
 * @package
 *
 * @class
 * @classdesc
 *
 * The Resolution class displays the screen canvas's pixel buffer dimensions.
 * CSS scaling, window dimensions and individual camera zoom do not affect
 * the displayed resolution.
 */
rune.debug.Resolution = function() {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Initializes the base BitmapField class.
     */
    rune.text.BitmapField.call(this, " 0 x 0 ");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.debug.Resolution.prototype = Object.create(rune.text.BitmapField.prototype);
rune.debug.Resolution.prototype.constructor = rune.debug.Resolution;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Configures the panel using the same background as the other debug panels.
 * The screen may still be under construction when this panel is initialized.
 *
 * @override
 * @returns {undefined}
 */
rune.debug.Resolution.prototype.init = function() {
    rune.text.BitmapField.prototype.init.call(this);
    this['width'] = this['textWidth'];
    this['backgroundColor'] = rune.util.Palette.GRAY;
};

/**
 * Reads the screen's buffer size, keeping the display current after resizing.
 * Screen width and height refer to canvas pixels, rather than CSS dimensions.
 *
 * @override
 * @param {number} step Current time step.
 * @returns {undefined}
 */
rune.debug.Resolution.prototype.update = function(step) {
    rune.text.BitmapField.prototype.update.call(this, step);
    var screen = this['application']['screen'];
    if (screen != null) {
        this['text'] = " " + screen['width'] + " x " + screen['height'] + " ";
        this['width'] = this['textWidth'];
    }
};
