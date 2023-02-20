//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Frame object.
 *
 * @constructor
 * @extends rune.geom.Rectangle
 *
 * @param {number} [fx=0] Frame x.
 * @param {number} [fy=0] Frame y.
 * @param {number} [fw=0] Frame width.
 * @param {number} [fh=0] Frame height.
 * @param {number} [cx=0] Clipping x
 * @param {number} [cy=0] Clipping y
 * @param {number} [cw=0] Clipping width.
 * @param {number} [ch=0] Clipping height.
 *
 * @class
 * @classdesc
 * 
 * The Frame class is used to define the size and position of a display object 
 * at the time of rendering. Usually this item corresponds to the same size 
 * and position as the display item it represents, but there are exceptions.
 */
rune.display.Frame = function(fx, fy, fw, fh, cx, cy, cw, ch) {
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------

    /**
     * Clipping data.
     *
     * @type {rune.geom.Rectangle}
     * @protected
     * @ignore
     */
    this.m_clipping = new rune.geom.Rectangle(cx, cy, cw, ch);
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend Rectangle.
     */
    rune.geom.Rectangle.call(this, fx, fy, fw, fh);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.Frame.prototype = Object.create(rune.geom.Rectangle.prototype);
rune.display.Frame.prototype.constructor = rune.display.Frame;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Clipping data.
 *
 * @member {rune.geom.Rectangle} clipping
 * @memberof rune.display.Frame
 * @instance
 * @readonly
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "clipping", {
    /**
     * @this rune.display.Frame
     * @ignore
     */
    get : function() {
        return this.m_clipping;
    }
});