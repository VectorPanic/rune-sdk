//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new TilemapDataLayer object.
 *
 * @constructor
 *
 * @param {Object} map Reference to the map to which the layer belongs.
 * @param {Array.<number>} [data] Initial tile values, copied into this layer.
 * @param {rune.display.DisplayObject} [owner] Optional display object that owns this layer.
 *
 * @class
 * @classdesc
 *
 * The TilemapDataLayer class represents tilemap layer data, collision and
 * pathfinding behavior that can be shared by tilemap and display based tile
 * structures.
 *
 * Coordinate conventions:
 * - Methods ending in At use linear indices: row * widthInTiles + column.
 * - Of/OfPoint methods use pixels, including the optional owner's x/y origin.
 * - In methods use pixel rectangles in the same coordinate space.
 * - Cell methods use zero-based local columns and rows, ignoring pixel origin.
 * Path endpoints and returned path points use pixels; isBlocked callbacks
 * receive local cell columns and rows.
 */
rune.tilemap.TilemapDataLayer = function(map, data, owner) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Whether the layer should be rendered or not. Useful for troubleshooting.
     *
     * @type {boolean}
     */
    this.visible = true;

    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------

    /**
     * Owned tile values, independent of the source array and other layers.
     *
     * @type {Array.<number>}
     * @protected
     * @ignore
     */
    this.m_data = data != null ? data.slice() : null;

    /**
     * Reference to the map to which the layer belongs.
     *
     * @type {Object}
     * @protected
     * @ignore
     */
    this.m_map = map;

    /**
     * Optional display object that owns this layer.
     *
     * @type {rune.display.DisplayObject}
     * @protected
     * @ignore
     */
    this.m_owner = owner || null;

    /**
     * Contains Path objects to be rendered on top of the layer.
     *
     * @type {rune.util.Paths}
     * @protected
     * @ignore
     */
    this.m_paths = new rune.util.Paths();

    /**
     * Reference to the Tile object used to represent all the tiles in the
     * layer. This reference is reused for each tile.
     *
     * @type {rune.tilemap.Tile}
     * @protected
     * @ignore
     */
    this.m_tmpTile = new rune.tilemap.Tile(this.m_map['tileWidth'], this.m_map['tileHeight']);

    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------

    this.m_construct();
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to this layer's mutable tile values, independent of source data.
 * Read-only refers to the property; the returned array remains mutable.
 *
 * @member {Array.<number>} data
 * @memberof rune.tilemap.TilemapDataLayer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.TilemapDataLayer.prototype, "data", {
    /**
     * @this rune.tilemap.TilemapDataLayer
     * @ignore
     */
    get : function() {
        return this.m_data;
    }
});

/**
 * A stack of Path objects.
 *
 * @member {rune.util.Paths} paths
 * @memberof rune.tilemap.TilemapDataLayer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.TilemapDataLayer.prototype, "paths", {
    /**
     * @this rune.tilemap.TilemapDataLayer
     * @ignore
     */
    get : function() {
        return this.m_paths;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Clears all map data.
 *
 * @returns {undefined}
 */
rune.tilemap.TilemapDataLayer.prototype.clear = function() {
    this.m_data = Array(this.m_map['numTiles']);
    for (var i = 0; i < this.m_data.length; i++) {
        this.m_data[i] = 0;
    }

    this.m_breakOwnerCache();
};

/**
 * Returns a temporary Tile describing the specified tile index.
 * Each layer reuses one Tile for getTileAt(), getTileOf() and getTileOfPoint().
 * The next query on this layer overwrites the same object. Pathfinding and
 * collision checks can also overwrite it through their internal tile queries.
 * Do not retain, modify or dispose the returned Tile. Copy the needed values
 * immediately when they must survive another layer operation. Use
 * getTileValueAt() when only the numeric tile value is needed.
 *
 * @example
 * var tile = layer.getTileAt(5);
 * var saved = {index: tile.index, value: tile.value, x: tile.x, y: tile.y};
 *
 * @param {number} i Zero-based linear tile index.
 *
 * @returns {rune.tilemap.Tile} Layer-owned reusable Tile, not an independent object.
 */
rune.tilemap.TilemapDataLayer.prototype.getTileAt = function(i) {
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];
    var wt = this.m_map['widthInTiles'];
    var tt = this.m_tmpTile;
    var tx = 0;
    var ty = 0;
    var tp = null;
    var value = this.getTileValueAt(i);

    if (this.m_isValidIndex(i)) {
        tx = i % wt;
        ty = Math.floor(i / wt);
        tp = this.m_map.getTilePropertiesOf(value);
    }

    tt.set(
        i,
        this.m_getOriginX() + (tx * tw),
        this.m_getOriginY() + (ty * th),
        value,
        tp
    );

    return tt;
};

/**
 * Returns the layer's reusable Tile at a pixel position.
 * Shares the temporary object used by getTileAt() and getTileOfPoint().
 * Later tile queries, pathfinding or collision checks on this layer can
 * overwrite it. Copy needed values immediately; do not modify or dispose it.
 *
 * @param {number} x X coordinate in pixels.
 * @param {number} y Y coordinate in pixels.
 *
 * @returns {rune.tilemap.Tile} Layer-owned reusable Tile.
 * @see rune.tilemap.TilemapDataLayer#getTileAt
 */
rune.tilemap.TilemapDataLayer.prototype.getTileOf = function(x, y) {
    return this.getTileAt(
        this.getTileIndexOf(x, y)
    );
};

/**
 * Returns the layer's reusable Tile at a point's pixel coordinates.
 * Shares the temporary object used by getTileAt() and getTileOf().
 * Later tile queries, pathfinding or collision checks on this layer can
 * overwrite it. Copy needed values immediately; do not modify or dispose it.
 *
 * @param {rune.geom.Point} p Point in pixel coordinates.
 *
 * @returns {rune.tilemap.Tile} Layer-owned reusable Tile.
 * @see rune.tilemap.TilemapDataLayer#getTileAt
 */
rune.tilemap.TilemapDataLayer.prototype.getTileOfPoint = function(p) {
    return this.getTileOf(
        p['x'],
        p['y']
    );
};

/**
 * Returns a list of Tile indices that fit within a specified rectangular area.
 *
 * @param {number} x Clipping area X in pixels.
 * @param {number} y Clipping area Y in pixels.
 * @param {number} w Clipping area width in pixels.
 * @param {number} h Clipping area height in pixels.
 *
 * @returns {Array.<number>}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileIndexesIn = function(x, y, w, h) {
    var od = [];
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];
    var wt = this.m_map['widthInTiles'];
    var ht = this.m_map['heightInTiles'];

    if (tw <= 0 || th <= 0 || wt <= 0 || ht <= 0 || w <= 0 || h <= 0) {
        return od;
    }

    x -= this.m_getOriginX();
    y -= this.m_getOriginY();

    var sx = Math.max(0, Math.floor(x / tw));
    var sy = Math.max(0, Math.floor(y / th));
    var ex = Math.min(wt - 1, Math.ceil((x + w) / tw) - 1);
    var ey = Math.min(ht - 1, Math.ceil((y + h) / th) - 1);

    if (ex < sx || ey < sy) {
        return od;
    }

    var ti = 0;

    for (var iy = sy; iy <= ey; iy++) {
        for (var ix = sx; ix <= ex; ix++) {
            od[ti] = ix + (iy * wt);
            ti++;
        }
    }

    return od;
};

/**
 * Returns a list of Tile indices contained within a described Rectangle object.
 *
 * @param {rune.geom.Rectangle} r Rectangle in pixel coordinates.
 *
 * @returns {Array.<number>}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileIndexesInRect = function(r) {
    return this.getTileIndexesIn(
        r['x'],
        r['y'],
        r['width'],
        r['height']
    );
};

/**
 * Returns the tile index at a pixel position, accounting for the layer origin.
 * The right and bottom boundaries are outside the layer.
 *
 * @param {number} x The x-coordinate of the position in pixels.
 * @param {number} y The y-coordinate of the position in pixels.
 *
 * @returns {number} Tile index, or -1 for an invalid or outside position.
 */
rune.tilemap.TilemapDataLayer.prototype.getTileIndexOf = function(x, y) {
    if (this.m_map == null || typeof x !== "number" || typeof y !== "number" ||
        !isFinite(x) || !isFinite(y)) {
        return -1;
    }
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];
    var wt = this.m_map['widthInTiles'];
    if (!isFinite(tw) || !isFinite(th) || tw <= 0 || th <= 0) {
        return -1;
    }

    var sx = Math.floor((x - this.m_getOriginX()) / tw);
    var sy = Math.floor((y - this.m_getOriginY()) / th);
    return this.containsCell(sx, sy) ? sy * wt + sx : -1;
};

/**
 * Returns the tile index at a pixel position, or -1 outside the layer.
 *
 * @param {rune.geom.Point} p Point in pixel coordinates.
 *
 * @returns {number}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileIndexOfPoint = function(p) {
    return this.getTileIndexOf(
        p['x'],
        p['y']
    );
};

/**
 * Checks whether integer cell coordinates lie within this layer.
 * Coordinates are local columns and rows, independent of pixel size or origin.
 *
 * @param {number} column Zero-based local cell column.
 * @param {number} row Zero-based local cell row.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.containsCell = function(column, row) {
    return this.m_map != null && this.m_data != null &&
        column === Math.floor(column) && row === Math.floor(row) &&
        column >= 0 && row >= 0 &&
        column < this.m_map['widthInTiles'] && row < this.m_map['heightInTiles'];
};

/**
 * Returns the tile value of a specific tile index.
 *
 * @param {number} i Zero-based linear tile index.
 *
 * @returns {number}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileValueAt = function(i) {
    return this.m_isValidIndex(i) ? this.m_data[i] || 0 : 0;
};

/**
 * Returns a tile value using local cell coordinates instead of a linear index.
 * Returns zero for cells outside the layer or non-integer coordinates.
 *
 * @param {number} column Zero-based local cell column.
 * @param {number} row Zero-based local cell row.
 *
 * @returns {number}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileValueAtCell = function(column, row) {
    return this.containsCell(column, row) ?
        this.getTileValueAt(row * this.m_map['widthInTiles'] + column) : 0;
};

/**
 * Returns tile values that fit within a specific rectangle.
 *
 * @param {number} x Clipping area X in pixels.
 * @param {number} y Clipping area Y in pixels.
 * @param {number} w Clipping area width in pixels.
 * @param {number} h Clipping area height in pixels.
 *
 * @returns {Array.<number>}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileValuesIn = function(x, y, w, h) {
    var od = [];
    var td = this.m_data;
    var ti = this.getTileIndexesIn(x, y, w, h);

    for (var i = 0; i < ti.length; i++) {
        od.push(td[ti[i]]);
    }

    return od;
};

/**
 * Returns tile values that fit within a specific rectangle object.
 *
 * @param {rune.geom.Rectangle} r Rectangle in pixel coordinates.
 *
 * @returns {Array.<number>}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileValuesInRect = function(r) {
    return this.getTileValuesIn(
        r['x'],
        r['y'],
        r['width'],
        r['height']
    );
};

/**
 * Returns the tile value at a pixel position, or zero outside the layer.
 *
 * @param {number} x Position X in pixels.
 * @param {number} y Position Y in pixels.
 *
 * @returns {number}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileValueOf = function(x, y) {
    return this.getTileValueAt(this.getTileIndexOf(x, y));
};

/**
 * Return the tile value of a specific position, defined via a Point object.
 *
 * @param {rune.geom.Point} p Point in pixel coordinates.
 *
 * @returns {number}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileValueOfPoint = function(p) {
    return this.getTileValueOf(
        p['x'],
        p['y']
    );
};

/**
 * Returns a Path object that describes the shortest path between two points
 * within the layer data.
 *
 * @param {number} sx Starting position X in pixels.
 * @param {number} sy Starting position Y in pixels.
 * @param {number} gx Target position X in pixels.
 * @param {number} gy Target position Y in pixels.
 * @param {boolean} [md=false] Whether the Path object is allowed to include diagonal paths.
 *
 * @param {Function} [isBlocked] Optional blocking rule using local cell (column, row).
 * @param {Object} [scope] Callback scope.
 * @returns {rune.util.Path} Path through cell centers in pixels, or null if unreachable.
 */
rune.tilemap.TilemapDataLayer.prototype.getPath = function(sx, sy, gx, gy, md, isBlocked, scope) {
    var si = this.getTileIndexOf(sx, sy);
    var gi = this.getTileIndexOf(gx, gy);

    if (!this.m_isValidIndex(si) || !this.m_isValidIndex(gi)) return null;

    var wt = this.m_map['widthInTiles'];
    var startBlocked = isBlocked ? isBlocked.call(scope, si % wt, Math.floor(si / wt)) : this.getTileAt(si)['allowCollisions'] > 0;
    var goalBlocked = isBlocked ? isBlocked.call(scope, gi % wt, Math.floor(gi / wt)) : this.getTileAt(gi)['allowCollisions'] > 0;

    if (startBlocked || goalBlocked) return null;

    var ad = this.m_computeDistance(si, gi, md, isBlocked, scope);
    if (ad == null) return null;

    var ap = [];
    this.m_walk(ad, gi, ap, md);

    var np = new rune.util.Path();
    var pi = ap.length - 1;
    var cn = null;

    while (pi >= 0) {
        cn = ap[pi--];
        if (cn != null) {
            np.addPoint(cn, true);
        }
    }

    return np;
};

/**
 * Returns a Path object that describes the shortest path between two points.
 *
 * @param {rune.geom.Point} s Starting point in pixels.
 * @param {rune.geom.Point} g Target point in pixels.
 * @param {boolean} [md=false] Whether the Path object is allowed to include diagonal paths.
 *
 * @param {Function} [isBlocked] Optional blocking rule using local cell (column, row).
 * @param {Object} [scope] Callback scope.
 * @returns {rune.util.Path} Path through cell centers in pixels, or null if unreachable.
 */
rune.tilemap.TilemapDataLayer.prototype.getPathBetweenPoints = function(s, g, md, isBlocked, scope) {
    return this.getPath(
        s['x'],
        s['y'],
        g['x'],
        g['y'],
        md,
        isBlocked,
        scope
    );
};

/**
 * Evaluates whether the tilemap layer overlaps another object.
 *
 * @param {rune.display.Stage|rune.display.InteractiveObject|rune.display.DisplayGroup|rune.tilemap.TilemapLayer|rune.geom.Point|Array} obj The object to be evaluated.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTest = function(obj, callback, scope) {
    if      (obj instanceof rune.display.Stage)             return this.hitTestChildrenOf(obj, callback, scope);
    else if (obj instanceof rune.display.InteractiveObject) return this.hitTestObject(obj, callback, scope);
    else if (obj instanceof rune.display.DisplayGroup)      return this.hitTestGroup(obj, callback, scope);
    else if (obj instanceof rune.geom.Point)                return this.hitTestPoint(obj, callback, scope);
    else if (obj instanceof Array)                          return this.hitTestContentOf(obj, callback, scope);
    else                                                    return false;
};

/**
 * Evaluates whether the tilemap layer overlaps child objects.
 *
 * @param {rune.display.DisplayObjectContainer} parent The object to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestChildrenOf = function(parent, callback, scope) {
    var result = false;
    parent.forEachChild(function(child) {
        if (this.hitTestObject(child, callback, scope)) {
            result = true;
        }
    }, this);

    return result;
};

/**
 * Evaluates every array entry using the same rules as hitTest().
 * Supports points, interactive objects, groups, stages and nested arrays.
 * Unsupported entries are ignored; callbacks run for all detected contacts.
 *
 * @param {Array} array The array to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestContentOf = function(array, callback, scope) {
    var result = false;
    for (var i = 0; i < array.length; i++) {
        if (this.hitTest(array[i], callback, scope)) {
            result = true;
        }
    }

    return result;
};

/**
 * Evaluates whether the tilemap layer overlaps another interactive object.
 *
 * @param {rune.display.InteractiveObject} obj The object to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestObject = function(obj, callback, scope) {
    var result = false;
    var tile = null;
    var tiles = this.getTileIndexesInRect(obj['hitbox']);
    for (var i = 0; i < tiles.length; i++) {
        tile = this.getTileAt(tiles[i]);
        if (tile['allowCollisions'] > 0) {
            if (obj.hitTestObject(tile, callback, scope)) {
                result = true;
            }
        }
    }

    return result;
};

/**
 * Evaluates whether the tilemap layer overlaps any member of a group.
 *
 * @param {rune.display.DisplayGroup} group The group to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestGroup = function(group, callback, scope) {
    var result = false;
    group.forEachMember(function(member) {
        if (this.hitTestObject(member, callback, scope)) {
            result = true;
        }
    }, this);

    return result;
};

/**
 * Evaluates whether a point overlaps a solid tile.
 *
 * @param {rune.geom.Point} point Point in pixel coordinates.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestPoint = function(point, callback, scope) {
    var i = this.getTileIndexOfPoint(point);
    var t = this.getTileAt(i);

    return t['allowCollisions'] > 0 && t.hitTestPoint(point, callback, scope);
};

/**
 * Evaluates and resolves collision between the tilemap layer and an object.
 *
 * @param {rune.display.Stage|rune.display.InteractiveObject|rune.display.DisplayGroup|rune.tilemap.TilemapLayer|Array} obj The object to be evaluated.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestAndSeparate = function(obj, callback, scope) {
    if      (obj instanceof rune.display.Stage)             return this.hitTestAndSeparateChildrenOf(obj, callback, scope);
    else if (obj instanceof rune.display.InteractiveObject) return this.hitTestAndSeparateObject(obj, callback, scope);
    else if (obj instanceof rune.display.DisplayGroup)      return this.hitTestAndSeparateGroup(obj, callback, scope);
    else if (obj instanceof Array)                          return this.hitTestAndSeparateContentOf(obj, callback, scope);
    else                                                    return false;
};

/**
 * Evaluates and resolves collision against child objects.
 *
 * @param {rune.display.DisplayObjectContainer} parent The parent object to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestAndSeparateChildrenOf = function(parent, callback, scope) {
    var result = false;
    parent.forEachChild(function(child) {
        if (this.hitTestAndSeparateObject(child, callback, scope)) {
            result = true;
        }
    }, this);

    return result;
};

/**
 * Evaluates and resolves collision against objects in an array.
 *
 * @param {Array} array The array object to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestAndSeparateContentOf = function(array, callback, scope) {
    var result = false;
    for (var i = 0; i < array.length; i++) {
        if (this.hitTestAndSeparate(array[i], callback, scope)) {
            result = true;
        }
    }

    return result;
};

/**
 * Resolves horizontal contacts against all candidate tiles before resolving
 * vertical contacts. Candidates are recalculated after horizontal separation
 * so internal wall seams cannot act as floors or ceilings.
 *
 * @param {rune.display.InteractiveObject} obj The object to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestAndSeparateObject = function(obj, callback, scope) {
    var result = false;
    var axes = ["x", "y"];
    for (var axis = 0; axis < axes.length; axis++) {
        var tiles = this.getTileIndexesInRect(obj['hitbox']);
        for (var i = 0; i < tiles.length; i++) {
            var tile = this.getTileAt(tiles[i]);
            if (tile['allowCollisions'] > 0) {
                if (this.m_hitTestAndSeparateTile(obj, tile, axes[axis], callback, scope)) {
                    result = true;
                }
            }
        }
    }

    return result;
};

/**
 * Evaluates and resolves collision against members of a group.
 *
 * @param {rune.display.DisplayGroup} group The group to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestAndSeparateGroup = function(group, callback, scope) {
    var result = false;
    group.forEachMember(function(member) {
        if (this.hitTestAndSeparateObject(member, callback, scope)) {
            result = true;
        }
    }, this);

    return result;
};

/**
 * Sets a tile value at a specified index.
 *
 * @param {number} i Zero-based linear tile index.
 * @param {number} v Value.
 *
 * @returns {undefined}
 */
rune.tilemap.TilemapDataLayer.prototype.setTileValueAt = function(i, v) {
    if (this.m_isValidIndex(i)) {
        this.m_data[i] = parseInt(v, 10) || 0;
        this.m_breakOwnerCache();
    }
};

/**
 * Sets a tile value using local cell coordinates instead of a linear index.
 * Ignores cells outside the layer and non-integer coordinates. Pixel size and
 * owner position do not affect these coordinates. Uses setTileValueAt() for
 * value conversion and render-cache invalidation.
 *
 * @example
 * layer.setTileValueAtCell(2, 1, 5);
 * var value = layer.getTileValueAtCell(2, 1);
 *
 * @param {number} column Zero-based local cell column.
 * @param {number} row Zero-based local cell row.
 * @param {number} value Tile value to set.
 *
 * @returns {undefined}
 * @see rune.tilemap.TilemapDataLayer#getTileValueAtCell
 */
rune.tilemap.TilemapDataLayer.prototype.setTileValueAtCell = function(column, row, value) {
    if (this.containsCell(column, row)) {
        this.setTileValueAt(row * this.m_map['widthInTiles'] + column, value);
    }
};

/**
 * Sets a tile value for all tiles that fit within a specific rectangular area.
 *
 * @param {number} x Area X in pixels.
 * @param {number} y Area Y in pixels.
 * @param {number} w Area width in pixels.
 * @param {number} h Area height in pixels.
 * @param {number} v The value to be set.
 *
 * @returns {undefined}
 */
rune.tilemap.TilemapDataLayer.prototype.setTileValueIn = function(x, y, w, h, v) {
    var t = this.getTileIndexesIn(x, y, w, h);
    for (var i = 0; i < t.length; i++) {
        this.setTileValueAt(t[i], v);
    }
};

/**
 * Sets a tile value for all tiles that fit within a specific rectangular area.
 *
 * @param {rune.geom.Rectangle} r Rectangle in pixel coordinates.
 * @param {number} v The value to be set.
 *
 * @returns {undefined}
 */
rune.tilemap.TilemapDataLayer.prototype.setTileValueInRect = function(r, v) {
    return this.setTileValueIn(
        r['x'],
        r['y'],
        r['width'],
        r['height'],
        v
    );
};

/**
 * Sets a tile value at a pixel position. Positions outside the layer are ignored.
 *
 * @param {number} x Position X in pixels.
 * @param {number} y Position Y in pixels.
 * @param {number} v The value to be set.
 *
 * @returns {undefined}
 */
rune.tilemap.TilemapDataLayer.prototype.setTileValueOf = function(x, y, v) {
    var ti = this.getTileIndexOf(x, y);

    this.setTileValueAt(ti, v);
};

/**
 * Sets a tile value for a tile at a specific position.
 *
 * @param {rune.geom.Point} p Point in pixel coordinates.
 * @param {number} v The value to be set.
 *
 * @returns {undefined}
 */
rune.tilemap.TilemapDataLayer.prototype.setTileValueOfPoint = function(p, v) {
    this.setTileValueOf(
        p.x,
        p.y,
        v
    );
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Preparing the object for deletion.
 *
 * @returns {undefined}
 * @ignore
 */
rune.tilemap.TilemapDataLayer.prototype.dispose = function() {
    this.m_data = null;
    this.m_map = null;
    this.m_owner = null;
    this.m_paths = null;
    this.m_tmpTile = null;
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Calculates the distance between a start and destination index.
 *
 * @param {number} si Start index.
 * @param {number} gi Target index.
 * @param {boolean} [md=false] Whether the distance may be calculated with diagonal movement.
 * @param {Function} [isBlocked] Optional blocking rule using local cell (column, row).
 * @param {Object} [scope] Callback scope.
 *
 * @returns {Array.<number>}
 * @protected
 * @ignore
 */
rune.tilemap.TilemapDataLayer.prototype.m_computeDistance = function(si, gi, md, isBlocked, scope) {
    var wt = this.m_map['widthInTiles'];
    var ht = this.m_map['heightInTiles'];
    var ms = this.m_map['numTiles'];

    if (!this.m_isValidIndex(si) || !this.m_isValidIndex(gi) || wt <= 0 || ht <= 0) {
        return null;
    }

    var ad = Array(ms);
    var td = 1;
    var tn = [si];
    var ca = null;
    var ci = 0;
    var cl = 0;
    var ni = 0;
    var dl = false;
    var dr = false;
    var du = false;
    var dd = false;
    var fe = false;

    var ti = 0;
    var tt = null;

    while(ti < ms) {
        tt = this.getTileAt(ti);

        if (isBlocked ? isBlocked.call(scope, ti % wt, Math.floor(ti / wt)) : ((tt) && (tt['allowCollisions'] > 0))) {
            ad[ti] = -2;
        } else {
            ad[ti] = -1;
        }

        ti++;
    }

    ad[si] = 0;

    while(tn.length > 0) {
        ca = tn;
        tn = [];

        ti = 0;
        cl = ca.length;

        while (ti < cl) {
            ci = ca[ti++];
            if (ci == gi) {
                fe = true;
                ca.length = 0;
                break;
            }

            var cx = ci % wt;
            var cy = Math.floor(ci / wt);

            dl = (cx > 0);
            dr = (cx < wt - 1);
            du = (cy > 0);
            dd = (cy < ht - 1);

            if (du) {
                ni = ci - wt;
                if (ad[ni] == -1) {
                    ad[ni] = td;
                    tn.push(ni);
                }
            }

            if (dr) {
                ni = ci + 1;
                if (ad[ni] == -1) {
                    ad[ni] = td;
                    tn.push(ni);
                }
            }

            if (dd) {
                ni = ci + wt;
                if (ad[ni] == -1) {
                    ad[ni] = td;
                    tn.push(ni);
                }
            }

            if (dl) {
                ni = ci - 1;
                if (ad[ni] == -1) {
                    ad[ni] = td;
                    tn.push(ni);
                }
            }

            if (md == true) {

                if (du && dr) {
                    ni = ci - wt + 1;
                    if ((ad[ni] == -1) && (ad[ci - wt] >= -1) && (ad[ci + 1] >= -1)) {
                        ad[ni] = td;
                        tn.push(ni);
                    }
                }

                if (dr && dd) {
                    ni = ci + wt + 1;
                    if ((ad[ni] == -1) && (ad[ci + wt] >= -1) && (ad[ci + 1] >= -1)) {
                        ad[ni] = td;
                        tn.push(ni);
                    }
                }

                if (dl && dd) {
                    ni = ci + wt - 1;
                    if ((ad[ni] == -1) && (ad[ci + wt] >= -1) && (ad[ci - 1] >= -1)) {
                        ad[ni] = td;
                        tn.push(ni);
                    }
                }

                if (du && dl) {
                    ni = ci - wt - 1;
                    if ((ad[ni] == -1) && (ad[ci - wt] >= -1) && (ad[ci - 1] >= -1)) {
                        ad[ni] = td;
                        tn.push(ni);
                    }
                }
            }
        }

        td++;
    }

    if (!fe) {
        ad = null;
    }

    return ad;
};

/**
 * Iteratively walks the grid backwards to reconstruct the shortest path
 * without growing the call stack. Diagonal steps require both neighboring
 * orthogonal cells to be open, matching the search.
 *
 * @param {Array} ad Distance array.
 * @param {number} si Start index.
 * @param {Array} ap Path array.
 * @param {boolean} [md=false] Whether diagonal calculations should be used.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.tilemap.TilemapDataLayer.prototype.m_walk = function(ad, si, ap, md) {
    var wt = this.m_map['widthInTiles'];
    var ht = this.m_map['heightInTiles'];
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];

    var originX = this.m_getOriginX();
    var originY = this.m_getOriginY();

    while (true) {
        ap.push(new rune.geom.Point(
            originX + (si % wt) * tw + tw * 0.5,
            originY + Math.floor(si / wt) * th + th * 0.5
        ));
        
        if (ad[si] == 0) return;
        
        var sx = si % wt;
        var sy = Math.floor(si / wt);
        var dl = (sx > 0);
        var dr = (sx < wt - 1);
        var du = (sy > 0);
        var dd = (sy < ht - 1);
        
        var cd = ad[si];
        var ci = 0;
        
        if (du) {
            ci = si - wt;
            if ((ad[ci] >= 0) && (ad[ci] < cd)) {
                si = ci;
                continue;
            }
        }
        
        if (dr) {
            ci = si + 1;
            if ((ad[ci] >= 0) && (ad[ci] < cd)) {
                si = ci;
                continue;
            }
        }
        
        if (dd) {
            ci = si + wt;
            if ((ad[ci] >= 0) && (ad[ci] < cd)) {
                si = ci;
                continue;
            }
        }
        
        if (dl) {
            ci = si - 1;
            if ((ad[ci] >= 0) && (ad[ci] < cd)) {
                si = ci;
                continue;
            }
        }
        
        if (md == true) {
            
            if (du && dr) {
                ci = si - wt + 1;
                if ((ad[ci] >= 0) && (ad[ci] < cd) &&
                    (ad[si - wt] >= -1) && (ad[si + 1] >= -1)) {
                    si = ci;
                    continue;
                }
            }
            
            if (dr && dd) {
                ci = si + wt + 1;
                if ((ad[ci] >= 0) && (ad[ci] < cd) &&
                    (ad[si + wt] >= -1) && (ad[si + 1] >= -1)) {
                    si = ci;
                    continue;
                }
            }
            
            if (dl && dd) {
                ci = si + wt - 1;
                if ((ad[ci] >= 0) && (ad[ci] < cd) &&
                    (ad[si + wt] >= -1) && (ad[si - 1] >= -1)) {
                    si = ci;
                    continue;
                }
            }
            
            if (du && dl) {
                ci = si - wt - 1;
                if ((ad[ci] >= 0) && (ad[ci] < cd) &&
                    (ad[si - wt] >= -1) && (ad[si - 1] >= -1)) {
                    si = ci;
                    continue;
                }
            }
        }
        
        return;
    }
};

/**
 * The class constructor.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.tilemap.TilemapDataLayer.prototype.m_construct = function() {
    this.m_constructData();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Loading data.
 *
 * @returns {undefined}
 * @private
 */
rune.tilemap.TilemapDataLayer.prototype.m_constructData = function() {
    if (this.m_data == null || this.m_data.length == 0) {
        this.clear();
    } else {
        if ((this.m_data.length > 0) && (this.m_data.length !== this.m_map['numTiles'])) {
            throw new Error("Invalid map data.");
        }
    }
};

/**
 * Returns the x origin of this layer.
 *
 * @returns {number}
 * @private
 */
rune.tilemap.TilemapDataLayer.prototype.m_getOriginX = function() {
    return this.m_owner != null ? this.m_owner['x'] : 0;
};

/**
 * Returns the y origin of this layer.
 *
 * @returns {number}
 * @private
 */
rune.tilemap.TilemapDataLayer.prototype.m_getOriginY = function() {
    return this.m_owner != null ? this.m_owner['y'] : 0;
};

/**
 * Evaluates and resolves collision against a tile object.
 *
 * @param {rune.display.InteractiveObject} obj The object to evaluate.
 * @param {rune.tilemap.Tile} tile Tile object.
 * @param {string} axis The movement axis to resolve, either "x" or "y".
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 * @private
 */
rune.tilemap.TilemapDataLayer.prototype.m_hitTestAndSeparateTile = function(obj, tile, axis, callback, scope) {
    if (obj.hitTestObject(tile)) {
        if (this.m_separateTile(obj, tile, axis)) {
            if (typeof callback === "function") {
                callback.call(scope || obj, obj, tile);
            }
        }

        return true;
    }

    return false;
};

/**
 * Separates one tile contact along the requested axis. The caller completes
 * the horizontal pass over the layer before starting vertical separation.
 *
 * @param {rune.display.InteractiveObject} obj The object to separate.
 * @param {rune.tilemap.Tile} tile Tile object.
 * @param {string} axis The movement axis to resolve, either "x" or "y".
 *
 * @returns {boolean}
 * @private
 */
rune.tilemap.TilemapDataLayer.prototype.m_separateTile = function(obj, tile, axis) {
    return axis == "x" ? rune.physics.Space.separateX(obj, tile) :
        rune.physics.Space.separateY(obj, tile);
};

/**
 * Breaks the owner's render cache, if any.
 *
 * @returns {undefined}
 * @private
 */
rune.tilemap.TilemapDataLayer.prototype.m_breakOwnerCache = function() {
    if (this.m_owner != null && typeof this.m_owner['breakCache'] === "function") {
        this.m_owner['breakCache']();
    }
};

/**
 * Returns whether the specified index is valid.
 *
 * @param {number} i Zero-based linear tile index.
 *
 * @returns {boolean}
 * @protected
 * @ignore
 */
rune.tilemap.TilemapDataLayer.prototype.m_isValidIndex = function(i) {
    i = Number(i);

    return (
        this.m_data != null &&
        this.m_map != null &&
        i === Math.floor(i) &&
        i >= 0 &&
        i < this.m_map['numTiles']
    );
};
