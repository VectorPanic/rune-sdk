//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Graphic class.
 *
 * @constructor
 * @extends rune.display.DisplayObjectContainer
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
 * The Graphic class represents an image file that can be rendered according to 
 * its visual properties in a display list. The class is suitable for graphic 
 * objects that do not require frame-by-frame animation, but that need to be 
 * moved, rotated or otherwise change their visual presentation on the screen.
 */
rune.display.Graphic = function(x, y, width, height, resource) {
	
	//--------------------------------------------------------------------------
	// Protected properties
	//--------------------------------------------------------------------------
	
	/**
	 * Texture data.
	 *
	 * @type {rune.display.Texture}
	 * @protected
	 * @ignore
	 */
	this.m_texture = this.m_getTexture(resource, width, height);
	
	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend rune.display.DisplayObjectContainer.
	 */
	rune.display.DisplayObjectContainer.call(this, x, y, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.Graphic.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.display.Graphic.prototype.constructor = rune.display.Graphic;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Represents the bitmap data used for the graphical representation of the 
 * object. The texture data is drawn to the object's pixel buffer (Canvas) as 
 * part of the internal rendering process.
 *
 * @member {rune.display.Texture} texture
 * @memberof rune.display.Graphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Graphic.prototype, "texture", {
	/**
	 * @this rune.display.Graphic
	 * @ignore
	 */
	get : function() {
		return this.m_texture;
	}
});

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.Graphic.prototype.render = function() {
	if (this.m_cached == false) {
		this.m_renderBackgroundColor();
		this.m_renderTexture();
		this.m_renderChildren();
		this.m_renderGraphics();
		this.m_renderStates();
		
		this.restoreCache();
	}
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Draws texture data to the object's pixel buffer (Canvas). Note that it is 
 * the contents of the pixel buffer that are finally rendered to the screen, 
 * not the texture data.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Graphic.prototype.m_renderTexture = function() {
	this.m_canvas.drawImage(
		this.m_texture["data"],
		0,
		0,
		this.m_texture["data"].width,
		this.m_texture["data"].height
	);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Gets a new texture object.
 *
 * @param {string|HTMLImageElement} [resource] Resource object or resource name.
 * @param {number} [w=1] New texture width.
 * @param {number} [h=1] New texture height.
 *
 * @return {rune.display.Texture}
 * @private
 */
rune.display.Graphic.prototype.m_getTexture = function(resource, w, h) {
	var data = null;
	if(typeof resource === "string") {
		data = this['application']['resources'].get(resource)['data'];
	} else if(resource instanceof HTMLImageElement) {
		data = resource;
	} else {
		data = new Image(w || 1, h || 1);
	}
	
	return new rune.display.Texture(this, data);
};