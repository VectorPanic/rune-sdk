//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Artboard object.
 *
 * @constructor
 * @extends rune.display.DisplayObject
 *
 * @param {number} [x=0.0] The x coordinate of the top-left corner of the artboard.
 * @param {number} [y=0.0] The y coordinate of the top-left corner of the artboard.
 * @param {number} [width=0.0] The width of the artboard in pixels.
 * @param {number} [height=0.0] The width of the artboard in pixels.
 *
 * @class
 * @classdesc
 * 
 * The Artboard class represents a two-dimensional surface for displaying 
 * graphics.
 */
rune.display.Artboard = function(x, y, width, height) {
	
	//--------------------------------------------------------------------------
	// Protected properties
	//--------------------------------------------------------------------------
	
	/**
	 * Specifies the Graphics object that belongs to this Artboard where raster 
	 * drawing commands can occur.
	 *
	 * @type {rune.display.Graphics}
	 * @protected
	 * @ignore
	 */
	this.m_graphics = null;
	
	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend rune.display.DisplayObject
	 */
	rune.display.DisplayObject.call(this, x, y, width, height);
}

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.Artboard.prototype = Object.create(rune.display.DisplayObject.prototype);
rune.display.Artboard.prototype.constructor = rune.display.Artboard;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the object's drawing API. This reference can be used to draw 
 * raster graphics for the object.
 *
 * @member {rune.display.Graphics} graphics
 * @memberof rune.display.Artboard
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Artboard.prototype, "graphics", {
	/**
	 * @this rune.display.Artboard
	 * @ignore
	 */
	get : function() {
		return this.m_graphics;
	}
});

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.Artboard.prototype.m_construct = function() {
	rune.display.DisplayObject.prototype.m_construct.call(this);
	this.m_constructGraphics();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the object's drawing API.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.Artboard.prototype.m_constructGraphics = function() {
	this.m_disposeGraphics();
	if (this.m_graphics == null) {
		this.m_graphics = new rune.display.Graphics(this);
	}
};

/**
 * Renders graphics drawn with the drawing API.
 *
 * @returns {undefined}
 * @ignore
 */
rune.display.Artboard.prototype.m_renderGraphics = function() {
	if (this.m_graphics != null) {
		this.m_graphics.render();
	}
};

/**
 * Destroy the object's drawing API.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.Artboard.prototype.m_disposeGraphics = function() {
	if (this.m_graphics != null) {
		this.m_graphics.dispose();
		this.m_graphics = null;
	}
};