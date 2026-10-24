//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instantiates a new object of the class.
 *
 * @constructor
 *
 * @param {Array.<rune.geom.Point>} [points] Initial points. The array is copied; point objects are shared.
 *
 * @class
 * @classdesc
 *
 * The rune.util.Path object represents a path in the form of a list of 
 * coordinates, where each coordinate is represented by a Point object. The 
 * class is used, for example, to represent possible paths through a tilemap 
 * layer.
 *
 * @see rune.tilemap.TilemapLayer
 */
rune.util.Path = function(points) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Path transparency (used in debug rendering).
     *
     * @type {number}
     * @default 1
     */
    this.alpha = 1;
    
    /**
     * Color to represent the path when it is debug-rendered.
     *
     * @type {string}
     * @default #FFFFFF
     */
    this.color = "#FFFFFF";
    
    /**
     * The thickness of the path when it is debug-rendered.
     *
     * @type {number}
     * @default 1
     */
    this.thickness = 1;
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * The coordinates that make up the path.
     *
     * @type {Array.<rune.geom.Point>}
     * @protected
     * @ignore
     */
    this.m_nodes = points ? points.slice() : [];
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the first point in the path.
 *
 * @member {rune.geom.Point} first
 * @memberof rune.util.Path
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Path.prototype, "first", {
    /**
     * @this rune.util.Path
     * @ignore
     */
    get : function() {
        if (this.m_nodes.length > 0) {
            return this.m_nodes[0];
        }
            
        return null;
    }
});

/**
 * Reference to the last point in the path.
 *
 * @member {rune.geom.Point} last
 * @memberof rune.util.Path
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Path.prototype, "last", {
    /**
     * @this rune.util.Path
     * @ignore
     */
    get : function() {
        if (this.m_nodes.length > 0) {
            return this.m_nodes[this.m_nodes.length - 1];
        }
            
        return null;
    }
});

/**
 * The number of points that make up the path.
 *
 * @member {number} length
 * @memberof rune.util.Path
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Path.prototype, "length", {
    /**
     * @this rune.util.Path
     * @ignore
     */
    get : function() {
        return this.m_nodes.length;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Extends the path by one point (x and y coordinates).
 *
 * @param {number} x The x-coordinate of the point.
 * @param {number} y The y-coordinate of the point.
 *
 * @returns {undefined}
 */
rune.util.Path.prototype.add = function(x, y) {
    this.m_nodes.push(new rune.geom.Point(x, y));
};

/**
 * Adds a point to the path at a specified index. Indices are clamped between
 * zero and the path length, allowing insertion at either end.
 *
 * @param {number} x The x-coordinate of the point.
 * @param {number} y The y-coordinate of the point.
 * @param {number} index Integer index where the point is to be stored.
 *
 * @returns {undefined}
 */
rune.util.Path.prototype.addAt = function(x, y, index) {
    if (index < 0) {
        index = 0;
    }

    if (index > this.m_nodes.length) {
        index = this.m_nodes.length;
    }
    
    this.m_nodes.splice(index, 0, new rune.geom.Point(x,y));
};

/**
 * Extends the path by one point.
 *
 * @param {rune.geom.Point} point Point to add.
 * @param {boolean} [asReference=false] Whether the point should be added as a reference or a new object.
 *
 * @returns {undefined}
 */
rune.util.Path.prototype.addPoint = function(point, asReference) {
    if (asReference === true) {
        this.m_nodes.push(point); 
    } else {
       this.m_nodes.push(new rune.geom.Point(
           point['x'],
           point['y']
       ));
    }
};

/**
 * Adds a point to the path at a specified index. Indices are clamped between
 * zero and the path length, allowing insertion at either end.
 *
 * @param {rune.geom.Point} point Point to add.
 * @param {number} index Integer index where the point is to be stored.
 * @param {boolean} [asReference=false] Whether the point should be added as a reference or a new object.
 *
 * @returns {undefined}
 */
rune.util.Path.prototype.addPointAt = function(point, index, asReference) {
    if (index < 0) {
        index = 0;
    }

    if (index > this.m_nodes.length) {
        index = this.m_nodes.length;
    }
    
    if (asReference === true) {
        this.m_nodes.splice(index, 0, point);
    } else {
        this.m_nodes.splice(index, 0, new rune.geom.Point(
            point['x'], point['y']
        ));
    }
};

/**
 * Compress a path by removing unnecessary nodes (points). A compressed path 
 * represents the same path as an uncompressed path, but with fewer nodes.
 * Only points between their neighbors on the same straight segment are removed.
 * Endpoints, corners and changes of direction are retained.
 *
 * @returns {undefined}
 */
rune.util.Path.prototype.compress = function() {
    var nodes = this.m_nodes;
    if (nodes.length < 3) {
        return;
    }

    var compressed = [nodes[0]];

    for (var i = 1; i < nodes.length - 1; i++) {
        var previous = compressed[compressed.length - 1];
        var current = nodes[i];
        var next = nodes[i + 1];
        var dx = current['x'] - previous['x'];
        var dy = current['y'] - previous['y'];
        var nextX = next['x'] - current['x'];
        var nextY = next['y'] - current['y'];
        var cross = dx * nextY - dy * nextX;
        var dot = dx * nextX + dy * nextY;

        if (cross !== 0 || dot < 0) {
            compressed.push(current);
        }
    }

    compressed.push(nodes[nodes.length - 1]);
    this.m_nodes = compressed;
};

/**
 * Returns a point based on the specified index. Indices below zero select the
 * first point, and indices above the last point select the last point.
 * Returns null if the path is empty.
 *
 * @param {number} index Integer index of the point to retrieve.
 *
 * @returns {?rune.geom.Point}
 */
rune.util.Path.prototype.getAt = function(index) {
    if (this.m_nodes.length === 0) {
        return null;
    }

    if (index >= this.m_nodes.length) {
        index = this.m_nodes.length - 1;
    }
    
    if (index < 0) {
        index = 0;
    }
    
    return this.m_nodes[index];
};

/**
 * Removes a point by reference.
 *
 * @param {rune.geom.Point} point Reference to the point to be removed.
 *
 * @returns {rune.geom.Point} Reference to the removed point.
 */
rune.util.Path.prototype.remove = function(point) {
    var index = this.m_nodes.indexOf(point);
    if (index > -1) {
        return this.m_nodes.splice(index, 1)[0];
    } else return null;
};

/**
 * Removes a point from the path. Indices below zero select the first point,
 * and indices above the last point select the last point.
 * Returns null if the path is empty.
 *
 * @param {number} index Integer index of the point to remove.
 *
 * @returns {?rune.geom.Point} Reference to the removed point, or null for an empty path.
 */
rune.util.Path.prototype.removeAt = function(index) {
    if (this.m_nodes.length <= 0) {
        return null;
    }

    if (index < 0) {
        index = 0;
    }
        
    if (index >= this.m_nodes.length) {
        index  = this.m_nodes.length - 1;
    }
        
    return this.m_nodes.splice(index, 1)[0];
};
