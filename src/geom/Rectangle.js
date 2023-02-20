//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Rectangle object with the top-left corner specified by the x 
 * and y parameters and with the specified width and height parameters.
 *
 * @constructor
 * @extends rune.geom.Point
 *
 * @param {number} [x=0.0] The x coordinate of the top-left corner of the rectangle.
 * @param {number} [y=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [width=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [height=0.0] The height of the rectangle, in pixels.
 * 
 * @class
 * @classdesc
 * 
 * A Rectangle object is an area defined by its position, as indicated by its 
 * top-left corner point (x, y) and by its width and its height.
 */
rune.geom.Rectangle = function(x, y, width, height) {

	//--------------------------------------------------------------------------
	// Protected properties
	//--------------------------------------------------------------------------

	/**
	 * The width of the rectangle, in pixels.
	 *
	 * @type {number}
	 * @protected
	 * @ignore
	 */
	this.m_width = width || 0.0;

	/**
	 * The height of the rectangle, in pixels.
	 *
	 * @type {number}
	 * @protected
	 * @ignore
	 */
	this.m_height = height || 0.0;

	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend rune.geom.Point
	 */
	rune.geom.Point.call(this, x, y);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.geom.Rectangle.prototype = Object.create(rune.geom.Point.prototype);
rune.geom.Rectangle.prototype.constructor = rune.geom.Rectangle;

//------------------------------------------------------------------------------
// Public static methods
//------------------------------------------------------------------------------

/**
 * Determines whether a point is contained within a rectangular region.
 *
 * @param {number} x1 The x coordinate of the rectangle.
 * @param {number} y1 The y coordinate of the rectangle.
 * @param {number} w1 The width of the rectangle.
 * @param {number} h1 The height of the rectangle.
 * @param {number} x2 The x coordinate of the point.
 * @param {number} y2 The y coordinate of the point.
 *
 * @return {boolean} A value of true if the rectangle contains the specified point; otherwise false.
 */
rune.geom.Rectangle.containsPoint = function(x1, y1, w1, h1, x2, y2) {
	return (x2 >= x1 &&
			x2 <= x1 + w1 &&
			y2 >= y1 &&
			y2 <= y1 + h1);
};

/**
 * Determines if a rectangle is contained by another rectangle.
 *
 * @param {number} x1 The x coordinate of the first rectangle.
 * @param {number} y1 The y coordinate of the first rectangle.
 * @param {number} w1 The width of the first rectangle.
 * @param {number} h1 The height of the first rectangle.
 * @param {number} x2 The x coordinate of the second rectangle.
 * @param {number} y2 The y coordinate of the second rectangle.
 * @param {number} w2 The width of the second rectangle.
 * @param {number} h2 The height of the second rectangle.
 *
 * @return {boolean} A value of true if the rectangle is contained by another rectangle; otherwise false.
 */
rune.geom.Rectangle.containsRectangle = function(x1, y1, w1, h1, x2, y2, w2, h2) {
	if ((w2 * h2) > (w1 * h1)) return false;
	
	return ((x2 >= x1 && x2 <= x1 + w1) &&
			(x2  + w2 >= x1 && x2 + w2 <= x1 + w1) &&
			(y2 >= y1 && y2 <= y1 + h1) &&
			(y2  + h2 >= y1 && y2 + h2 <= y1 + h2));
};

/**
 * Creates a clone of a Rectangle object.
 *
 * @param {rune.geom.Rectangle} from The Rectangle object to be cloned.
 *
 * @return {rune.geom.Rectangle} The new, cloned Rectangle object.
 */
rune.geom.Rectangle.clone = function(from) {
	return new rune.geom.Rectangle(
		from['x'],
		from['y'],
		from['width'],
		from['height']
	);
};

/**
 * Copies the properties of one Rectangle object to another Rectangle object.
 *
 * @param {rune.geom.Rectangle} from Rectangle objects to copy from.
 * @param {rune.geom.Rectangle} to Rectangle objects to copy to.
 *
 * @return {rune.geom.Rectangle} The rectangle object that represents the copy.
 */
rune.geom.Rectangle.copy = function(from, to) {
	to['x'] = from['x'];
	to['y'] = from['y'];
	to['width']  = from['width'];
	to['height'] = from['height'];
	
	return to;
};

/**
 * Returns the area of intersection as a Rectangle object.
 * 
 * @param {number} x1 The x coordinate of the first rectangle.
 * @param {number} y1 The x coordinate of the first rectangle.
 * @param {number} w1 The width of the first rectangle.
 * @param {number} h1 The height of the first rectangle.
 * @param {number} x2 The x coordinate of the second rectangle.
 * @param {number} y2 The y coordinate of the second rectangle.
 * @param {number} w2 The width of the second rectangle.
 * @param {number} h2 The height of the second rectangle.
 * @param {rune.geom.Rectangle} [o] Store results in this object.
 * 
 * @return {rune.geom.Rectangle} A Rectangle object that equals the area of intersection.
 */
rune.geom.Rectangle.intersection = function(x1, y1, w1, h1, x2, y2, w2, h2, o) {
	o = o || new rune.geom.Rectangle(0, 0, 0, 0);
	if (rune.geom.Rectangle.intersects(x1, y1, w1, h1, x2, y2, w2, h2)) {
		o['x'] = Math.max(x1, x2);
		o['y'] = Math.max(y1, y2);
		o['width']  = Math.min(x1 + w1,  x2 + w2) - o['x'];
		o['height'] = Math.min(y1 + h1,  y2 + h2) - o['y'];
	}
	
	return o;
};

/**
 * Determine whether or not two rectangles intersects.
 * 
 * @param {number} x1 The x coordinate of the first rectangle.
 * @param {number} y1 The x coordinate of the first rectangle.
 * @param {number} w1 The width of the first rectangle.
 * @param {number} h1 The height of the first rectangle.
 * @param {number} x2 The x coordinate of the second rectangle.
 * @param {number} y2 The y coordinate of the second rectangle.
 * @param {number} w2 The width of the second rectangle.
 * @param {number} h2 The height of the second rectangle.
 * 
 * @return {boolean} A value of true if the specified point intersects with this rectangle; otherwise false.
 */
rune.geom.Rectangle.intersects = function(x1, y1, w1, h1, x2, y2, w2, h2) {
	return ((x1 <= x2 + w2) && 
			(x1  + w1 > x2) && 
			(y1 <= y2 + h2) && 
			(y1  + h1 > y2));
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * The sum of the y and height properties.
 *
 * @member {number} bottom
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "bottom", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return this['y'] + this['height'];
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['y'] = value - this['height'];
	}
});

/**
 * The location of the Rectangle object's bottom-left corner, determined by the
 * values of the left and bottom properties.
 *
 * @member {rune.geom.Rectangle} bottomLeft
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "bottomLeft", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return new rune.geom.Point(this['x'], this['y'] + this['height']);
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['x'] = value.x;
		this['y'] = value.y - this['height'];
	}
});

/**
 * The location of the Rectangle object's bottom-right corner, determined by the
 * values of the right and bottom properties.
 *
 * @member {rune.geom.Rectangle} bottomRight
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "bottomRight", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return new rune.geom.Point(this['x'] + this['width'], this['y'] + this['height']);
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['x'] = value['x'] - this['width'];
		this['y'] = value['y'] - this['height'];
	}
});

/**
 * The center point of the rectangle object.
 *
 * @member {rune.geom.Point} center
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "center", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return new rune.geom.Point(this['x'] + (this['width'] >> 1), this['y'] + (this['height'] >> 1));
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['x'] = value.x - (this['width']  >> 1);
		this['y'] = value.y - (this['height'] >> 1);
	}
});

/**
 * The x coordinate of the center of the object.
 *
 * @member {number} centerX
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "centerX", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return this['x'] + (this['width'] >> 1);
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['x'] = value - (this['width'] >> 1);
	}
});

/**
 * The y coordinate of the center of the object.
 *
 * @member {number} centerY
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "centerY", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return this['y'] + (this['height'] >> 1);
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['y'] = value - (this['height']  >> 1);
	}
});

/**
 * The height of the rectangle, in pixels.
 *
 * @member {number} height
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "height", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return this.m_height;
	},

	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this.m_height = value;
	}
});

/**
 * The x coordinate of the top-left corner of the rectangle.
 *
 * @member {number} left
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "left", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return this['x'];
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['x'] = value;
	}
});

/**
 * The sum of the x and width properties.
 *
 * @member {number} right
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "right", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return this['x'] + this['width'];
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['x'] = value - this['width'];
	}
});

/**
 * The size of the Rectangle object, expressed as a Point object with the values
 * of the width and height properties.
 *
 * @member {rune.geom.Point} size
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "size", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return new rune.geom.Point(
			this['width'],
			this['height']
		);
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['width']  = value['x'];
		this['height'] = value['y'];
	}
});

/**
 * The y coordinate of the top-left corner of the rectangle.
 *
 * @member {number} top
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "top", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return this['y'];
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['y'] = value;
	}
});

/**
 * The location of the Rectangle object's top-left corner, determined by the x 
 * and y coordinates of the point.
 *
 * @member {rune.geom.Point} topLeft
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "topLeft", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return new rune.geom.Point(this['x'], this['y']);
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['x'] = value['x'];
		this['y'] = value['y'];
	}
});

/**
 * The location of the Rectangle object's top-right corner, determined by the x 
 * and y coordinates of the point.
 *
 * @member {rune.geom.Point} topRight
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "topRight", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return new rune.geom.Point(this['x'] + this['width'], this['y']);
	},
	
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this['x'] = value.x - this['width'];
		this['y'] = value.y;
	}
});

/**
 * The width of the rectangle, in pixels.
 *
 * @member {number} width
 * @memberof rune.geom.Rectangle
 * @instance
 */
Object.defineProperty(rune.geom.Rectangle.prototype, "width", {
	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	get : function() {
		return this.m_width;
	},

	/**
	 * @this rune.geom.Rectangle
	 * @ignore
	 */
	set : function(value) {
		this.m_width = value;
	}
});

//------------------------------------------------------------------------------
// Override public prototype methods
//------------------------------------------------------------------------------

/**
 * Builds and returns a string that lists the horizontal and vertical positions 
 * and the width and height of the Rectangle object.
 *
 * @return {string}
 */
rune.geom.Rectangle.prototype.toString = function() {
	return "[{Rectangle (x=" + this['x'] + " y=" + this['y'] + " width=" + this['width'] + " height=" + this['height'] + ")}]";
};

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Determines whether the specified point is contained within the rectangular 
 * region defined by this Rectangle object.
 *
 * @param {rune.geom.Point} point The point, as represented by its x and y coordinates.
 *
 * @return {boolean} A value of true if the Rectangle object contains the specified point; otherwise false.
 */
rune.geom.Rectangle.prototype.containsPoint = function(point) {
	return rune.geom.Rectangle.containsPoint(
		this['x'],
		this['y'],
		this['width'],
		this['height'],
		point['x'],
		point['y']
	);
};

/**
 * Determines whether the Rectangle object specified by the rect parameter is 
 * contained within this Rectangle object. A Rectangle object is said to contain
 * another if the second Rectangle object falls entirely within the boundaries 
 * of the first.
 *
 * @param {rune.geom.Rectangle} rect The Rectangle object being checked.
 *
 * @return {boolean} A value of true if the Rectangle object that you specify is contained by this Rectangle object; otherwise false.
 */
rune.geom.Rectangle.prototype.containsRectangle = function(rect) {
	return rune.geom.Rectangle.containsRectangle(
		this['x'],
		this['y'],
		this['width'],
		this['height'],
		rect['x'],
		rect['y'],
		rect['width'],
		rect['height']
	);
};

/**
 * If the Rectangle object specified in the toIntersect parameter intersects 
 * with this Rectangle object, returns the area of intersection as a Rectangle 
 * object. If the rectangles do not intersect, this method returns an empty 
 * Rectangle object with its properties set to 0.
 *
 * @param {rune.geom.Rectangle} toIntersect The Rectangle object to compare against to see if it intersects with this Rectangle object.
 * @param {rune.geom.Rectangle} [output] A Rectangle object to store the intersection results in.
 *
 * @return {rune.geom.Rectangle} A Rectangle object that equals the area of intersection.
 */
rune.geom.Rectangle.prototype.intersection = function(toIntersect, output) {
	return rune.geom.Rectangle.intersection(
		this['x'],
		this['y'],
		this['width'],
		this['height'],
		toIntersect['x'],
		toIntersect['y'],
		toIntersect['width'],
		toIntersect['height'],
		output
	);
};

/**
 * Determines whether the object specified in the toIntersect parameter 
 * intersects with this Rectangle object.
 *
 * @param {rune.geom.Rectangle} toIntersect The Rectangle object to compare against this Rectangle object.
 *
 * @return {boolean} A value of true if the specified object intersects with this Rectangle object; otherwise false.
 */
rune.geom.Rectangle.prototype.intersects = function(toIntersect) {
	return rune.geom.Rectangle.intersects(
		this['x'],
		this['y'],
		this['width'],
		this['height'],
		toIntersect['x'],
		toIntersect['y'],
		toIntersect['width'],
		toIntersect['height']
	);
};