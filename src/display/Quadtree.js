//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Quadtree object.
 * 
 * @constructor
 * @extends rune.geom.Rectangle
 * @see https://en.wikipedia.org/wiki/Quadtree
 *
 * @param {rune.geom.Rectangle} [bounds] Represents the rectangular size of the quad tree.
 * @param {number} [threshold=8] Threshold for subdivision, ie objects per node.
 * @param {number} [maxDepth=4] Maximum node depth.
 * @param {number} [depth=0] Standard depth.
 *
 * @class
 * @classdesc
 * 
 * The Quadtree class represents a tree data structure that divides objects 
 * within a rectangular two-dimensional surface into nodes of four. When a node 
 * has been populated with a number of objects that exceed a specified 
 * threshold value, the current node is divided into four new nodes and so on. 
 * The data structure makes it easy to find objects that are in the geometric 
 * proximity of another object.
 */
rune.display.Quadtree = function(bounds, threshold, maxDepth, depth) {

    //--------------------------------------------------------------------------
    // Default arguments
    //--------------------------------------------------------------------------

    /**
     * @ignore
     */
    bounds = bounds || new rune.geom.Rectangle();

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * This object's nodes.
     *
     * @type {Array}
     * @private
     */
    this.m_nodes = [];

    /**
     * Objects that are part of this object's tree structure.
     *
     * @type {Array.<rune.geom.Rectangle>}
     * @private
     */
    this.m_objects = [];

    /**
     * Threshold for subdivision, ie objects per node.
     *
     * @type {number}
     * @private
     */
    this.m_threshold = threshold || 8;

    /**
     * Maximum node depth.
     *
     * @type {number}
     * @private
     */
    this.m_maxDepth = maxDepth || 4;

    /**
     * Standard depth.
     *
     * @type {number}
     * @private
     */
    this.m_depth = depth || 0;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.geom.Rectangle.
     */
    rune.geom.Rectangle.call(this, bounds.x, bounds.y, bounds.width, bounds.height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.Quadtree.prototype = Object.create(rune.geom.Rectangle.prototype);
rune.display.Quadtree.prototype.constructor = rune.display.Quadtree;

//------------------------------------------------------------------------------
// Private static constants
//------------------------------------------------------------------------------

/**
 * Refers to the upper left node.
 *
 * @const {number}
 * @private
 */
rune.display.Quadtree.TOP_LEFT = 0;

/**
 * Refers to the upper right node.
 *
 * @const {number}
 * @private
 */
rune.display.Quadtree.TOP_RIGHT = 1;

/**
 * Refers to the lower left node.
 *
 * @const {number}
 * @private
 */
rune.display.Quadtree.BOTTOM_LEFT = 2;

/**
 * Refers to the lower right node.
 *
 * @const {number}
 * @private
 */
rune.display.Quadtree.BOTTOM_RIGHT = 3;

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Clears the current tree structure. This includes all nodes.
 *
 * @returns {undefined}
 */
rune.display.Quadtree.prototype.clear = function() {
    this.m_objects = [];
    for (var i = 0; i < this.m_nodes.length; i++) {
        if (typeof this.m_nodes[i] !== "undefined") {
            this.m_nodes[i].clear();
        }
    }

    this.m_nodes = [];
};

/**
 * Returns within which node the passed Point object belongs to. Note that the 
 * method returns the node index and not the actual node.
 *
 * @param {rune.geom.Point} point Current point.
 *
 * @returns {number}
 */
rune.display.Quadtree.prototype.getIndexOfPoint = function(point) {
    if (point == null) return -1;

    var centerX = this['x'] + (this['width']  / 2);
    var centerY = this['y'] + (this['height'] / 2);
    var left = (point['x'] > centerX) ? false : true;
    var top  = (point['y'] > centerY) ? false : true;

    if (left) return (top) ? rune.display.Quadtree.TOP_LEFT  : rune.display.Quadtree.BOTTOM_LEFT;
    else      return (top) ? rune.display.Quadtree.TOP_RIGHT : rune.display.Quadtree.BOTTOM_RIGHT;
};

/**
 * Returns within which nodes a Rectangel object is located. The method returns 
 * a list of node indexes. Note that the same node index can only occur once. 
 * For example, if all the corners of the rectangle are within the same node 
 * index, the length of the list will be 1.
 *
 * @param {rune.geom.Rectangle} rectangle Current rectangle.
 *
 * @returns {Array.<number>}
 */
rune.display.Quadtree.prototype.getIndexOfRectangle = function(rectangle) {
    if (rectangle == null) return [];

    if (rectangle['width'] == null || rectangle['height'] == null || rectangle['width'] <= 0 || rectangle['height'] <= 0) {
        var index = this.getIndexOfPoint(rectangle);
        return (index > -1) ? [index] : [];
    }

    var hw = this['width'] / 2;
    var hh = this['height'] / 2;
    var x = this['x'];
    var y = this['y'];
    var indexes = [];

    if (rune.geom.Rectangle.intersects(rectangle['x'], rectangle['y'], rectangle['width'], rectangle['height'], x,      y,      hw,               hh)) indexes.push(rune.display.Quadtree.TOP_LEFT);
    if (rune.geom.Rectangle.intersects(rectangle['x'], rectangle['y'], rectangle['width'], rectangle['height'], x + hw, y,      this['width'] - hw, hh)) indexes.push(rune.display.Quadtree.TOP_RIGHT);
    if (rune.geom.Rectangle.intersects(rectangle['x'], rectangle['y'], rectangle['width'], rectangle['height'], x,      y + hh, hw,               this['height'] - hh)) indexes.push(rune.display.Quadtree.BOTTOM_LEFT);
    if (rune.geom.Rectangle.intersects(rectangle['x'], rectangle['y'], rectangle['width'], rectangle['height'], x + hw, y + hh, this['width'] - hw, this['height'] - hh)) indexes.push(rune.display.Quadtree.BOTTOM_RIGHT);
    
    return indexes;
};

/**
 * The object to be sorted according to the tree structure.
 *
 * @param {rune.geom.Rectangle} rectangle Object to sort.
 *
 * @returns {undefined}
 */
rune.display.Quadtree.prototype.insert = function(rectangle) {
    if (rectangle == null) return;

    var corners;
    var o = 0; // object index

    if (typeof this.m_nodes[0] !== "undefined") {
        corners = this.getIndexOfRectangle(rectangle);
        if (corners.length === 1) {
            this.m_nodes[corners[0]].insert(rectangle);
            return;
        }
    }

    this.m_objects.push(rectangle);

    if (this.m_objects.length > this.m_threshold && this.m_depth < this.m_maxDepth) {
        if (typeof this.m_nodes[0] === "undefined" && this.m_canSplit()) {
            this.split();
        }
        
        while (o < this.m_objects.length) {
            var currentObject = null;
            
            corners = (typeof this.m_nodes[0] !== "undefined") ? this.getIndexOfRectangle(this.m_objects[o]) : [];
            if (corners.length === 1) {
                currentObject = this.m_objects[o];
                this.m_nodes[corners[0]].insert(currentObject);
                this.m_objects.splice(o, 1);
            } else {
                o++;
            }
        }
    }    
};

/**
 * Retrieves objects from the tree structure that are in the same node as the 
 * argument object.
 *
 * @param {rune.geom.Rectangle} rectangle Current object.
 *
 * @returns {Array.<rune.geom.Rectangle>}
 */
rune.display.Quadtree.prototype.retrieve = function(rectangle) {
    if (rectangle == null || !this.m_intersects(rectangle)) {
        return [];
    }
    
    var corners = this.getIndexOfRectangle(rectangle);
    var objects = this.m_objects;

    if (typeof this.m_nodes[0] !== "undefined") {
        for (var i = 0, l = corners.length; i < l; i++) {
            if (corners[i] !== -1) {
                objects = objects.concat(this.m_nodes[corners[i]].retrieve(rectangle));
            } 
        }
    }
    
    return objects;
};

/**
 * Divides the tree into four new nodes.
 *
 * @returns {undefined}
 */
rune.display.Quadtree.prototype.split = function() {
    if (!this.m_canSplit()) return;

    var depth = this.m_depth + 1;

    var bx = this.x;
    var by = this.y;

    var bwh = this.width  / 2;
    var bhh = this.height / 2;
    var bcw = bx + bwh; // border center width
    var bch = by + bhh; // border center height

    this.m_nodes[rune.display.Quadtree.TOP_LEFT] = new rune.display.Quadtree(
        new rune.geom.Rectangle(bx, by, bwh, bhh), this.m_threshold, this.m_maxDepth, depth
    );

    this.m_nodes[rune.display.Quadtree.TOP_RIGHT] = new rune.display.Quadtree(
        new rune.geom.Rectangle(bcw, by, this.width - bwh, bhh), this.m_threshold, this.m_maxDepth, depth
    );

    this.m_nodes[rune.display.Quadtree.BOTTOM_LEFT] = new rune.display.Quadtree(
        new rune.geom.Rectangle(bx, bch, bwh, this.height - bhh), this.m_threshold, this.m_maxDepth, depth
    );

    this.m_nodes[rune.display.Quadtree.BOTTOM_RIGHT] = new rune.display.Quadtree(
        new rune.geom.Rectangle(bcw, bch, this.width - bwh, this.height - bhh), this.m_threshold, this.m_maxDepth, depth
    );
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Whether this node can be divided into smaller nodes.
 *
 * @returns {boolean}
 * @private
 */
rune.display.Quadtree.prototype.m_canSplit = function() {
    return (this['width'] > 0 && this['height'] > 0 && isFinite(this['width']) && isFinite(this['height']));
};

/**
 * Checks whether a rectangle or point intersects this node.
 *
 * @param {rune.geom.Rectangle|rune.geom.Point} rectangle Object to test against.
 *
 * @returns {boolean}
 * @private
 */
rune.display.Quadtree.prototype.m_intersects = function(rectangle) {
    if (!isFinite(this['x']) || !isFinite(this['y']) || !isFinite(this['width']) || !isFinite(this['height'])) {
        return true;
    }

    if (rectangle['width'] == null || rectangle['height'] == null || rectangle['width'] <= 0 || rectangle['height'] <= 0) {
        return this.containsPoint(rectangle);
    }

    return rune.geom.Rectangle.intersects(
        this['x'],
        this['y'],
        this['width'],
        this['height'],
        rectangle['x'],
        rectangle['y'],
        rectangle['width'],
        rectangle['height']
    );
};