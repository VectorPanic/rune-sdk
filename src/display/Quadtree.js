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
    var left = (point['x'] > this['centerX']) ? false : true;
    var top  = (point['y'] > this['centerY']) ? false : true;

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
    var a = this.getIndexOfPoint(rectangle['topLeft']);
    var b = this.getIndexOfPoint(rectangle['topRight']);
    var c = this.getIndexOfPoint(rectangle['bottomLeft']);
    var d = this.getIndexOfPoint(rectangle['bottomRight']);
    var e = Array.prototype.concat(a, b, c, d);
    
    return e.filter(rune.util.Filter.unique);
};

/**
 * The object to be sorted according to the tree structure.
 *
 * @param {rune.geom.Rectangle} rectangle Object to sort.
 *
 * @returns {undefined}
 */
rune.display.Quadtree.prototype.insert = function(rectangle) {
    var corners;
    var c = 0; // corner index
    var l = 0; // corners length
    var o = 0; // object index

    if (typeof this.m_nodes[0] !== "undefined") {
        var divide = false;
        corners = this.getIndexOfRectangle(rectangle);
        for (c = 0, l = corners.length; c < l; c++) {
            this.m_nodes[corners[c]].insert(rectangle);
            divide = true;
        }
        
        if (divide === true) return;
    }

    this.m_objects.push(rectangle);

    if (this.m_objects.length > this.m_threshold && this.m_depth < this.m_maxDepth) {
        if (typeof this.m_nodes[0] === "undefined") {
            this.split();
        }
        
        while (o < this.m_objects.length) {
            var removeFromNode = false;
            var numProcessedCorners = 0;
            var currentObject = null;
            
            corners = this.getIndexOfRectangle(this.m_objects[o]);
            for (c = 0, l = corners.length; c < l; c++) {
                currentObject = this.m_objects[o];
                this.m_nodes[corners[c]].insert(currentObject);
                removeFromNode = true;
                numProcessedCorners++;
            }
            
            if (removeFromNode === true && numProcessedCorners === corners.length) this.m_objects.splice(o, 1);
            else o++;
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
    if (rectangle == null || !this.intersects(rectangle)) {
        return [];
    }
    
    var corners = (rectangle.width != undefined && rectangle.height != undefined) ? this.getIndexOfRectangle(rectangle) : [this.getIndexOfPoint(rectangle)];
    var objects = this.m_objects;

    if (typeof this.m_nodes[0] !== "undefined") {
        for (var i = 0, l = corners.length; i < l; i++) {
            if (corners[i] !== -1) {
                objects = objects.concat(this.m_nodes[corners[i]].retrieve(rectangle));
            } 
        }
    }
    
    return objects.filter(rune.util.Filter.unique);
};

/**
 * Divides the tree into four new nodes.
 *
 * @returns {undefined}
 */
rune.display.Quadtree.prototype.split = function() {
    var depth = this.m_depth + 1;

    var bx = this.x;
    var by = this.y;

    var bwh = Math.round(this.width  >> 1);
    var bhh = Math.round(this.height >> 1);
    var bcw = bx + bwh; // border center width
    var bch = by + bhh; // border center height

    this.m_nodes[rune.display.Quadtree.TOP_LEFT] = new rune.display.Quadtree(
        new rune.geom.Rectangle(bx, by, bwh, bhh), this.m_threshold, this.m_maxDepth, depth
    );

    this.m_nodes[rune.display.Quadtree.TOP_RIGHT] = new rune.display.Quadtree(
        new rune.geom.Rectangle(bcw, by, bwh, bhh), this.m_threshold, this.m_maxDepth, depth
    );

    this.m_nodes[rune.display.Quadtree.BOTTOM_LEFT] = new rune.display.Quadtree(
        new rune.geom.Rectangle(bx, bch, bwh, bhh), this.m_threshold, this.m_maxDepth, depth
    );

    this.m_nodes[rune.display.Quadtree.BOTTOM_RIGHT] = new rune.display.Quadtree(
        new rune.geom.Rectangle(bcw, bch, bwh, bhh), this.m_threshold, this.m_maxDepth, depth
    );
};