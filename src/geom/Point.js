//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new point.
 *
 * @constructor
 *
 * @param {number} [x=0.0] The horizontal coordinate.
 * @param {number} [y=0.0] The vertical coordinate.
 * 
 * @class
 * @classdesc
 * 
 * The Point class represents a location in a two-dimensional coordinate system,
 * where x represents the horizontal axis and y represents the vertical axis.
 */
rune.geom.Point = function(x, y) {

    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------

    /**
     * The horizontal coordinate of the point. The default value is 0.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_x = x || 0.0;

    /**
     * The vertical coordinate of the point. The default value is 0.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_y = y || 0.0;
};

//------------------------------------------------------------------------------
// Public static methods
//------------------------------------------------------------------------------

/**
 * Returns the distance between two points.
 *
 * @param {number} x1 The x coordinate of the first point.
 * @param {number} y1 The y coordinate of the first point.
 * @param {number} x2 The x coordinate of the second point.
 * @param {number} y2 The y coordinate of the second point.
 *
 * @return {number}
 */
rune.geom.Point.distance = function(x1, y1, x2, y2) {
    var x = x1 - x2;
    var y = y1 - y2;
    
    return Math.sqrt(x * x + y * y);
};

/**
 * Returns the squared distance between two points without calculating a square
 * root. Useful for comparing distances against squared thresholds.
 *
 * @param {number} x1 The x coordinate of the first point.
 * @param {number} y1 The y coordinate of the first point.
 * @param {number} x2 The x coordinate of the second point.
 * @param {number} y2 The y coordinate of the second point.
 *
 * @return {number} The squared distance between the points.
 */
rune.geom.Point.distanceSquared = function(x1, y1, x2, y2) {
    var x = x1 - x2;
    var y = y1 - y2;

    return x * x + y * y;
};

/**
 * Returns the linear interpolation point between the two given points.
 *
 * @param {number} x1 The x coordinate of the first point.
 * @param {number} y1 The y coordinate of the first point.
 * @param {number} x2 The x coordinate of the second point.
 * @param {number} y2 The y coordinate of the second point.
 * @param {number} [f] The level of interpolation between the two points.
 * @param {rune.geom.Point} [o] Store results in this object.
 *
 * @return {rune.geom.Point} The new, interpolated point.
 */
rune.geom.Point.interpolate = function(x1, y1, x2, y2, f, o) {
    f = f || 0;
    o = o || new rune.geom.Point();
    
    o['x'] = rune.util.Math.lerp(x1, x2, f);
    o['y'] = rune.util.Math.lerp(y1, y2, f);

    return o;
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * The horizontal coordinate of the point. The default value is 0.
 *
 * @member {number} x
 * @memberof rune.geom.Point
 * @instance
 */
Object.defineProperty(rune.geom.Point.prototype, "x", {
    /**
     * @this rune.geom.Point
     * @ignore
     */
    get : function() {
        return this.m_x;
    },

    /**
     * @this rune.geom.Point
     * @ignore
     */
    set : function(value) {
        this.m_x = value;
    }
});

/**
 * The vertical coordinate of the point. The default value is 0.
 *
 * @member {number} y
 * @memberof rune.geom.Point
 * @instance
 */
Object.defineProperty(rune.geom.Point.prototype, "y", {
    /**
     * @this rune.geom.Point
     * @ignore
     */
    get : function() {
        return this.m_y;
    },

    /**
     * @this rune.geom.Point
     * @ignore
     */
    set : function(value) {
        this.m_y = value;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Copies the coordinates of the specified point to this point.
 *
 * @param {rune.geom.Point} point The point to copy coordinates from.
 *
 * @return {rune.geom.Point} This point.
 */
rune.geom.Point.prototype.copyFrom = function(point) {
    var x = point['x'];
    var y = point['y'];

    this['x'] = x;
    this['y'] = y;

    return this;
};

/**
 * Returns the distance between the current and specified point.
 *
 * @param {rune.geom.Point} point The specified point.
 *
 * @return {number}
 */
rune.geom.Point.prototype.distance = function(point) {
    return rune.geom.Point.distance(
        this['x'],
        this['y'],
        point['x'],
        point['y']
    );
};

/**
 * Returns the squared distance between the current and specified point without
 * calculating a square root. Compare the result against a squared distance.
 *
 * @param {rune.geom.Point} point The specified point.
 *
 * @return {number} The squared distance between the points.
 */
rune.geom.Point.prototype.distanceSquared = function(point) {
    return rune.geom.Point.distanceSquared(
        this['x'],
        this['y'],
        point['x'],
        point['y']
    );
};

/**
 * Determines a point between two specified points. The parameter fraction 
 * determines where the new interpolated point is located relative to the two 
 * end points.
 *
 * @param {rune.geom.Point} point The second point.
 * @param {number} [fraction] The level of interpolation between the two points.
 * @param {rune.geom.Point} [output] Save results to this object.
 *
 * @return {rune.geom.Point} The new, interpolated point.
 */
rune.geom.Point.prototype.interpolate = function(point, fraction, output) {
    return rune.geom.Point.interpolate(
        this['x'],
        this['y'],
        point['x'],
        point['y'],
        fraction,
        output
    );
};

/**
 * Sets the horizontal and vertical coordinates of this point.
 *
 * @param {number} x The horizontal coordinate.
 * @param {number} y The vertical coordinate.
 *
 * @return {rune.geom.Point} This point.
 */
rune.geom.Point.prototype.set = function(x, y) {
    this['x'] = x;
    this['y'] = y;

    return this;
};

/**
 * Returns a string that contains the values of the x and y coordinates.
 *
 * @return {string} The string representation of the coordinates.
 */
rune.geom.Point.prototype.toString = function() {
    return "[{Point (x=" + this['x'] + " y=" + this['y'] + ")}]";
};
