//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new texture.
 *
 * @constructor
 * @package
 *
 * @param {rune.display.Graphic} graphic Reference to the object to be associated with the texture.
 * @param {HTMLImageElement} resource Reference to the bitmap to be used for texture data.
 *
 * @class
 * @classdesc
 * 
 * Represents a 24- or 32-bit bitmap texture. A texture can be "shared" or 
 * "unique". A shared texture reads its bitmap data from the resource library 
 * and is thus read-only. A unique texture creates its own bitmap data and thus 
 * allocates more memory, but is fully writable.
 */
rune.display.Texture = function(graphic, resource) {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------

	/**
	 * Reference to unique texture data.
	 *
	 * @type {rune.display.Canvas}
	 * @private
	 */
	this.m_canvas = null;
	
	/**
	 * Reference to the object using the texture.
	 *
	 * @type {rune.display.Graphic}
	 * @private
	 */
	this.m_graphic = graphic;
	
	/**
	 * Reference to shared texture data.
	 *
	 * @type {HTMLImageElement}
	 * @private
	 */
	this.m_resource = resource;
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Texture data. When the texture is unique, the texture data consists of an 
 * HTMLCanvasElement object. When the texture is not unique, the texture data 
 * consists of an Image object that is referenced directly from the resource 
 * library. Non-unique data can never be changed or manipulated during runtime.
 *
 * @member {Object} data
 * @memberof rune.display.Texture
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Texture.prototype, "data", {
	/**
	 * @this rune.display.Texture
	 * @ignore
	 */
	get : function() {
		return (this.m_canvas) ? this.m_canvas['element'] : this.m_resource;
	}
});

/**
 * The width of the texture in pixels.
 *
 * @member {number} height
 * @memberof rune.display.Texture
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Texture.prototype, "height", {
	/**
	 * @this rune.display.Texture
	 * @ignore
	 */
	get : function() {
		return this.data.height;
	}
});

/**
 * Whether the texture should use its own pixel buffer or use a shared memory 
 * reference to an object in the resource library. Usually textures do not 
 * have to be unique, but it can be useful when you want to draw on, or 
 * otherwise change the texture during running time.
 *
 * @member {boolean} unique
 * @memberof rune.display.Texture
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Texture.prototype, "unique", {
	/**
	 * @this rune.display.Texture
	 * @ignore
	 */
	get : function() {
		return (this.m_canvas != null);
	}
});

/**
 * The width of the texture in pixels.
 *
 * @member {number} width
 * @memberof rune.display.Texture
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Texture.prototype, "width", {
	/**
	 * @this rune.display.Texture
	 * @ignore
	 */
	get : function() {
		return this.data.width;
	}
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Replaces one specific color with another. Useful for creating multiple 
 * versions of the same texture data with minor color variations. Note that 
 * this method converts the texture data to be unique. The color change cannot 
 * be performed if the texture data is not unique.
 *
 * @param {rune.color.Color24} c1 Old color.
 * @param {rune.color.Color24} c2 New color.
 *
 * @return {undefined}
 */
rune.display.Texture.prototype.replaceColor = function(c1, c2) {
	if (this['unique'] == false) this.m_constructCanvas();
	var image = this.m_canvas['context'].getImageData(0, 0, this.m_canvas.width, this.m_canvas.height);
	for (var i = 0; i < image.data.length; i += 4) {
		  if (image.data[i    ] == c1['r']['value'] &&
			  image.data[i + 1] == c1['g']['value'] &&
			  image.data[i + 2] == c1['b']['value']) {
			  image.data[i    ]  = c2['r']['value'];
			  image.data[i + 1]  = c2['g']['value'];
			  image.data[i + 2]  = c2['b']['value'];
		}
	}
	
	this.m_canvas['context'].putImageData(image, 0, 0);
	this.m_graphic.breakCache();
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Dispose texture.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.display.Texture.prototype.dispose = function() {
	this.m_disposeCanvas();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Texture.prototype.m_construct = function() {
	//@note: Nothing, ATM.
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Construct texture canvas.
 *
 * @throws {Error} If no new canvas can be created.
 *
 * @return {undefined}
 * @private
 */
rune.display.Texture.prototype.m_constructCanvas = function() {
	this.m_disposeCanvas();
	if (this.m_canvas == null) {
		this.m_canvas = new rune.display.Canvas(
			this.m_resource.width,
			this.m_resource.height
		);
		
		this.m_canvas.drawImage(
			this.m_resource,
			0,
			0,
			this.m_resource.width,
			this.m_resource.height
		);
		
	} else throw new Error();
};

/**
 * Dispose texture canvas.
 *
 * @return {undefined}
 * @private
 */
rune.display.Texture.prototype.m_disposeCanvas = function() {
	if (this.m_canvas instanceof rune.display.Canvas) {
		this.m_canvas.dispose();
		this.m_canvas = null;
	}
};