//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of VTListElement.
 *
 * @constructor
 * @extends rune.text.BitmapField
 * @package
 *
 * @param {string} text The text value of the element.
 * @param {string} [resource] Name of texture resource.
 *
 * @class
 * @classdesc
 * 
 * Represents an element (bitmap-based text value) in a VTList.
 */
rune.ui.VTListElement = function(text, resource) {
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.ui.VTListElement.
     */
    rune.text.BitmapField.call(this, text, resource);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.ui.VTListElement.prototype = Object.create(rune.text.BitmapField.prototype);
rune.ui.VTListElement.prototype.constructor = rune.ui.VTListElement;