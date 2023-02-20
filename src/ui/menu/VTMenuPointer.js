//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instantiates a new object from the class.
 *
 * @constructor
 * @extends rune.display.Graphic
 * @package
 *
 * @class
 * @classdesc
 * 
 * Represents the graphical pointer of a VTMenu.
 */
rune.ui.VTMenuPointer = function(text, resource) {
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.ui.VTMenuPointer.
     */
    rune.display.Graphic.call(this, 0, 0, 8, 8, "rune_texture_pointer_8x8");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.ui.VTMenuPointer.prototype = Object.create(rune.display.Graphic.prototype);
rune.ui.VTMenuPointer.prototype.constructor = rune.ui.VTMenuPointer;