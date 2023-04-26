//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the Tile class.
 * 
 * @constructor
 * @extends rune.display.InteractiveObject
 * @package
 *
 * @param {number} width The width of the tile object, in pixels.
 * @param {number} height The height of the tile object, in pixels.
 * 
 * @class
 * @classdesc
 * 
 * The rune.tilemap.Tile class represents a single Tile in a Tilemap. The class 
 * is internal and must therefore only be instantiated within its own package. 
 * The class is primarily used to calculate collisions between tiles and 
 * display objects.
 */
rune.tilemap.Tile = function(width, height) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Index of the Tile object's position in the map structure, i.e. where 
     * the object is in relation to the map.
     *
     * @type {number}
     * @private
     * @ignore
     */
    this.m_index = 0;
    
    /**
     * The value of the Tile object, i.e. what the object represents in 
     * the map.
     *
     * @type {number}
     * @private
     * @ignore
     */
    this.m_value = 0;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend DisplayObject
     */
    rune.display.InteractiveObject.call(this, 0, 0, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.tilemap.Tile.prototype = Object.create(rune.display.InteractiveObject.prototype);
rune.tilemap.Tile.prototype.constructor = rune.tilemap.Tile;

//------------------------------------------------------------------------------
// Override public getter and setter methods
//------------------------------------------------------------------------------

/**
 * A Tile object gets its collision status from the current tilemap, and cannot 
 * be changed at runtime. This value can thus be read, but not changed. 
 * Changing the value has no effect and does not cause runtime errors.
 *
 * @member {number} allowCollisions
 * @memberof rune.tilemap.Tile
 * @instance
 */
Object.defineProperty(rune.tilemap.Tile.prototype, "allowCollisions", {
    /**
     * @this rune.tilemap.Tile
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_allowCollisions;
    },
    
    /**
     * @this rune.tilemap.Tile
     * @ignore
     */
    set : function(value) {
        //@note: The setter must be disabled.
    }
});

/**
 * For a Tile, this property is always true. A Tile is always locked to its 
 * Tilemap position and is thus immovable. The property can be written to 
 * (without throwing an error), but the value when the property is read, is 
 * always true.
 *
 * @member {boolean} immovable
 * @memberof rune.tilemap.Tile
 * @instance
 */
Object.defineProperty(rune.tilemap.Tile.prototype, "immovable", {
    /**
     * @this rune.tilemap.Tile
     * @ignore
     */
    get : function() {
        return true;
    },
    
    /**
     * @this rune.tilemap.Tile
     * @ignore
     */
    set : function(value) {
        //@note: Tiles are always immovable
    }
});

/**
 * For a Tile, this property is always false. It is 
 * possible to write to the property, but the value always 
 * remains false.
 *
 * @member {boolean} movable
 * @memberof rune.tilemap.Tile
 * @instance
 */
Object.defineProperty(rune.tilemap.Tile.prototype, "movable", {
    /**
     * @this rune.tilemap.Tile
     * @ignore
     */
    get : function() {
        return false;
    },
    
    /**
     * @this rune.tilemap.Tile
     * @ignore
     */
    set : function(value) {
        //@note: The setter must be disabled.
    }
});

/**
 * The position of the Tile object in the x direction. Note that 
 * this value is read-only. A Tile object always has a static 
 * position.
 *
 * @member {number} x
 * @memberof rune.tilemap.Tile
 * @instance
 */
Object.defineProperty(rune.tilemap.Tile.prototype, "x", {
    /**
     * @this rune.tilemap.Tile
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_x;
    },
    
    /**
     * @this rune.tilemap.Tile
     * @ignore
     */
    set : function(value) {
        //@note: The setter must be disabled.
    }
});

/**
 * The position of the Tile object in the y direction. Note that 
 * this value is read-only. A Tile object always has a static 
 * position.
 *
 * @member {number} y
 * @memberof rune.tilemap.Tile
 * @instance
 */
Object.defineProperty(rune.tilemap.Tile.prototype, "y", {
    /**
     * @this rune.tilemap.Tile
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_y;
    },
    
    /**
     * @this rune.tilemap.Tile
     * @ignore
     */
    set : function(value) {
        //@note: The setter must be disabled.
    }
});

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Index of the Tile object's position in the map structure, i.e. where 
 * the object is in relation to the map.
 *
 * @member {number} index
 * @memberof rune.tilemap.Tile
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tile.prototype, "index", {
    /**
     * @this rune.tilemap.Tile
     * @ignore
     */
    get : function() {
        return this.m_index;
    }
});

/**
 * The value of the Tile object, i.e. what the object represents in 
 * the map.
 *
 * @member {number} value
 * @memberof rune.tilemap.Tile
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tile.prototype, "value", {
    /**
     * @this rune.tilemap.Tile
     * @ignore
     */
    get : function() {
        return this.m_value;
    }
});

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Set the Tile object's position and properties. Note that this method is 
 * internal and intended only for the TilemapLayer class.
 *
 * @param {number} x The position of the Tile object in the x direction.
 * @param {number} y The position of the Tile object in the y direction.
 * @param {Object} [p] Tile properties.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.tilemap.Tile.prototype.set = function(i, x, y, p) {
    this.m_index = i;
    this.m_x = x;
    this.m_y = y;
    this.m_previousX = x;
    this.m_previousY = y;
    
    if (p) {
        this.m_value = p['value'];
        this.m_allowCollisions = parseInt(Number(p['collision']), 10) || rune.physics.Space.NONE;
    } else {
        this.m_value = 0;
        this.m_allowCollisions = rune.physics.Space.NONE;
    }
};