//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new TilemapDataLayer object.
 *
 * @constructor
 *
 * @param {Object} map Reference to the map to which the layer belongs.
 * @param {Array.<number>} [data] Tilemap data.
 * @param {rune.display.DisplayObject} [owner] Optional display object that owns this layer.
 *
 * @class
 * @classdesc
 *
 * The TilemapDataLayer class represents tilemap layer data, collision and
 * pathfinding behavior that can be shared by tilemap and display based tile
 * structures.
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
     * Map data.
     *
     * @type {Array.<number>}
     * @protected
     * @ignore
     */
    this.m_data = data || null;

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
 * Reference to the raw map data of the layer.
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
 * Returns a Tile object based on a specified tile index.
 *
 * @param {number} i Tile index.
 *
 * @returns {rune.tilemap.Tile}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileAt = function(i) {
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];
    var wt = this.m_map['widthInTiles'];
    var tt = this.m_tmpTile;
    var tx = 0;
    var ty = 0;
    var tp = null;

    if (this.m_isValidIndex(i)) {
        tx = i % wt;
        ty = Math.floor(i / wt);
        tp = this.m_map.getTilePropertiesOf(this.getTileValueAt(i));
    }

    tt.set(
        i,
        this.m_getOriginX() + (tx * tw),
        this.m_getOriginY() + (ty * th),
        tp
    );

    return tt;
};

/**
 * Returns a Tile object based on the given x and y coordinates.
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 *
 * @returns {rune.tilemap.Tile}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileOf = function(x, y) {
    return this.getTileAt(
        this.getTileIndexOf(x, y)
    );
};

/**
 * Returns a Tile object based on the specified Point object.
 *
 * @param {rune.geom.Point} p Point object.
 *
 * @returns {rune.tilemap.Tile}
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
 * @param {number} x The x-coordinate of the clipping area.
 * @param {number} y The y-coordinate of the clipping area.
 * @param {number} w The width of the clipping area.
 * @param {number} h The height of the clipping area.
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
 * @param {rune.geom.Rectangle} r Rectangle object.
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
 * Returns the tile index of a specific position.
 *
 * @param {number} x The x-coordinate of the position.
 * @param {number} y The y-coordinate of the position.
 *
 * @returns {number}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileIndexOf = function(x, y) {
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];
    var wt = this.m_map['widthInTiles'];

    var sx = Math.floor((x - this.m_getOriginX()) / tw);
    var sy = Math.floor((y - this.m_getOriginY()) / th);
    var si = sy * wt + sx;

    return si;
};

/**
 * Returns the tile index of a specific position, via a Point object.
 *
 * @param {rune.geom.Point} p Point object.
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
 * Returns the tile value of a specific tile index.
 *
 * @param {number} i Tile index.
 *
 * @returns {number}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileValueAt = function(i) {
    return this.m_isValidIndex(i) ? this.m_data[i] || 0 : 0;
};

/**
 * Returns tile values that fit within a specific rectangle.
 *
 * @param {number} x The x-coordinate of the clipping area.
 * @param {number} y The y-coordinate of the clipping area.
 * @param {number} w The width of the clipping area.
 * @param {number} h The height of the clipping area.
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
 * @param {rune.geom.Rectangle} r Rectangle object.
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
 * Returns the tile value of a specific position.
 *
 * @param {number} x The x-coordinate of the position.
 * @param {number} y The y-coordinate of the position.
 *
 * @returns {number}
 */
rune.tilemap.TilemapDataLayer.prototype.getTileValueOf = function(x, y) {
    var td = this.m_data;
    var ti = this.getTileIndexOf(x, y);

    return td[ti];
};

/**
 * Return the tile value of a specific position, defined via a Point object.
 *
 * @param {rune.geom.Point} p Point object.
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
 * @param {number} sx The x-coordinate of the starting point.
 * @param {number} sy The y-coordinate of the starting point.
 * @param {number} gx The x-coordinate of the target point.
 * @param {number} gy The y-coordinate of the target point.
 * @param {boolean} [md=false] Whether the Path object is allowed to include diagonal paths.
 *
 * @returns {rune.util.Path}
 */
rune.tilemap.TilemapDataLayer.prototype.getPath = function(sx, sy, gx, gy, md) {
    var si = this.getTileIndexOf(sx, sy);
    var gi = this.getTileIndexOf(gx, gy);

    if (!this.m_isValidIndex(si) || !this.m_isValidIndex(gi)) return null;

    var startBlocked = this.getTileAt(si)['allowCollisions'] > 0;
    var goalBlocked  = this.getTileAt(gi)['allowCollisions'] > 0;

    if (startBlocked || goalBlocked) return null;

    var ad = this.m_computeDistance(si, gi, md);
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
 * @param {rune.geom.Point} s Starting point.
 * @param {rune.geom.Point} g Target point.
 * @param {boolean} [md=false] Whether the Path object is allowed to include diagonal paths.
 *
 * @returns {rune.util.Path}
 */
rune.tilemap.TilemapDataLayer.prototype.getPathBetweenPoints = function(s, g, md) {
    return this.getPath(
        s['x'],
        s['y'],
        g['x'],
        g['y'],
        md
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
 * Evaluates whether the tilemap layer overlaps any object in an array.
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
        if (this.hitTestObject(array[i], callback, scope)) {
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
 * @param {rune.geom.Point} point The point to evaluate.
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
 * Evaluates and resolves collision against an interactive object.
 *
 * @param {rune.display.InteractiveObject} obj The object to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapDataLayer.prototype.hitTestAndSeparateObject = function(obj, callback, scope) {
    var result = false;
    var tile = null;
    var tiles = this.getTileIndexesInRect(obj['hitbox']);
    for (var i = 0; i < tiles.length; i++) {
        tile = this.getTileAt(tiles[i]);
        if (tile['allowCollisions'] > 0) {
            if (this.m_hitTestAndSeparateTile(obj, tile, callback, scope)) {
                result = true;
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
 * @param {number} i Index.
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
 * Sets a tile value for all tiles that fit within a specific rectangular area.
 *
 * @param {number} x The x-position of the area.
 * @param {number} y The y-position of the area.
 * @param {number} w The width of the area.
 * @param {number} h The height of the area.
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
 * @param {rune.geom.Rectangle} r Rectangle object.
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
 * Sets a tile value for a tile at a specific position.
 *
 * @param {number} x The x-coordinate of the position.
 * @param {number} y The y-coordinate of the position.
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
 * @param {rune.geom.Point} p Point object.
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
 *
 * @returns {Array.<number>}
 * @protected
 * @ignore
 */
rune.tilemap.TilemapDataLayer.prototype.m_computeDistance = function(si, gi, md) {
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

        if ((tt) && (tt['allowCollisions'] > 0)) {
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
 * Recursive function that walks through the grid backwards, with the aim of
 * finding the shortest path back to the starting position.
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

    ap.push(new rune.geom.Point(
        this.m_getOriginX() + parseInt(si % wt, 10) * tw + tw * 0.5,
        this.m_getOriginY() + parseInt(si / wt, 10) * th + th * 0.5
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
            this.m_walk(ad, ci, ap, md);
            return;
        }
    }

    if (dr) {
        ci = si + 1;
        if ((ad[ci] >= 0) && (ad[ci] < cd)) {
            this.m_walk(ad, ci, ap, md);
            return;
        }
    }

    if (dd) {
        ci = si + wt;
        if((ad[ci] >= 0) && (ad[ci] < cd)) {
            this.m_walk(ad, ci, ap, md);
            return;
        }
    }

    if (dl) {
        ci = si - 1;
        if ((ad[ci] >= 0) && (ad[ci] < cd)) {
            this.m_walk(ad, ci, ap, md);
            return;
        }
    }

    if (md == true) {

        if (du && dr) {
            ci = si - wt + 1;
            if ((ad[ci] >= 0) && (ad[ci] < cd)) {
                this.m_walk(ad, ci, ap, md);
                return;
            }
        }

        if (dr && dd) {
            ci = si + wt + 1;
            if ((ad[ci] >= 0) && (ad[ci] < cd)) {
                this.m_walk(ad, ci, ap, md);
                return;
            }
        }

        if (dl && dd) {
            ci = si + wt - 1;
            if ((ad[ci] >= 0) && (ad[ci] < cd)) {
                this.m_walk(ad, ci, ap, md);
                return;
            }
        }

        if (du && dl) {
            ci = si - wt - 1;
            if ((ad[ci] >= 0) && (ad[ci] < cd)) {
                this.m_walk(ad, ci, ap, md);
                return;
            }
        }
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
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 * @private
 */
rune.tilemap.TilemapDataLayer.prototype.m_hitTestAndSeparateTile = function(obj, tile, callback, scope) {
    if (obj.hitTestObject(tile)) {
        if (this.m_separateTile(obj, tile)) {
            if (typeof callback === "function") {
                callback.call(scope || obj, obj, tile);
            }
        }

        return true;
    }

    return false;
};

/**
 * Separates an object from a tile, using the object's dominant movement axis.
 *
 * @param {rune.display.InteractiveObject} obj The object to separate.
 * @param {rune.tilemap.Tile} tile Tile object.
 *
 * @returns {boolean}
 * @private
 */
rune.tilemap.TilemapDataLayer.prototype.m_separateTile = function(obj, tile) {
    if (this.m_shouldSeparateYFirst(obj)) {
        if (rune.physics.Space.separateY(obj, tile)) return true;
        return obj.hitTestObject(tile) && rune.physics.Space.separateX(obj, tile);
    }

    if (rune.physics.Space.separateX(obj, tile)) return true;
    return obj.hitTestObject(tile) && rune.physics.Space.separateY(obj, tile);
};

/**
 * Evaluates whether tile separation should prioritize the y axis.
 *
 * @param {rune.display.InteractiveObject} obj The object to evaluate.
 *
 * @returns {boolean}
 * @private
 */
rune.tilemap.TilemapDataLayer.prototype.m_shouldSeparateYFirst = function(obj) {
    var dx = Math.abs(obj['hitbox']['x'] - obj['hitbox']['previousX']);
    var dy = Math.abs(obj['hitbox']['y'] - obj['hitbox']['previousY']);

    return dy >= dx;
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
 * @param {number} i Index.
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