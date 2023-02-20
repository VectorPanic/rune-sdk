//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Framerate object.
 *
 * @constructor
 * @extends rune.text.BitmapField
 * @package
 *
 * @class
 * @classdesc
 * 
 * The Framerate class is used to visualize an application's current frame 
 * rate specified in frames per second (fps).
 */
rune.debug.Framerate = function() {

    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------
    
    /**
     * Extend BitmapField.
     */
    rune.text.BitmapField.call(this, " 00 ");
}

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.debug.Framerate.prototype = Object.create(rune.text.BitmapField.prototype);
rune.debug.Framerate.prototype.constructor = rune.debug.Framerate;

//------------------------------------------------------------------------------
// Override protected methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.debug.Framerate.prototype.init = function() {
    rune.text.BitmapField.prototype.init.call(this);
    this['text'] = " 00 ";
    this['width'] = 24;
    this['backgroundColor'] = rune.util.Palette.GRAY;
};

/**
 * @inheritDoc
 */
rune.debug.Framerate.prototype.update = function(step) {
    rune.text.BitmapField.prototype.update.call(this, step);
    this['text'] = " " + this['application']['time']['currentFramerate'] + " ";
};