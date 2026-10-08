//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new TileGraphic object.
 *
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {number} [x=0.0] The x coordinate of the top-left corner of the object.
 * @param {number} [y=0.0] The y coordinate of the top-left corner of the object.
 * @param {string} [resource=""] Name of the resource to be used as tilemap data.
 *
 * @class
 * @classdesc
 *
 * The TileGraphic class renders tilemap data as a regular display object.
 * The class uses the same map data format as rune.tilemap.Tilemap, but is not
 * connected to Stage and renders its back and front buffers into one object.
 */
rune.display.TileGraphic = function(x, y, resource) {

    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------

    /**
     * The back buffer.
     *
     * @type {rune.tilemap.TilemapDataLayer}
     * @protected
     * @ignore
     */
    this.m_bufferA = null;

    /**
     * The front buffer.
     *
     * @type {rune.tilemap.TilemapDataLayer}
     * @protected
     * @ignore
     */
    this.m_bufferB = null;

    /**
     * Map data.
     *
     * @type {Object}
     * @protected
     * @ignore
     */
    this.m_map = null;

    /**
     * The name of the current map.
     *
     * @type {string}
     * @protected
     * @ignore
     */
    this.m_name = "";

    /**
     * Texture data.
     *
     * @type {rune.display.Texture}
     * @protected
     * @ignore
     */
    this.m_texture = null;

    /**
     * A collection of key-value pairs representing Tile properties.
     *
     * @type {Object}
     * @protected
     * @ignore
     */
    this.m_tiles = {};

    /**
     * A Rectangle object reused when drawing tile texture regions.
     *
     * @type {rune.geom.Rectangle}
     * @protected
     * @ignore
     */
    this.m_tmpRect = new rune.geom.Rectangle();

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.display.DisplayObjectContainer.
     */
    rune.display.DisplayObjectContainer.call(this, x, y, 0, 0);

    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------

    if (resource) {
        this.load(resource);
    }
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.TileGraphic.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.display.TileGraphic.prototype.constructor = rune.display.TileGraphic;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the TileGraphic's rear buffer.
 *
 * @member {rune.tilemap.TilemapDataLayer} back
 * @memberof rune.display.TileGraphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.TileGraphic.prototype, "back", {
    /**
     * @this rune.display.TileGraphic
     * @ignore
     */
    get : function() {
        return this.m_bufferA;
    }
});

/**
 * Reference to the TileGraphic's front buffer.
 *
 * @member {rune.tilemap.TilemapDataLayer} front
 * @memberof rune.display.TileGraphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.TileGraphic.prototype, "front", {
    /**
     * @this rune.display.TileGraphic
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
 * @memberof rune.display.TileGraphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.TileGraphic.prototype, "heightInTiles", {
    /**
     * @this rune.display.TileGraphic
     * @ignore
     */
    get : function() {
        return this.m_map != null ? this.m_map['height'] || 0 : 0;
    }
});

/**
 * The name of the current map.
 *
 * @member {string} name
 * @memberof rune.display.TileGraphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.TileGraphic.prototype, "name", {
    /**
     * @this rune.display.TileGraphic
     * @ignore
     */
    get : function() {
        return this.m_name;
    }
});

/**
 * The number of tiles that the map contains.
 *
 * @member {number} numTiles
 * @memberof rune.display.TileGraphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.TileGraphic.prototype, "numTiles", {
    /**
     * @this rune.display.TileGraphic
     * @ignore
     */
    get : function() {
        return this['widthInTiles'] * this['heightInTiles'];
    }
});

/**
 * The height of a Tile, given in pixels.
 *
 * @member {number} tileHeight
 * @memberof rune.display.TileGraphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.TileGraphic.prototype, "tileHeight", {
    /**
     * @this rune.display.TileGraphic
     * @ignore
     */
    get : function() {
        return this.m_map != null ? this.m_map['tileHeight'] || 0 : 0;
    }
});

/**
 * Represents the bitmap data used for rendering tiles.
 *
 * @member {rune.display.Texture} texture
 * @memberof rune.display.TileGraphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.TileGraphic.prototype, "texture", {
    /**
     * @this rune.display.TileGraphic
     * @ignore
     */
    get : function() {
        return this.m_texture;
    }
});

/**
 * The width of a Tile, given in pixels.
 *
 * @member {number} tileWidth
 * @memberof rune.display.TileGraphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.TileGraphic.prototype, "tileWidth", {
    /**
     * @this rune.display.TileGraphic
     * @ignore
     */
    get : function() {
        return this.m_map != null ? this.m_map['tileWidth'] || 0 : 0;
    }
});

/**
 * The width of the tile map, given in number of tiles.
 *
 * @member {number} widthInTiles
 * @memberof rune.display.TileGraphic
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.TileGraphic.prototype, "widthInTiles", {
    /**
     * @this rune.display.TileGraphic
     * @ignore
     */
    get : function() {
        return this.m_map != null ? this.m_map['width'] || 0 : 0;
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.TileGraphic.prototype.dispose = function() {
    this.m_disposeBuffers();
    this.m_disposeTexture();
    this.m_map = null;
    this.m_tiles = null;
    this.m_tmpRect = null;

    rune.display.DisplayObjectContainer.prototype.dispose.call(this);
};

/**
 * @inheritDoc
 */
rune.display.TileGraphic.prototype.render = function() {
    if (this.m_cached == false) {
        if (this.m_canvas != null) this.m_canvas.clear();
        
        this.m_renderBackgroundColor();
        this.m_renderTiles();
        this.m_renderChildren();
        this.m_renderGraphics();
        this.m_renderStates();
        
        this.restoreCache();
    }
};

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Loads tilemap data.
 *
 * @param {string} resource The name of the resource that represents the map data.
 *
 * @throws Error In case of invalid map or texture data.
 *
 * @returns {undefined}
 */
rune.display.TileGraphic.prototype.load = function(resource) {
    var map = this['application']['resources'].get(resource);
    if (!map) throw new Error("Invalid map");

    map = map['data'];
    if (!map) throw new Error("Invalid map");

    this.m_disposeBuffers();
    this.m_map = map;
    this.m_name = map['name'] || resource;
    this.m_tiles = map['tiles'] || {};
    this.m_resize(
        (map['width'] || 0) * (map['tileWidth'] || 0),
        (map['height'] || 0) * (map['tileHeight'] || 0)
    );

    this.m_constructTexture(map['texture'] || "");
    this.m_bufferA = new rune.tilemap.TilemapDataLayer(this, map['back'], this);
    this.m_bufferB = new rune.tilemap.TilemapDataLayer(this, map['front'], this);
    this.breakCache();
};

/**
 * Returns a key-value pair that describes the properties of a Tile.
 *
 * @param {number} value Tile value.
 *
 * @returns {Object}
 */
rune.display.TileGraphic.prototype.getTilePropertiesOf = function(value) {
    var o = this.m_tiles;
    for (var k in o) {
        if (o[k]['value'] == value) {
            return o[k];
        }
    }

    return null;
};

/**
 * Evaluates whether the TileGraphic overlaps another object.
 *
 * @param {rune.display.Stage|rune.display.InteractiveObject|rune.display.DisplayGroup|rune.tilemap.TilemapLayer|rune.geom.Point|Array} obj The object to be evaluated.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.display.TileGraphic.prototype.hitTest = function(obj, callback, scope) {
    var result = false;

    if (this.m_bufferA != null) {
        result = this.m_bufferA.hitTest(obj, callback, scope) || result;
    }

    if (this.m_bufferB != null) {
        result = this.m_bufferB.hitTest(obj, callback, scope) || result;
    }

    return result;
};

/**
 * Evaluates and resolves collision between the TileGraphic and an object.
 *
 * @param {rune.display.Stage|rune.display.InteractiveObject|rune.display.DisplayGroup|rune.tilemap.TilemapLayer|Array} obj The object to be evaluated.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.display.TileGraphic.prototype.hitTestAndSeparate = function(obj, callback, scope) {
    var result = false;

    if (this.m_bufferA != null) {
        result = this.m_bufferA.hitTestAndSeparate(obj, callback, scope) || result;
    }

    if (this.m_bufferB != null) {
        result = this.m_bufferB.hitTestAndSeparate(obj, callback, scope) || result;
    }

    return result;
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Renders tilemap data to the object's pixel buffer.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.TileGraphic.prototype.m_renderTiles = function() {
    if (this.m_canvas == null || this.m_map == null || this.m_texture == null) return;
    if (this.m_texture['data'] == null) return;

    this.m_renderTileLayer(this.m_bufferA);
    this.m_renderTileLayer(this.m_bufferB);
};

/**
 * Renders a single tile layer.
 *
 * @param {rune.tilemap.TilemapDataLayer} layer Tilemap layer data.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.TileGraphic.prototype.m_renderTileLayer = function(layer) {
    if (layer == null || layer['data'] == null || layer['visible'] == false) return;

    var data = layer['data'];
    var tw = this['tileWidth'];
    var th = this['tileHeight'];
    var wt = this['widthInTiles'];
    var i  = 0;
    var v  = 0;
    var r  = null;
    var x  = 0;
    var y  = 0;

    if (tw <= 0 || th <= 0 || wt <= 0) return;

    for (i = 0; i < data.length; i++) {
        v = data[i] || 0;
        if (v > 0) {
            r = this.m_getTileTextureRect(v);
            x = (i % wt) * tw;
            y = Math.floor(i / wt) * th;
            
            this.m_canvas.drawImage(
                this.m_texture['data'],
                x,
                y,
                tw,
                th,
                r['x'],
                r['y'],
                r['width'],
                r['height']
            );
        }
    }
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Disposes TilemapDataLayer objects.
 *
 * @return {undefined}
 * @private
 */
rune.display.TileGraphic.prototype.m_disposeBuffers = function() {
    if (this.m_bufferA instanceof rune.tilemap.TilemapDataLayer) {
        this.m_bufferA.dispose();
        this.m_bufferA = null;
    }

    if (this.m_bufferB instanceof rune.tilemap.TilemapDataLayer) {
        this.m_bufferB.dispose();
        this.m_bufferB = null;
    }
};

/**
 * Creates a new texture object.
 *
 * @param {string} resource Resource name.
 *
 * @return {undefined}
 * @private
 */
rune.display.TileGraphic.prototype.m_constructTexture = function(resource) {
    var texture = null;

    this.m_disposeTexture();

    if (resource) {
        texture = this['application']['resources'].get(resource);
        if (!texture) throw new Error("Invalid texture");
        
        this.m_texture = new rune.display.Texture(this, texture['data']);
    }
};

/**
 * Destroys texture data.
 *
 * @return {undefined}
 * @private
 */
rune.display.TileGraphic.prototype.m_disposeTexture = function() {
    if (this.m_texture != null) {
        this.m_texture.dispose();
        this.m_texture = null;
    }
};

/**
 * Returns the texture rectangle of a tile value.
 *
 * @param {number} value Tile value.
 *
 * @return {rune.geom.Rectangle}
 * @private
 */
rune.display.TileGraphic.prototype.m_getTileTextureRect = function(value) {
    var texture = this.m_texture;
    var tw = this['tileWidth'];
    var th = this['tileHeight'];
    var cols = 0;
    var max = 0;

    this.m_tmpRect.x = 0;
    this.m_tmpRect.y = 0;
    this.m_tmpRect.width  = tw;
    this.m_tmpRect.height = th;

    if (texture == null || texture['data'] == null || tw <= 0 || th <= 0) {
        return this.m_tmpRect;
    }

    if (value > 0) value -= 1;

    cols = Math.floor(texture['width'] / tw) || 1;
    max = cols * (Math.floor(texture['height'] / th) || 1) - 1;
    value = rune.util.Math.clamp(parseInt(value, 10) || 0, 0, max);

    this.m_tmpRect.x = (value % cols) * tw;
    this.m_tmpRect.y = Math.floor(value / cols) * th;

    return this.m_tmpRect;
};

/**
 * Resizes the object and its pixel buffer.
 *
 * @param {number} width The unscaled width of the object, in pixels.
 * @param {number} height The unscaled height of the object, in pixels.
 *
 * @return {undefined}
 * @private
 */
rune.display.TileGraphic.prototype.m_resize = function(width, height) {
    this.m_width = width;
    this.m_height = height;

    if (this.m_canvas != null) {
        this.m_canvas['width'] = width;
        this.m_canvas['height'] = height;
    }
};
