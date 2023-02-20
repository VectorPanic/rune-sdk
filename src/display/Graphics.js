//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Graphics class.
 *
 * @constructor
 *
 * @param {rune.display.DisplayObject} obj The display object to which the class is linked.
 *
 * @class
 * @classdesc
 * 
 * The Graphics class represents a programmable interface (API) for drawing 
 * raster graphics to a display object. The class includes a set of methods for 
 * drawing raster shapes and copying pixels from bitmaps. Note that drawing 
 * commands addressed to the Graphics class must be made from the application's 
 * update loop, as drawing commands are queued and executed automatically via 
 * the rendering loop.
 */
rune.display.Graphics = function(obj) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Whether the object should clear its rendering queue after it has 
     * completed its rendering of the current queue. By default, the queue is 
     * preserved, which results in drawn graphics remaining until it is 
     * manually cleared, or changed via new drawing commands.
     *
     * @type {boolean}
     * @default false
     */
    this.autoClear = false;
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------

	/**
	 * The display object that the drawing API is connected to, ie where 
     * graphics are drawn when drawing commands are called.
	 *
	 * @type {rune.display.DisplayObject}
	 * @private
	 */
	this.m_displayObject = obj;
	
	/**
	 * Queue list for drawing commands.
	 *
	 * @type {rune.util.Stack}
	 * @private
	 */
	this.m_queue = null;
	
	//--------------------------------------------------------------------------
	// Constructor call
	//--------------------------------------------------------------------------

	/**
	 * Invokes secondary class constructor.
	 */
	this.m_construct();
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Returns the number of drawing calls queued in the Graphics object. If the 
 * result is 0, no graphics are drawn by the API.
 *
 * @member {number} numOperations
 * @memberof rune.display.Graphics
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Graphics.prototype, "numOperations", {
    /**
     * @this rune.display.Graphics
     * @ignore
     */
    get: function() {
        return this.m_queue['length'];
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Clears the graphics that were drawn with this Graphics object.
 *
 * @returns {undefined}
 */
rune.display.Graphics.prototype.clear = function() {
	this.m_queue.clear();
};

/**
 * Draws a circular arc centered at (x, y) with a radius of r. The path starts 
 * at sa, ends at ea, and travels in the direction given by counterclockwise 
 * (defaulting to clockwise).
 *
 * @param {number} x The horizontal coordinate of the arc's center.
 * @param {number} y The vertical coordinate of the arc's center.
 * @param {number} r The arc's radius. Must be positive.
 * @param {number} sa The angle at which the arc starts in radians, measured from the positive x-axis.
 * @param {number} ea The angle at which the arc ends in radians, measured from the positive x-axis.
 * @param {string} c The color of the line.
 * @param {number} s The thickness (size) of the line.
 * @param {number} [a] An optional boolean value. If true, draws the arc counter-clockwise between the start and end angles. The default is false (clockwise).
 *
 * @returns {undefined}
 */
rune.display.Graphics.prototype.drawArc = function(x, y, r, sa, ea, c, s, a) {
	if (this.m_displayObject != null) {
		this.m_displayObject.breakCache();
		var scope = this.m_displayObject["canvas"];
		this.m_queue.add(scope.drawArc, scope, [x, y, r, sa, ea, c, s, a]);
	}
};

/**
 * Draw fill color.
 *
 * @param {string} c Fill color, specified as a DOMString.
 *
 * @returns {undefined}
 */
rune.display.Graphics.prototype.drawFill = function(c) {
	if (this.m_displayObject != null) {
		this.m_displayObject.breakCache();
		var scope = this.m_displayObject["canvas"];
		this.m_queue.add(scope.drawFill, scope, [c]);
	}
};

/**
 * Draw a (32-bit) bitmap image.
 *
 * @param {HTMLImageElement} img Image to draw.
 * @param {number} ox Image x position.
 * @param {number} oy Image y position.
 * @param {number} ow Image width.
 * @param {number} oh Image height.
 * @param {number} [cx] Crop x position.
 * @param {number} [cy] Crop y position.
 * @param {number} [cw] Crop width.
 * @param {number} [ch] Crop height.
 *
 * @returns {undefined}
 */
rune.display.Graphics.prototype.drawImage = function(img, ox, oy, ow, oh, cx, cy, cw, ch) {
	if (this.m_displayObject != null) {
		this.m_displayObject.breakCache();
		var scope = this.m_displayObject["canvas"];
		this.m_queue.add(scope.drawImage, scope, [img, ox, oy, ow, oh, cx, cy, cw, ch]);
	}
};

/**
 * Draw with a picture as a flood filling.
 *
 * @param {HTMLImageElement} img Image to draw.
 * @param {number} x Image x position.
 * @param {number} y Image y position.
 * @param {number} w Image width.
 * @param {number} h Image height.
 *
 * @returns {undefined}
 */
rune.display.Graphics.prototype.drawImageFill = function(img, x, y, w, h) {
	if (this.m_displayObject != null) {
		this.m_displayObject.breakCache();
		var scope = this.m_displayObject["canvas"];
		this.m_queue.add(scope.drawImageFill, scope, [img, x, y, w, h]);
	}
};

/**
 * Draw a line.
 *
 * @param {number} x1 Start x position.
 * @param {number} y1 Start y position.
 * @param {number} x2 End x position.
 * @param {number} y2 End y position.
 * @param {string} c Line color.
 * @param {number} s Line thickness.
 *
 * @returns {undefined}
 */
rune.display.Graphics.prototype.drawLine = function(x1, y1, x2, y2, c, s) {
	if (this.m_displayObject != null) {
		this.m_displayObject.breakCache();
		var scope = this.m_displayObject["canvas"];
		this.m_queue.add(scope.drawLine, scope, [x1, y1, x2, y2, c, s]);
	}
};

/**
 * Draw a rectangle.
 *
 * @param {number} x The x position of the upper left corner of the rectangle.
 * @param {number} y The y position of the upper left corner of the rectangle.
 * @param {number} w The width of the rectangle.
 * @param {number} h The height of the rectangle.
 * @param {string} c Line color.
 * @param {number} s Line thickness.
 *
 * @returns {undefined}
 */
rune.display.Graphics.prototype.drawRect = function(x, y, w, h, c, s) {
	if (this.m_displayObject != null) {
		this.m_displayObject.breakCache();
		var scope = this.m_displayObject["canvas"];
		this.m_queue.add(scope.drawRect, scope, [x, y, w, h, c, s]);
	}
};

/**
 * Draw a filled rectangle.
 *
 * @param {number} x The x position of the upper left corner of the rectangle.
 * @param {number} y The y position of the upper left corner of the rectangle.
 * @param {number} w The width of the rectangle.
 * @param {number} h The height of the rectangle.
 * @param {string} c Fill color.
 *
 * @returns {undefined}
 */
rune.display.Graphics.prototype.drawRectFill = function(x, y, w, h, c) {
	if (this.m_displayObject != null) {
		this.m_displayObject.breakCache();
		var scope = this.m_displayObject["canvas"];
		this.m_queue.add(scope.drawRectFill, scope, [x, y, w, h, c]);
	}
};

//------------------------------------------------------------------------------
// Internal prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Free up resources allocated by the object.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.display.Graphics.prototype.dispose = function() {
	this.m_disposeQueue();
};

/**
 * Renders graphics.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.display.Graphics.prototype.render = function() {
	this.m_renderQueue();
    if (this.autoClear == true) {
        this.clear();
    }
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.Graphics.prototype.m_construct = function() {
	this.m_constructQueue();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the object that represents the queue of draw commands.
 *
 * @returns {undefined}
 * @private
 */
rune.display.Graphics.prototype.m_constructQueue = function() {
	this.m_disposeQueue();
	if (this.m_queue == null) {
		this.m_queue = new rune.util.Stack();
	}
};

/**
 * Renders the drawing commands added to the object's queue list.
 *
 * @returns {undefined}
 * @private
 */
rune.display.Graphics.prototype.m_renderQueue = function() {
	if (this.m_queue != null) {
		this.m_queue.execute();
	}
};

/**
 * Removes and frees memory allocated by the queue list.
 *
 * @returns {undefined}
 * @private
 */
rune.display.Graphics.prototype.m_disposeQueue = function() {
	if (this.m_queue instanceof rune.util.Stack) {
		this.m_queue.dispose();
		this.m_queue = null;
	}
};