//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Tilemap object.
 * 
 * @constructor
 * 
 * @class
 * @classdesc
 * 
 * The rune.tilemap.Tilemap class, represents an orthogonal grid (Tilemap) of 
 * textured rectangles (Tiles). A Tilemap contains two layers (buffers) of 
 * tiles; back and front, where each layer is represented by a TilemapLayer 
 * object. Rune's Scene objects automatically instantiate their own Tilemap.
 *
 * @see rune.scene.Scene
 * @see rune.tilemap.TilemapLayer
 */
rune.tilemap.Tilemap = function() {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * The back buffer.
     *
     * @type {rune.tilemap.TilemapLayer}
     * @private
     */
    this.m_bufferA = null;
    
    /**
     * The front buffer.
     *
     * @type {rune.tilemap.TilemapLayer}
     * @private
     */
    this.m_bufferB = null;
    
    /**
     * The height of the tile map, given in number of tiles.
     *
     * @type {number}
     * @private
     */
    this.m_heightInTiles = 0;
    
    /**
     * The name of the current map.
     *
     * @type {string}
     * @private
     */
    this.m_name = "";
    
    /**
     * The name of the texture that the map uses.
     *
     * @type {string}
     * @private
     */
    this.m_texture = "";
    
    /**
     * A collection of key-value pairs representing Tile properties.
     *
     * @type {Object}
     * @private
     */
    this.m_tiles = {};
    
    /**
     * An Array object used for various tasks. The primary purpose is to 
     * stabilize memory consumption.
     *
     * @type {Array}
     * @private
     */
    this.m_tmpArray = [];
    
    /**
     * A Rectangle object used for various tasks in order to reduce 
     * and stabilize memory usage.
     *
     * @type {rune.geom.Rectangle}
     * @private
     */
    this.m_tmpRect = new rune.geom.Rectangle();
    
    /**
     * The height of a Tile, given in pixels.
     *
     * @type {number}
     * @private
     */
    this.m_tileHeight = 0;
    
    /**
     * The width of a Tile, given in pixels.
     *
     * @type {number}
     * @private
     */
    this.m_tileWidth = 0;
    
    /**
     * The width of the tile map, given in number of tiles.
     *
     * @type {number}
     * @private
     */
    this.m_widthInTiles = 0;
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------
    
    /**
     * Invokes secondary class constructor.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Public static constants (ENGINE)
//------------------------------------------------------------------------------

/**
 * Constant to identify the map back buffer. This is used internally by Rune 
 * and is not intended for public use.
 *
 * @const
 * @default 0
 * @ignore
 */
rune.tilemap.Tilemap.BACK_BUFFER = 0;

/**
 * Constant to identify the map front buffer. This is used internally by Rune 
 * and is not intended for public use.
 *
 * @const
 * @default 1
 * @ignore
 */
rune.tilemap.Tilemap.FRONT_BUFFER = 1;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the Tilemap's rear buffer, i.e. the bottom layer in the layer 
 * hierarchy. Note that DisplayObjects placed on the stage are rendered on top 
 * of this buffer.
 *
 * @member {rune.tilemap.TilemapLayer} back
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "back", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return this.m_bufferA;
    }
});

/**
 * Reference to the Tilemap's front buffer, i.e. the top layer in the layer 
 * hierarchy. Note that this layer is rendered on top of both the 
 * DisplayObjects placed on the stage, as well as the Tiles included in the 
 * back buffer.
 *
 * @member {rune.tilemap.TilemapLayer} front
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "front", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return this.m_bufferB;
    }
});

/**
 * The height of the tile map, given in number of tiles.
 *
 * @member {number} heightInTiles
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "heightInTiles", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return this.m_heightInTiles;
    }
});

/**
 * The name of the current map. The name is retrieved from the map data 
 * (JSON) when the map is loaded. If no name is declared in the map data, 
 * the name of the map data file is used as the name.
 *
 * @member {string} name
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "name", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return this.m_name;
    }
});

/**
 * The total number of Tiles included in the current map.
 *
 * @member {number} numTiles
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "numTiles", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return (this.m_widthInTiles * this.m_heightInTiles) || 0;
    }
});

/**
 * Reference to the texture the map uses for its Tiles.
 *
 * @member {HTMLImage} texture
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "texture", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return this['application']['resources'].get(this.m_texture)['data'];
    }
});

/**
 * The height of a Tile, given in pixels.
 *
 * @member {number} tileHeight
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "tileHeight", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return this.m_tileHeight;
    }
});

/**
 * The width of a Tile, given in pixels.
 *
 * @member {number} tileWidth
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "tileWidth", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return this.m_tileWidth;
    }
});

/**
 * The current width of the map, specified in pixels.
 *
 * @member {number} width
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "width", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return this.m_widthInTiles * this.m_tileWidth;
    }
});

/**
 * The width of the tile map, given in number of tiles.
 *
 * @member {number} widthInTiles
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "widthInTiles", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return this.m_widthInTiles;
    }
});

//------------------------------------------------------------------------------
// Protected getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to Rune's base class.
 *
 * @member {rune.system.Application} application
 * @memberof rune.tilemap.Tilemap
 * @instance
 * @readonly
 * @protected
 * @ignore
 */
Object.defineProperty(rune.tilemap.Tilemap.prototype, "application", {
    /**
     * @this rune.tilemap.Tilemap
     * @ignore
     */
    get : function() {
        return rune.system.Application['instance'];
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Resets the map.
 *
 * @returns {undefined}
 */
rune.tilemap.Tilemap.prototype.clear = function() {
    this.m_name          = "";
    this.m_texture       = "";
    this.m_heightInTiles = 0;
    this.m_widthInTiles  = 0;
    this.m_tileHeight    = 0;
    this.m_tileWidth     = 0;
    this.m_tiles         = {};
    
    if (this.m_bufferA) {
        this.m_bufferA.clear();
    }
    
    if (this.m_bufferB) {
        this.m_bufferB.clear();
    }
};

/**
 * Creates and returns a new Block object based on a tile value. The method 
 * can be used to generate tiles represented by Sprite objects.
 *
 * @param {number} v Tile value.
 *
 * @returns {rune.tilemap.Block}
 */
rune.tilemap.Tilemap.prototype.getBlock = function(v) {
    return new rune.tilemap.Block(
        this,
        v
    );
};

/**
 * Returns a rectangle object that describes a value's location in the 
 * texture atlas. The method is mainly intended for internal use, 
 * but can be useful if you want to copy a "piece" of the texture atlas.
 *
 * @param {number} v Tile value.
 *
 * @returns {rune.geom.Rectangle}
 */
rune.tilemap.Tilemap.prototype.getTileTextureRectOf = function(v) {
    if (v > 0) v -= 1; //@note: Offset tile atlas
    
    this.m_tmpRect.x = Math.floor(v * this['tileWidth']) % this['texture'].width;
    this.m_tmpRect.y = Math.floor(v / (this['texture'].width / this['tileWidth'])) * this['tileHeight'];
    this.m_tmpRect.width  = this.m_tileWidth;
    this.m_tmpRect.height = this.m_tileHeight;
    
    return this.m_tmpRect;
};

/**
 * Returns a key-value pair that describes the properties of a 
 * Tile, via the specified Tile value. The method returns 
 * null if the specified Tile value is not associated with 
 * properties in the map data.
 *
 * @param {number} v Tile value.
 *
 * @returns {Object}
 */
rune.tilemap.Tilemap.prototype.getTilePropertiesOf = function(v) {
    var o = this.m_tiles;
    for (var k in o) {
        if (o[k]['value'] == v) {
            return o[k];
        }
    }
    
    return null;
};

/**
 * Loads a map from map-data.
 *
 * @param {string} name The name of the resource that represents the map data.
 *
 * @throws Error In case of corrupt map data.
 *
 * @returns {undefined}
 */
rune.tilemap.Tilemap.prototype.load = function(name) {    
    var map = this['application']['resources'].get(name);
    if (map) {
        map = map['data'];
        
        this.m_name          = map['name']       || name;
        this.m_texture       = map['texture']    || "";
        this.m_heightInTiles = map['height']     || 0;
        this.m_widthInTiles  = map['width']      || 0;
        this.m_tileHeight    = map['tileHeight'] || 0;
        this.m_tileWidth     = map['tileWidth']  || 0;
        this.m_tiles         = map['tiles']      || {};
        
        this.m_bufferA       = new rune.tilemap.TilemapLayer(this, map['back']); 
        this.m_bufferB       = new rune.tilemap.TilemapLayer(this, map['front']);
        
    } else throw new Error("Invalid map");
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Preparing the Tilemap for removal.
 *
 * @returns {undefined}
 * @ignore
 */
rune.tilemap.Tilemap.prototype.dispose = function() {
    this.clear();
    
    this.m_tmpArray = null;
    this.m_tmpRect = null;
};

/**
 * Returns a chunk of the back buffer, based on specified coordinates (in the 
 * form of a rectangle). Note that this method is primarily intended for 
 * internal use.
 *
 * @param {number} x The x-coordinate of the rectangle.
 * @param {number} y The y-coordinate of the rectangle.
 * @param {number} w The width of the rectangle, given in pixels.
 * @param {number} h The height of the rectangle, given in pixels.
 *
 * @returns {Array.<number>}
 * @ignore
 */
rune.tilemap.Tilemap.prototype.getBackBufferIn = function(x, y, w, h) {
    if (!this.m_bufferA) return this.m_tmpArray;
        
    var a = this.m_bufferA.getTileIndexesIn(x, y, w, h);
    var b = this.m_bufferB.getTileIndexesIn(x, y, w, h);
    var o = [];
        
    for (var i = 0; i < a.length; i++) {
        if (this.m_bufferB.getTileValueAt(b[i]) > 0) o.push(0);
        else o.push(a[i]);
    }
    
    return o;
};

/**
 * Provides an alternative to getBackBufferIn.
 *
 * @param {rune.geom.Rectangle} r Clipping area.
 *
 * @returns {Array.<number>}
 * @ignore
 */
rune.tilemap.Tilemap.prototype.getBackBufferInRect = function(r) {
    return this.getBackBufferIn(
        r['x'],
        r['y'],
        r['width'],
        r['height']
    );
};

/**
 * Returns a chunk of the front buffer, based on specified coordinates (in the 
 * form of a rectangle). Note that this method is primarily intended for 
 * internal use.
 *
 * @param {number} x The x-coordinate of the rectangle.
 * @param {number} y The y-coordinate of the rectangle.
 * @param {number} w The width of the rectangle, given in pixels.
 * @param {number} h The height of the rectangle, given in pixels.
 *
 * @returns {Array.<number>}
 * @ignore
 */
rune.tilemap.Tilemap.prototype.getFrontBufferIn = function(x, y, w, h) {
    if (!this.m_bufferB) return this.m_tmpArray;
    
    return this.m_bufferB.getTileIndexesIn(x, y, w, h);
};

/**
 * Provides an alternative to getBackBufferIn.
 *
 * @param {rune.geom.Rectangle} r Clipping area.
 *
 * @returns {Array.<number>}
 * @ignore
 */
rune.tilemap.Tilemap.prototype.getFrontBufferInRect = function(r) {
    return this.getFrontBufferIn(
        r['x'],
        r['y'],
        r['width'],
        r['height']
    );
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.tilemap.Tilemap.prototype.m_construct = function() {
    //@note: Nothing ATM.
};