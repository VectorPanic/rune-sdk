//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instantiates a new object of the class.
 *
 * @constructor
 *
 * @param {Array.<rune.geom.Point>} [points] A list of points to represent the path.
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
    this.m_nodes = points || [];
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
 * Adds a point to the path at a specified index.
 *
 * @param {number} x The x-coordinate of the point.
 * @param {number} y The y-coordinate of the point.
 * @param {number} index Index where the point is to be stored.
 *
 * @returns {undefined}
 */
rune.util.Path.prototype.addAt = function(x, y, index) {
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
 * Adds a point to the path at a specified index.
 *
 * @param {rune.geom.Point} point Point to add.
 * @param {number} index Index where the point is to be stored.
 * @param {boolean} [asReference=false] Whether the point should be added as a reference or a new object.
 *
 * @returns {undefined}
 */
rune.util.Path.prototype.addPointAt = function(point, index, asReference) {
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
 *
 * @returns {undefined}
 */
rune.util.Path.prototype.compress = function() {
    var ap = this.m_nodes;
    var dp;
    var dn;
    
    var lp = ap[0];
    var cp = null;
    var pi = 1;
    var pl = ap.length - 1;
    
    while (pi < pl) {
        cp = ap[pi];
        dp = (cp['x'] - lp['x']) / (cp['y'] - lp['y']);
        dn = (cp['x'] - ap[pi + 1]['x']) / (cp['y'] - ap[pi + 1]['y']);
        
        if ((lp['x'] == ap[pi + 1]['x']) || (lp['y'] == ap[pi + 1]['y']) || (dp == dn)) {
            ap[pi] = null;
        } else {
           lp = cp; 
        }
        
        pi++;
    }
    
    this.m_nodes = ap.filter(Boolean);
};

/**
 * Returns a point based on the specified index.
 *
 * @param {number} index Index of the point to be retuned.
 *
 * @returns {rune.geom.Point}
 */
rune.util.Path.prototype.getAt = function(index) {
    if (index > this.m_nodes.length) {
        index = this.m_nodes.length;
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
 * Removes a point from the path. The removal is based on an index.
 *
 * @param {number} index Index of the point to remove.
 *
 * @returns {rune.geom.Point} Reference to the removed point.
 */
rune.util.Path.prototype.removeAt = function(index) {
    if (this.m_nodes.length <= 0) {
        return null;
    }
        
    if (index >= this.m_nodes.length) {
        index  = this.m_nodes.length - 1;
    }
        
    return this.m_nodes.splice(index, 1)[0];
};