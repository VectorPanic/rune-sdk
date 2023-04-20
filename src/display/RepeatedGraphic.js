//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object.
 *
 * @constructor
 * @extends rune.display.Graphic
 *
 * @param {number} [x=0.0] The x coordinate of the top-left corner of the rectangle.
 * @param {number} [y=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [width=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [height=0.0] The height of the rectangle, in pixels.
 * @param {string} [resource=""] Name of the resource to be used as texture data. 
 *
 * @class
 * @classdesc
 * 
 * The class RepeatedGraphic serves as a representation of a bitmap texture that 
 * can be repeated over a rectangular surface. This surface can be larger in 
 * size than the texture used to fill it.
 */
rune.display.RepeatedGraphic = function(x, y, width, height, resource) {
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------

    /**
     * The offset of the texture in x and y values.
     *
     * @type {rune.geom.Point}
     * @protected
     * @ignore
     */
    this.m_offset = new rune.geom.Point(0, 0);
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend Graphics.
     */
    rune.display.Graphic.call(this, x, y, width, height, resource);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.RepeatedGraphic.prototype = Object.create(rune.display.Graphic.prototype);
rune.display.RepeatedGraphic.prototype.constructor = rune.display.RepeatedGraphic;

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The displacement of texture data in the x-direction.
 * Can be continuously updated to create a scrolling effect.
 *
 * @member {number} offsetX
 * @memberof rune.display.RepeatedGraphic
 * @instance
 */
Object.defineProperty(rune.display.RepeatedGraphic.prototype, "offsetX", {
    /**
     * @this rune.display.RepeatedGraphic
     * @ignore
     */
    get : function() {
        return this.m_offset.x;
    },
    
    /**
     * @this rune.display.RepeatedGraphic
     * @ignore
     */
    set : function(value) {
        if (this.m_offset.x != value) {
            this.m_offset.x  = value;
            
            this.breakCache();
        }
    }
});

/**
 * The displacement of texture data in the y-direction.
 * Can be continuously updated to create a scrolling effect.
 *
 * @member {number} offsetY
 * @memberof rune.display.RepeatedGraphic
 * @instance
 */
Object.defineProperty(rune.display.RepeatedGraphic.prototype, "offsetY", {
    /**
     * @this rune.display.RepeatedGraphic
     * @ignore
     */
    get : function() {
        return this.m_offset.y;
    },
    
    /**
     * @this rune.display.RepeatedGraphic
     * @ignore
     */
    set : function(value) {
        if (this.m_offset.y != value) {
            this.m_offset.y  = value;
            
            this.breakCache();
        }
    }
});

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.RepeatedGraphic.prototype.m_renderTexture = function() {
    this.m_canvas.drawImageFill(
        this.m_texture["data"],
        this.m_offset.x,
        this.m_offset.y,
        this.width,
        this.height
    );
};