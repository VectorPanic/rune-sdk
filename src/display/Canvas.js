//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new (Rune) Canvas.
 *
 * @constructor
 *
 * @param {number} [width] The width of the object, specified in pixels.
 * @param {number} [height] The height of the object, specified in pixels.
 *
 * @class
 * @classdesc
 * 
 * The Canvas class is a pixel buffer for 32-bit raster graphics and contains 
 * methods for manipulating the pixels included in the buffer. The class is 
 * used to represent all display objects and their current graphic state, ie. 
 * all display objects have their own pixel buffer (Canvas).
 */
rune.display.Canvas = function(width, height) {
	
	//--------------------------------------------------------------------------
	// Protected properties
	//--------------------------------------------------------------------------
	
	/**
	 * The HTMLCanvasElement that represents the pixel buffer.
	 *
	 * @type {Element}
	 * @protected
	 * @ignore
	 */
	this.m_canvas = null;
	
	/**
	 * The CanvasRenderingContext2D used to draw the pixel buffer.
	 *
	 * @type {Object}
	 * @protected
	 * @ignore
	 */
	this.m_context = null;
	
	/**
	 * The height of the pixel buffer.
	 *
	 * @type {number}
	 * @protected
	 * @ignore
	 */
	this.m_height = height || 16;
	
	/**
	 * The width of the pixel buffer.
	 *
	 * @type {number}
	 * @protected
	 * @ignore
	 */
	this.m_width = width || 16;
	
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
 * The HTMLCanvasElement used to draw the pixel buffer.
 *
 * @member {Object} context
 * @memberof rune.display.Canvas
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Canvas.prototype, "context", {
	/**
	 * @this rune.display.Canvas
	 * @ignore
	 */
	get : function() {
		return this.m_context;
	}
});

/**
 * The HTMLCanvasElement that represents the pixel buffer.
 *
 * @member {Element} element
 * @memberof rune.display.Canvas
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Canvas.prototype, "element", {
	/**
	 * @this rune.display.Canvas
	 * @ignore
	 */
	get : function() {
		return this.m_canvas;
	}
});

/**
 * The height of the pixel buffer.
 *
 * @member {number} height
 * @memberof rune.display.Canvas
 * @instance
 */
Object.defineProperty(rune.display.Canvas.prototype, "height", {
	/**
	 * @this rune.display.Canvas
	 * @ignore
	 */
	get : function() {
		return this.m_canvas.height;
	},
	
	/**
	 * @this rune.display.Canvas
	 * @ignore
	 */
	set : function(value) {
		this.m_canvas.height = value;
	}
});

/**
 * Controls whether or not the canvas is smoothed when scaled. If true, the 
 * canvas is smoothed when scaled. If false, the canvas is not smoothed when 
 * scaled.
 *
 * @member {boolean} smoothing
 * @memberof rune.display.Canvas
 * @instance
 * @default false
 */
Object.defineProperty(rune.display.Canvas.prototype, "smoothing", {
	/**
	 * @this rune.display.Canvas
	 * @ignore
	 */
	get : function() {
		return (this.m_canvas.style.imageRendering == "pixelated") ? false : true;
	},
	
	/**
	 * @this rune.display.Canvas
	 * @ignore
	 */
	set : function(value) {
		if (value == true) {
			this.m_canvas.style.imageRendering = "auto";
			this.m_context.imageSmoothingEnabled = true;
		} else {
			this.m_canvas.style.imageRendering = "pixelated";
			this.m_context.imageSmoothingEnabled = false;
		}
	}
});

/**
 * The width of the pixel buffer.
 *
 * @member {number} width
 * @memberof rune.display.Canvas
 * @instance
 */
Object.defineProperty(rune.display.Canvas.prototype, "width", {
	/**
	 * @this rune.display.Canvas
	 * @ignore
	 */
	get : function() {
		return this.m_canvas.width;
	},
	
	/**
	 * @this rune.display.Canvas
	 * @ignore
	 */
	set : function(value) {
		this.m_canvas.width = value;
	}
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Appends the HTMLCanvasElement to the specified DOMElement.
 *
 * @param {HTMLElement} element DOMElement to append to.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.attach = function(element) {
	if (this.m_canvas != null) {
		if (element instanceof HTMLElement) {
			element.appendChild(this.m_canvas);
		}
	}
};

/**
 * Clears the pixel buffer, ie. the value of each pixel is set to 0x00000000.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.clear = function() {
	this.m_context.clearRect(
		0,
		0,
		this.m_canvas.width,
		this.m_canvas.height
	);
};

/**
 * Removes the HTMLCanvasElement from the current DOMElement, ie. his parent.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.detach = function() {
	if (this.m_canvas != null) {
		if (this.m_canvas.parentNode != null) {
			this.m_canvas.parentNode.removeChild(this.m_canvas);
		}
	}
};

/**
 * Frees memory that is used to store the pixel buffer object.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.dispose = function() {
	this.m_disposeCanvas();
	this.m_disposeContext();
};

/**
 * creates a circular arc centered at (x, y) with a radius of r. The path 
 * starts at sa, ends at ea, and travels in the direction given 
 * by counterclockwise (defaulting to clockwise).
 *
 * @param {number} x The horizontal coordinate of the arc's center.
 * @param {number} y The vertical coordinate of the arc's center.
 * @param {number} r The arc's radius. Must be positive.
 * @param {number} sa The angle at which the arc starts in radians, measured from the positive x-axis.
 * @param {number} ea The angle at which the arc ends in radians, measured from the positive x-axis.
 * @param {number} c The color of the line.
 * @param {number} s The thickness (size) of the line.
 * @param {number} [a] An optional boolean value. If true, draws the arc counter-clockwise between the start and end angles. The default is false (clockwise).
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.drawArc = function(x, y, r, sa, ea, c, s, a) {
	this.m_context.save();
	this.m_context.lineWidth = s;
	this.m_context.strokeStyle = c;
	this.m_context.beginPath();
	this.m_context.arc(x, y, r, sa, ea, a);
	this.m_context.stroke();
	this.m_context.restore();
};

/**
 * Fills a rectangular area of pixels with a specified ARGB color.
 *
 * @param {string} c Fill color.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.drawFill = function(c) {
	this.m_context.fillStyle = c;
	this.m_context.fillRect(
		0,
		0,
		this.m_canvas.width,
		this.m_canvas.height
	);
};

/**
 * Draws a 32-bit image to the current pixel buffer.
 *
 * @param {HTMLImageElement} img An element to draw into the context. The specification permits any canvas image source (CanvasImageSource), specifically, a CSSImageValue, an HTMLImageElement, an SVGImageElement, an HTMLVideoElement, an HTMLCanvasElement, an ImageBitmap, or an OffscreenCanvas.
 * @param {number} ox The x-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
 * @param {number} oy The y-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
 * @param {number} ow The width to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in width when drawn.
 * @param {number} oh The height to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in height when drawn.
 * @param {number} [cx] The x-axis coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
 * @param {number} [cy] The y-axis coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
 * @param {number} [cw] The width of the sub-rectangle of the source image to draw into the destination context. If not specified, the entire rectangle from the coordinates specified by ox and oy to the bottom-right corner of the image is used.
 * @param {number} [ch] The height of the sub-rectangle of the source image to draw into the destination context.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.drawImage = function(img, ox, oy, ow, oh, cx, cy, cw, ch) {
	this.m_context.save();
	this.m_context.drawImage(
		img,
		cx || 0,
		cy || 0,
		cw || ow,
		ch || oh,
		ox,
		oy,
		ow,
		oh
	);
	
	this.m_context.restore();
};

/**
 * Draws a picture according to a repeating (tile) pattern.
 *
 * @param {HTMLImageElement} img An element to draw into the context.
 * @param {number} x The x-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
 * @param {number} y The y-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
 * @param {number} w The width to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in width when drawn.
 * @param {number} h The height to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in height when drawn.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.drawImageFill = function(img, x, y, w, h) {
	this.m_context.save();
	this.m_context.fillStyle = this.m_context.createPattern(img, "repeat");
	this.m_context.translate(-x, -y);
	this.m_context.fillRect(x, y, w, h);
	this.m_context.restore();
};

/**
 * Draws a straight line between two points.
 *
 * @param {number} x1 the x-coordinate of the first point.
 * @param {number} y1 the y-coordinate of the first point.
 * @param {number} x2 the x-coordinate of the second point.
 * @param {number} y2 the y-coordinate of the second point.
 * @param {string} c The color of the line.
 * @param {number} s The thickness (size) of the line.
 * @param {number} a The transparency of the line.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.drawLine = function(x1, y1, x2, y2, c, s, a) {
	this.m_context.save();
	this.m_context.globalAlpha = a;
	this.m_context.beginPath();
	this.m_context.translate(0.5, 0.5);
	this.m_context.strokeStyle = c;
	this.m_context.lineWidth = s;
	this.m_context.moveTo(x1, y1);
	this.m_context.lineTo(x2, y2);
	this.m_context.stroke();
	this.m_context.restore();
};

/**
 * Draws a rectangle.
 *
 * @param {number} x The x-position of the rectangle.
 * @param {number} y The y-position of the rectangle.
 * @param {number} w The width of the rectangle.
 * @param {number} h The height of the rectangle.
 * @param {string} c The color of the rectangle.
 * @param {number} s The thickness (size) of the lines of the rectangle.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.drawRect = function(x, y, w, h, c, s) {
	this.m_context.save();
	this.m_context.translate(0.5, 0.5);
	this.m_context.strokeStyle = c;
	this.m_context.lineWidth = s;
	this.m_context.strokeRect(
		x,
		y,
		w,
		h
	);
	
	this.m_context.restore();
};

/**
 * Draws a filled rectangle.
 *
 * @param {number} x The x-position of the rectangle.
 * @param {number} y The y-position of the rectangle.
 * @param {number} w The width of the rectangle.
 * @param {number} h The height of the rectangle.
 * @param {string} c The color of the rectangle.
 * @param {number} a Transparency of the color.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.drawRectFill = function(x, y, w, h, c, a) {
	this.m_context.save();
	this.m_context.globalAlpha = a;
	this.m_context.fillStyle = c;
	this.m_context.fillRect(
		x,
		y,
		w,
		h
	);
	
	this.m_context.restore();
};

/**
 * Determines whether the object specified in the rect parameter intersects 
 * with this canvas object.
 *
 * @param {rune.geom.Rectangle} rect The Rectangle object to compare against.
 *
 * @return {boolean} A value of true if the specified object intersects with this Rectangle object; otherwise false.
 */
rune.display.Canvas.prototype.intersects = function(rect) {
	return rune.geom.Rectangle.intersects(
		0,
		0,
		this.m_canvas.width,
		this.m_canvas.height,
		rect.x,
		rect.y,
		rect['width'],
		rect['height']
	);
};

/**
 * Renders a Display Object according to its visual properties. The rendering 
 * process includes rendering of any sub-objects, etc..
 *
 * @param {rune.display.DisplayObject} obj The object to be rendered.
 * @param {number} [offsetX] Render offset in x direction.
 * @param {number} [offsetY] Render offset in y direction.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.renderDisplayObject = function(obj, offsetX, offsetY) {
	if (obj['hidden'] == false) {
		var frame = obj.getRenderFrame();
			frame.x -= offsetX || 0;
			frame.y -= offsetY || 0;
			
		if (this.intersects(frame)) {
			obj.render();
			
			var fx = (obj['flippedX']) ? -1 : 1;
			var fy = (obj['flippedY']) ? -1 : 1;
			var tx = (frame.x + obj['pivotX']);
			var ty = (frame.y + obj['pivotY']);
			
			this.m_context.save();
			this.m_context.translate(tx, ty);
			this.m_context.scale(fx, fy);
			this.m_context.rotate(obj['rotation'] * rune.util.Math.DEG_TO_RAD);
			this.m_context.translate(-tx, -ty);
			this.m_context.globalAlpha = obj['alpha'];
			this.m_context.drawImage(
				obj['canvas']['element'],
				frame['clipping']['x'],
				frame['clipping']['y'],
				frame['clipping']['width'],
				frame['clipping']['height'],
				frame['x'],
				frame['y'],
				frame['width'],
				frame['height']
			);
			
			this.m_context.restore();
		}	
	}
};

/**
 * Renders a Path object as a series of connected lines.
 *
 * @param {rune.util.Path} path Path to render.
 * @param {number} [offsetX] Displacement in x direction.
 * @param {number} [offsetY] Displacement in y direction.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.renderPath = function(path, offsetX, offsetY) {
	offsetX = offsetX || 0;
	offsetY = offsetY || 0;
	
	var a = null;
	var b = null;
	
	for (var i = 0; i < path['length']; i++) {
		a = path.getAt(i + 0);
		b = path.getAt(i + 1);
		
		if (a && b) {
			this.drawLine(
				a['x'] - offsetX,
				a['y'] - offsetY,
				b['x'] - offsetX,
				b['y'] - offsetY,
				path.color,
				path.thickness,
				path.alpha
			);
		}
	}
};

/**
 * Renders Tiles from a Tilemap.
 *
 * @param {rune.tilemap.Tilemap} map The map to be rendered.
 * @param {rune.geom.Rectangle} rect Which part of the map to render.
 * @param {number} buffer Index to the buffer (layer) to be rendered.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.renderTiles = function(map, rect, buffer) {
	var ti = (buffer == 0) ? map.getBackBufferInRect(rect) : map.getFrontBufferInRect(rect);
	var wt = map['widthInTiles'];
	var ht = map['heightInTiles'];
	var tw = map['tileWidth'];
	var th = map['tileHeight'];
	var ox = rect['x'] % tw;
	var oy = rect['y'] % th;
	var tv = 0;
	var tp = null;
	
	if (ox < 0) {
		ox = tw + ox;
	}
	
	if (oy < 0) {
		oy = th + oy;
	}
	
	var ua = Math.floor(rect['x'] / tw);
	var ub = Math.floor(rect['y'] / th);
	
	for (var i = 0; i < ti.length; i++) {
		var tb = (buffer == 0) ? 'back' : 'front';
		tv = map[tb].getTileValueAt(ti[i]);
		if (tv > 0) {
			tp = map.getTileTextureRectOf(tv);
			this.m_context.drawImage(
				map['texture'],
				tp.x,
				tp.y,
				tw,
				th,
				(((ti[i] % wt) - ua) * tw) - ox,
				((Math.floor(ti[i] / wt) - ub) * th) - oy,
				tw,
				th
			);
		}
	}
};

/**
 * Resizes the canvas object to specified dimensions.
 *
 * @param {number} width The new width of the canvas.
 * @param {number} height The new height of the canvas.
 *
 * @return {undefined}
 */
rune.display.Canvas.prototype.resize = function(width, height) {
	this.m_canvas.width = width;
	this.m_canvas.height = height;
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
rune.display.Canvas.prototype.m_construct = function() {
	this.m_constructCanvas();
	this.m_constructContext();
};

/**
 * Creates the HTMLCanvasElement that represents the pixel buffer.
 *
 * @throws {Error} If a canvas already exists.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Canvas.prototype.m_constructCanvas = function() {
	this.m_disposeCanvas();
	if (this.m_canvas === null) {
		this.m_canvas = document.createElement('canvas');
		this.m_canvas.width  = this.m_width;
		this.m_canvas.height = this.m_height;
		this.m_canvas.style.imageRendering = "pixelated";
	} else throw new Error();
};

/**
 * Creates the CanvasRenderingContext2D used to draw the pixel buffer.
 *
 * @throws {Error} If a context already exists.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Canvas.prototype.m_constructContext = function() {
	this.m_disposeContext();
	if (this.m_context == null && this.m_canvas instanceof HTMLCanvasElement ) {
		this.m_context = this.m_canvas.getContext("2d", {
			willReadFrequently: true
		});
		this.m_context.imageSmoothingEnabled = false;
		this.m_context.imageSmoothingQuality = "low";
	} else throw new Error();
};

/**
 * Deletes current context.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Canvas.prototype.m_disposeContext = function() {
	if (this.m_context != null) {
		this.m_context  = null;
	};
};

/**
 * Deletes current canvas.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Canvas.prototype.m_disposeCanvas = function() {
	if (this.m_canvas instanceof HTMLCanvasElement) {
		if (this.m_canvas.parentNode != null) {
			this.m_canvas.parentNode.removeChild(this.m_canvas);
		}
		
		this.m_canvas = null;
	}
};