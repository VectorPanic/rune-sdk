//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Instantiates a new object of the class.
 * 
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The rune.util.Paths class represents a stack of Path objects and provides a 
 * programmable interface for adding and removing objects from the stack. For 
 * example, the class is used by rune.tilemap.TilemapLayer to render paths on 
 * layers, for the purpose of debugging.
 *
 * @see rune.tilemap.TilemapLayer
 */
rune.util.Paths = function() {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Represents the stack of path objects.
     *
     * @type {Array.<rune.util.Path>}
     */
    this.m_paths = [];
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The length property returns the number of paths in the stack.
 *
 * @member {number} length
 * @memberof rune.util.Paths
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Paths.prototype, "length", {
    /**
     * @this rune.util.Paths
     * @ignore
     */
    get: function() {
        return this.m_paths.length;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds a Path object to the stack.
 *
 * @param {rune.util.Path} path Path to add.
 *
 * @returns {undefined}
 */
rune.util.Paths.prototype.add = function(path) {
    this.m_paths.push(path);
};

/**
 * Removes all Path objects from the stack.
 *
 * @returns {undefined}
 */
rune.util.Paths.prototype.clear = function() {
    this.m_paths.length = 0;
};

/**
 * Gets a Path object from the stack based on the object's index.
 *
 * @param {number} index Index of the Path object to retrieve.
 *
 * @returns {rune.util.Path}
 */
rune.util.Paths.prototype.get = function(index) {
    return this.m_paths[rune.util.Math.clamp(
        index,
        0,
        this.m_paths.length - 1
    )];
};

/**
 * Removes a Path object from the stack via active reference.
 *
 * @param {rune.util.Path} path Reference to the Path object to be removed.
 *
 * @returns {rune.util.Path}
 */
rune.util.Paths.prototype.remove = function(path) {
    var i = this.m_paths.indexOf(path);
    if (i > -1) {
        return this.m_paths.splice(i, 1)[0];
    }
    
    return null;
};

/**
 * Removes a Path object from the stack based on the specified index.
 *
 * @param {number} index Index of the Path object to be removed.
 *
 * @returns {rune.util.Path}
 */
rune.util.Paths.prototype.removeAt = function(index) {
    return this.m_paths.splice(rune.util.Math.clamp(
        index,
        0,
        this.m_paths.length - 1
    ), 1)[0] || null;
};