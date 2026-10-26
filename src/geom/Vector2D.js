//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Vector2D class.
 *
 * @constructor
 * @extends rune.geom.Point
 *
 * @param {number} [x=0.0] The x-component of the vector.
 * @param {number} [y=0.0] The y-component of the vector.
 * 
 * @class
 * @classdesc
 * 
 * The Vector2D class represents a generic two-dimensional vector. The class 
 * provides some basic mathematical operations such as vector addition and 
 * subtraction, and scalar multiplicaton. The class basically works as a Point 
 * but with extra features.
 */
rune.geom.Vector2D = function(x, y) {

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

rune.geom.Vector2D.prototype = Object.create(rune.geom.Point.prototype);
rune.geom.Vector2D.prototype.constructor = rune.geom.Vector2D;

//------------------------------------------------------------------------------
// Private static properties
//------------------------------------------------------------------------------

/**
 * Lookup table for precision rounding.
 *
 * @type {Array.<number>}
 * @private
 */
rune.geom.Vector2D.PRECISION = [
    1,
    10,
    100,
    1000,
    10000,
    100000,
    1000000,
    10000000,
    100000000,
    1000000000,
    10000000000
];

//------------------------------------------------------------------------------
// Override public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.geom.Vector2D.prototype.toString = function() {
	return "[{Vector2D (x=" + this.x + " y=" + this.y + ")}]";
};

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Set the vector axes values to absolute values.
 *
 * @returns {rune.geom.Vector2D}
 */
rune.geom.Vector2D.prototype.abs = function() {
    this['x'] = Math.abs(this['x']);
    this['y'] = Math.abs(this['y']);
    
    return this;
};

/**
 * Adds the argument vector to this vector.
 *
 * @param {rune.geom.Vector2D} vector The second vector.
 *
 * @returns {rune.geom.Vector2D}
 */
rune.geom.Vector2D.prototype.add = function(vector) {
	this['x'] += vector['x'];
	this['y'] += vector['y'];

	return this;
};

/**
 * Returns the cross product of this vector by another.
 *
 * @param {rune.geom.Vector2D} vector The second vector.
 *
 * @returns {number}
 */
rune.geom.Vector2D.prototype.cross = function(vector) {
    return this['x'] * vector['y'] - this['y'] * vector['x'];
};

/**
 * Divides this vector by another vector, or by a number specified as a 
 * floating point number.
 *
 * @param {rune.geom.Vector2D|number} value The value to divide by.
 *
 * @returns {rune.geom.Vector2D}
 */
rune.geom.Vector2D.prototype.divide = function(value) {
    //@note: This violates object-oriented typing rules but it results in a cleaner interface.
    if (value instanceof rune.geom.Vector2D) {
        this['x'] /= value['x'];
        this['y'] /= value['y'];
    } else {
        this['x'] /= value;
        this['y'] /= value;
    }
    
    return this;
};

/**
 * Returns the dot product of this vector by another.
 *
 * @param {rune.geom.Vector2D} vector The second vector.
 *
 * @returns {number}
 */
rune.geom.Vector2D.prototype.dot = function(vector) {
    return vector['x'] * this['x'] + vector['y'] * this['y'];
};

/**
 * Determine if the specified vector is equal to the current vector.
 *
 * @param {rune.geom.Vector2D} vector The second vector.
 *
 * @returns {boolean}
 */
rune.geom.Vector2D.prototype.equals = function(vector) {
    return vector['x'] === this['x'] && vector['y'] === this['y'];
};

/**
 * Returns the magnitude (length) of this vector.
 *
 * @param {boolean} [squared] Request squared magnitude.
 *
 * @returns {number}
 */
rune.geom.Vector2D.prototype.magnitude = function(squared) {
    var x = this['x'];
    var y = this['y'];
    
    var v = x * x + y * y;
    
    return (squared === true) ? v : Math.sqrt(v);
};

/**
 * Multiplies this vector by another vector, or by a number specified as a 
 * floating point number.
 *
 * @param {rune.geom.Vector2D|number} value The value to multiply by.
 *
 * @returns {rune.geom.Vector2D}
 */
rune.geom.Vector2D.prototype.multiply = function(value) {
    //@note: This violates object-oriented typing rules but it results in a cleaner interface.
    if (value instanceof rune.geom.Vector2D) {
        this['x'] *= value['x'];
        this['y'] *= value['y'];
    } else {
        this['x'] *= value;
        this['y'] *= value;
    }
    
    return this;
};

/**
 * Scales the line segment between (0,0) and the current vector to a set length.
 * A scale of zero clears a nonzero vector. A zero vector remains unchanged.
 *
 * @param {number} [scale=1] The scaling value.
 *
 * @returns {rune.geom.Vector2D}
 */
rune.geom.Vector2D.prototype.normalize = function(scale) {
    scale = (scale === undefined) ? 1 : scale;
    var magnitude = this.magnitude();
    if (magnitude > 0) {
        this.divide(magnitude);
        this.multiply(scale);
    }

    return this;
};

/**
 * Reverses this vector i.e multiplies it by -1.
 *
 * @returns {rune.geom.Vector2D}
 */
rune.geom.Vector2D.prototype.reverse = function() {
    this['x'] = -this['x'];
    this['y'] = -this['y'];
    
    return this;
};

/**
 * Rotates the vector with specified radians.
 *
 * @param {number} rads Amount of rotation specified in radians.
 *
 * @returns {rune.geom.Vector2D}
 */
rune.geom.Vector2D.prototype.rotate = function(rads) {
    var cos = Math.cos(rads);
    var sin = Math.sin(rads);
    
    var ox = this.x;
    var oy = this.y;
    
    this['x'] = ox * cos - oy * sin;
    this['y'] = ox * sin + oy * cos;
    
    return this;
};

/**
 * Rotates the vector by provided radians.
 *
 * @param {number} n Number of decimals for precision.
 *
 * @returns {rune.geom.Vector2D}
 */
rune.geom.Vector2D.prototype.round = function(n) {
    n = (n == null) ? 2 : n;
    var p = rune.geom.Vector2D.PRECISION[n] || Math.pow(10, n);
    
    this['x'] = Math.round(this.x * p) / p;
    this['y'] = Math.round(this.y * p) / p;
    
    return this;
};

/**
 * Sets this vector from an angle in radians and a magnitude. Zero radians
 * points right; positive angles turn clockwise in screen coordinates.
 * A negative magnitude reverses the direction. No new object is allocated.
 *
 * @param {number} angle Direction in radians.
 * @param {number} speed Magnitude in the vector's existing units.
 *
 * @returns {rune.geom.Vector2D} This vector.
 */
rune.geom.Vector2D.prototype.setFromAngle = function(angle, speed) {
    this['x'] = Math.cos(angle) * speed;
    this['y'] = Math.sin(angle) * speed;

    return this;
};

/**
 * Sets this vector toward a target from a source position, with the specified
 * magnitude. Coincident positions produce a zero vector. A negative magnitude
 * points away from the target. No new object is allocated or position moved.
 * Read both positions before writing so either may also be this vector.
 *
 * @param {rune.geom.Point} source Starting position.
 * @param {rune.geom.Point} target Target position.
 * @param {number} speed Magnitude in the vector's existing units.
 *
 * @returns {rune.geom.Vector2D} This vector.
 */
rune.geom.Vector2D.prototype.setTowards = function(source, target, speed) {
    this.set(target['x'] - source['x'], target['y'] - source['y']);

    return this.normalize(speed);
};

/**
 * Subtracts the argument vector from this vector.
 *
 * @param {rune.geom.Vector2D} vector The second vector.
 *
 * @returns {rune.geom.Vector2D}
 */
rune.geom.Vector2D.prototype.subtract = function(vector) {
    this['x'] -= vector['x'];
    this['y'] -= vector['y'];
    
    return this;
};
