//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Block object.
 * 
 * @constructor
 * @extends rune.display.Sprite
 *
 * @param {rune.tilemap.Tilemap} map The map containing the Tile object.
 * @param {number} value The value of the Tile object.
 * 
 * @class
 * @classdesc
 * 
 * The rune.tilemap.Block class is a Sprite representation of a Tile. The 
 * class is useful if you want to create a Sprite object that looks like a 
 * Tile, but behaves like a Sprite object. A Block can be instantiated via the 
 * new operator, alternatively created via the getBlock method in the Tilemap 
 * class.
 *
 * @see rune.tilemap.Tilemap
 */
rune.tilemap.Block = function(map, value) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Reference to the map to which the block object belongs.
     *
     * @type {rune.tilemap.Tilemap}
     * @private
     * @ignore
     */
    this.m_map = map;
    
    /**
     * The value of the Tile that the Block object should imitate.
     *
     * @type {number}
     * @private
     * @ignore
     */
    this.m_value = rune.util.Math.clamp(value - 1, 0, map['numTiles'] - 1);
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend Sprite
     */
    rune.display.Sprite.call(this, 0, 0, map['tileWidth'], map['tileHeight'], map['texture']);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.tilemap.Block.prototype = Object.create(rune.display.Sprite.prototype);
rune.tilemap.Block.prototype.constructor = rune.tilemap.Block;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.tilemap.Block.prototype.init = function() {
    rune.display.Sprite.prototype.init.call(this);
    this.m_initAnimation();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Initializes the animation "loop".
 *
 * @returns {undefined}
 * @ignore
 */
rune.tilemap.Block.prototype.m_initAnimation = function() {
    this['animation'].create(
        "block",
        [this.m_value],
        0,
        false
    );
};