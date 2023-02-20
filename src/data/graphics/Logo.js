//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Logo class.
 *
 * @constructor
 * @extends rune.display.Graphic
 *
 * @param {number} [x=0.0] The x coordinate of the top-left corner of the rectangle.
 * @param {number} [y=0.0] The y coordinate of the top-left corner of the rectangle.
 * 
 * @class
 * @classdesc
 * 
 * The Logo class represents a logotype for Rune. The class inherits from the 
 * Graphic class and implements nothing but a predetermined texture.
 */
rune.data.Logo = function(x, y) {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend Graphic.
     */
    rune.display.Graphic.call(this, x || 0, y || 0, 64, 32, "rune_texture_logo_text_64x32");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.data.Logo.prototype = Object.create(rune.display.Graphic.prototype);
rune.data.Logo.prototype.constructor = rune.data.Logo;

//--------------------------------------------------------------------------
// Override public prototype methods
//--------------------------------------------------------------------------

/**
 * @override
 */
rune.data.Logo.prototype.init = function() {
    rune.display.Graphic.prototype.init.call(this);
    this.m_initHitbox();
};

//--------------------------------------------------------------------------
// Private prototype methods
//--------------------------------------------------------------------------

/**
 * Make the hitbox slightly smaller than the object.
 *
 * @return {undefined}
 * @private
 */
rune.data.Logo.prototype.m_initHitbox = function() {
    this['hitbox'].set(
        0,
        6,
        64,
        21
    );
};