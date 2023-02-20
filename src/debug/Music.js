//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object.
 *
 * @constructor
 * @extends rune.text.BitmapField
 * @package
 *
 * @class
 * @classdesc
 * 
 * The Master class represents a graphical tool that illustrates the number of 
 * registered audio objects in the Music audio channel.
 */
rune.debug.Music = function() {

    //--------------------------------------------------------------------------
    //  Constructor call
    //--------------------------------------------------------------------------
    
    /**
     * Extend BitmapField.
     */
    rune.text.BitmapField.call(this, " 00 ");
}

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.debug.Music.prototype = Object.create(rune.text.BitmapField.prototype);
rune.debug.Music.prototype.constructor = rune.debug.Music;

//------------------------------------------------------------------------------
// Override protected methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.debug.Music.prototype.init = function() {
    rune.text.BitmapField.prototype.init.call(this);
    this['text'] = " 00 ";
    this['width'] = 24;
    this['backgroundColor'] = rune.util.Palette.GRAY;
};

/**
 * @inheritDoc
 */
rune.debug.Music.prototype.update = function(step) {
    rune.text.BitmapField.prototype.update.call(this, step);
    this['text'] = " " + this['application']['sounds']['music']['length'] + " ";
};