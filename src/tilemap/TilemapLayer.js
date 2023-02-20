//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new object of TilemapLayer.
 * 
 * @constructor
 *
 * @param {rune.tilemap.Tilemap} map Reference to the map to which the layer belongs.
 * @param {Array.<number>} [data] Tilemap data.
 * 
 * @class
 * @classdesc
 * 
 * The rune.tilemap.TilemapLayer class represents a layer (buffer) within a 
 * Tilemap. Each layer has its own set of Tiles, which can be managed from the 
 * layer object. A Tilemap object automatically instantiates two layers; one 
 * for the back buffer, and one for the front buffer.
 *
 * @see rune.tilemap.Tilemap
 */
rune.tilemap.TilemapLayer = function(map, data) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Whether the layer should be rendered or not. Useful for troubleshooting.
     *
     * @type {boolean}
     * @private
     */
    this.visible = true;
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Map data.
     *
     * @type {Array.<number>}
     * @private
     */
    this.m_data = data || null;
    
    /**
     * Reference to the map to which the layer belongs.
     *
     * @type {rune.tilemap.Tilemap}
     * @private
     */
    this.m_map = map;
    
    /**
     * Contains Path objects to be rendered on top of the layer. Used 
     * primarily for troubleshooting.
     *
     * @type {rune.util.Paths}
     * @private
     */
    this.m_paths = new rune.util.Paths();
    
    /**
     * Reference to the Tile object used to represent all the tiles in the 
     * layer. This reference is reused for each tile in order to reduce 
     * and stabilize memory consumption.
     *
     * @type {rune.tilemap.Tile}
     * @private
     */
    this.m_tmpTile = new rune.tilemap.Tile(this.m_map['tileWidth'], this.m_map['tileHeight']);
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------
    
    /**
     * Invokes secondary class constructor.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * A stack of Path objects. Each object included in the stack is rendered on 
 * top of the layer. Used primarily for troubleshooting.
 *
 * @member {rune.util.Paths} paths
 * @memberof rune.tilemap.TilemapLayer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tilemap.TilemapLayer.prototype, "paths", {
    /**
     * @this rune.tilemap.TilemapLayer
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
rune.tilemap.TilemapLayer.prototype.clear = function() {
    this.m_data = Array(this.m_map['numTiles']);
    for (var i = 0; i < this.m_data.length; i++) {
        this.m_data[i] = 0;
    }
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
 * @private
 */
rune.tilemap.TilemapLayer.prototype.getPath = function(sx, sy, gx, gy, md) {
    var si = this.getTileIndexOf(sx, sy);
    var gi = this.getTileIndexOf(gx, gy);
    
    var st = this.getTileAt(si);
    var gt = this.getTileAt(gi);
    
    if ((st['allowCollisions'] > 0) && (gt['allowCollisions'] > 0)) return null;
    
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
 * Returns a path object that describes the shortest path between two points in the layer data, where the start and 
 * destination points are defined via Point objects.
 *
 * @param {rune.geom.Point} s Starting point.
 * @param {rune.geom.Point} g Target point.
 * @param {boolean} [md=false] Whether the Path object is allowed to include diagonal paths.
 *
 * @returns {rune.util.Path}
 * @private
 */
rune.tilemap.TilemapLayer.prototype.getPathBetweenPoints = function(s, g, md) {
    return this.getPath(
        s['x'],
        s['y'],
        g['x'],
        g['y'],
        md
    );
};

/**
 * Returns a Tile object based on a specified tile index.
 *
 * @param {number} i Tile index.
 *
 * @returns {rune.tilemap.Tile}
 */
rune.tilemap.TilemapLayer.prototype.getTileAt = function(i) {
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];
    var wt = this.m_map['widthInTiles'];
    var tt = this.m_tmpTile;
    var tx = i % wt;
    var ty = Math.floor(i / wt);
    var tp = this.m_map.getTilePropertiesOf(this.getTileValueAt(i));
        
    tt.set(
        i,
        tx * tw,
        ty * th,
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
rune.tilemap.TilemapLayer.prototype.getTileOf = function(x, y) {
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
rune.tilemap.TilemapLayer.prototype.getTileOfPoint = function(p) {
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
rune.tilemap.TilemapLayer.prototype.getTileIndexesIn = function(x, y, w, h) {
    var od = [];
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];
    var wt = this.m_map['widthInTiles'];
    
    var sx = Math.floor(x / tw);
    var sy = Math.floor(y / th);
    var si = sy * wt + sx;
    
    var bx = (x % tw) ? 1 : 0;
    var by = (y % th) ? 1 : 0;
    
    var iw = Math.ceil(w / tw) + bx;
    var ih = Math.ceil(h / th) + by;
    var ti = 0;
    
    var ii = 0;
    for (var iy = 0; iy < ih; iy++) {
        for (var ix = 0; ix < iw; ix++) {
            od[ti] = si + ix + (iy * wt);
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
rune.tilemap.TilemapLayer.prototype.getTileIndexesInRect = function(r) {
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
rune.tilemap.TilemapLayer.prototype.getTileIndexOf = function(x, y) {    
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];
    var wt = this.m_map['widthInTiles'];
        
    var sx = Math.floor(x / tw);
    var sy = Math.floor(y / th);
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
rune.tilemap.TilemapLayer.prototype.getTileIndexOfPoint = function(p) {
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
rune.tilemap.TilemapLayer.prototype.getTileValueAt = function(i) {
    return this.m_data[i];
};

/**
 * Returns tile values that fit within a specific rectangle (clipping area).
 *
 * @param {number} x The x-coordinate of the clipping area.
 * @param {number} y The y-coordinate of the clipping area.
 * @param {number} w The width of the clipping area.
 * @param {number} h The height of the clipping area.
 *
 * @returns {Array.<number>}
 * @private
 */
rune.tilemap.TilemapLayer.prototype.getTileValuesIn = function(x, y, w, h) {
    var od = [];
    var td = this.m_data;
    var ti = this.getTileIndexesIn(x, y, w, h);
    
    for (var i = 0; i < ti.length; i++) {
        od.push(td[ti[i]]);
    }
    
    return od;
};

/**
 * Returns tile values that fit within a specific rectangle object (clipping area).
 *
 * @param {rune.geom.Rectangle} r Rectangle object.
 *
 * @returns {Array.<number>}
 */
rune.tilemap.TilemapLayer.prototype.getTileValuesInRect = function(r) {
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
rune.tilemap.TilemapLayer.prototype.getTileValueOf = function(x, y) {
    var td = this.m_data;
    var ti = this.getTileIndexOf(x, y);
    
    return td[ti];
};

/**
 * Return the tile value of a specific position, which is defined via a 
 * Point object.
 *
 * @param {rune.geom.Point} p Point object.
 *
 * @returns {number}
 */
rune.tilemap.TilemapLayer.prototype.getTileValueOfPoint = function(p) {
    return this.getTileValueOf(
        p['x'],
        p['y']
    );
};

/**
 * Evaluates whether the tilemap layer overlaps or intersects another object. 
 * This process only includes tiles that are solid ie. which has some form 
 * of collision data associated with it.
 *
 * @param {rune.display.DisplayObjectContainer|rune.display.InteractiveObject|rune.display.DisplayGroup|rune.geom.Point} obj The object to be evaluated.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapLayer.prototype.hitTest = function(obj, callback, scope) {
    if      (obj instanceof rune.display.DisplayObjectContainer) return this.hitTestChildrenOf(obj, callback, scope);
    else if (obj instanceof rune.display.InteractiveObject)      return this.hitTestObject(obj, callback, scope);
    else if (obj instanceof rune.display.DisplayGroup)           return this.hitTestGroup(obj, callback, scope);
    else if (obj instanceof rune.geom.Point)                     return this.hitTestPoint(obj, callback, scope);
    else                                                         return false;
};

/**
 * Evaluates whether the tilemap layer overlaps or intersects the hitbox 
 * of any of the child objects within the specified parent object.
 *
 * @param {rune.display.DisplayObjectContainer} parent The object to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapLayer.prototype.hitTestChildrenOf = function(parent, callback, scope) {
    var result = false;
    parent.forEachChild(function(child) {
        if (this.hitTestObject(child, callback, scope)) {
            result = true;
        }
    }, this);
    
    return result;
};

/**
 * Evaluates whether the tilemap layer overlaps or intersects the hitbox of 
 * another interactive object.
 *
 * @param {rune.display.InteractiveObject} obj The object to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapLayer.prototype.hitTestObject = function(obj, callback, scope) {
    var result = false;
    var tile = null;
    var tiles = this.getTileIndexesInRect(obj['hitbox']);
    for (var i = 0; i < tiles.length; i++) {
        var value = this.getTileValueAt(tiles[i]);
        if (value > 0) {
            tile = this.getTileAt(tiles[i]);
            if (obj.hitTestObject(tile, callback, scope)) {
                result = true;
            }
        }
    }
    
    return result;
};

/**
 * Evaluates whether the tilemap layer overlaps or intersects the hitbox of 
 * any of the members within the specified group.
 *
 * @param {rune.display.DisplayGroup} group The group to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapLayer.prototype.hitTestGroup = function(group, callback, scope) {
    var result = false;
    group.forEachMember(function(member) {
        if (this.hitTestObject(member, callback, scope)) {
            result = true;
        }
    }, this);
    
    return result;
};

/**
 * Evaluates whether the specified Point object overlaps a solid tile in 
 * the tilemap layer.
 *
 * @param {rune.geom.Point} point The point to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapLayer.prototype.hitTestPoint = function(point, callback, scope) {
    var i = this.getTileIndexOfPoint(point);
    var t = this.getTileAt(i);
    
    return t.hitTestPoint(point, callback, scope);
};

/**
 * Evaluates and resolves collision between the tilemap layer and an interactive object's hitbox.
 *
 * @param {rune.display.DisplayObjectContainer|rune.display.InteractiveObject|rune.display.DisplayGroup} obj The object to be evaluated.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapLayer.prototype.hitTestAndSeparate = function(obj, callback, scope) {
    if      (obj instanceof rune.display.DisplayObjectContainer) return this.hitTestAndSeparateChildrenOf(obj, callback, scope);
    else if (obj instanceof rune.display.InteractiveObject)      return this.hitTestAndSeparateObject(obj, callback, scope);
    else if (obj instanceof rune.display.DisplayGroup)           return this.hitTestAndSeparateGroup(obj, callback, scope);
    else                                                         return false;
};

/**
 * Evaluates and resolves collision between the tilemap layer and the hitbox of child objects of the specified parent object.
 *
 * @param {rune.display.DisplayObjectContainer} parent The parent object to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapLayer.prototype.hitTestAndSeparateChildrenOf = function(parent, callback, scope) {
    var result = false;
    parent.forEachChild(function(child) {
        if (this.hitTestAndSeparateObject(child, callback, scope)) {
            result = true;
        }
    }, this);
    
    return result;
};

/**
 * Evaluates and resolves collision between the tilemap layer and the hitbox of an interactive object.
 *
 * @param {rune.display.InteractiveObject} obj The obje5
 ct to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapLayer.prototype.hitTestAndSeparateObject = function(obj, callback, scope) {
    // @work
    var result = false;
    var tile = null;
    var tiles = this.getTileIndexesInRect(obj['hitbox']);
    for (var i = 0; i < tiles.length; i++) {
        var value = this.getTileValueAt(tiles[i]);
        if (value > 0) {
            tile = this.getTileAt(tiles[i]);
            if (obj.hitTestAndSeparateObject(tile, callback, scope)) {
                result = true;
            }
        }
    }
    
    return result;
};

/**
 * Evaluates and resolves collision between the tilemap layer and the hitbox of the members of the specified group object.
 *
 * @param {rune.display.DisplayGroup} group The group to evaluate.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.tilemap.TilemapLayer.prototype.hitTestAndSeparateGroup = function(group, callback, scope) {
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
rune.tilemap.TilemapLayer.prototype.setTileValueAt = function(i, v) {
    this.m_data[i] = parseInt(v, 16);
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
rune.tilemap.TilemapLayer.prototype.setTileValueIn = function(x, y, w, h, v) {
    var t = this.getTileIndexesIn(x, y, w, h);
    for (var i = 0; i < t.length; i++) {
        this.setTileValueAt(t[i], v);
    }
};

/**
 * Sets a tile value for all tiles that fit within a specific rectangular area, 
 * where the area is represented by a Rectangle object.
 *
 * @param {rune.geom.Rectangle} r Rectangle object.
 * @param {number} v The value to be set.
 *
 * @returns {undefined}
 */
rune.tilemap.TilemapLayer.prototype.setTileValueInRect = function(r, v) {
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
rune.tilemap.TilemapLayer.prototype.setTileValueOf = function(x, y, v) {
    var td = this.m_data;
    var ti = this.getTileIndexOf(x, y);
    
    td[ti] = v;
};

/**
 * Sets a tile value for a tile at a specific position, where the position consists of a Point object.
 *
 * @param {rune.geom.Point} p Point object.
 * @param {number} v The value to be set.
 *
 * @returns {undefined}
 */
rune.tilemap.TilemapLayer.prototype.setTileValueOfPoint = function(p, v) {
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
rune.tilemap.TilemapLayer.prototype.dispose = function() {
    this.clear();
    this.m_data = null;
    this.m_map = null;
    this.m_tmpTile = null;
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
rune.tilemap.TilemapLayer.prototype.m_construct = function() {
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
rune.tilemap.TilemapLayer.prototype.m_constructData = function() {
    if (this.m_data == null) {
        this.clear();
    } else {
        if (this.m_data.length !== this.m_map['numTiles']) {
            throw new Error("Invalid map data.");
        }
    }    
};

/**
 * Calculates the distance between a start and destination index.
 *
 * @param {number} si Start index.
 * @param {number} gi Target index.
 * @param {boolean} [md=false] Whether the distance may be calculated with diagonal movement.
 *
 * @returns {Array.<number>}
 * @private
 */
rune.tilemap.TilemapLayer.prototype.m_computeDistance = function(si, gi, md) {
    var wt = this.m_map['widthInTiles'];
    var ht = this.m_map['heightInTiles'];
    var ms = this.m_map['numTiles'];
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
            
            dl = (ci % wt > 0);
            dr = (ci % wt < wt - 1);
            du = (ci / wt > 0);
            dd = (ci / wt < ht - 1);
              
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
 * Recursive function that walks through the grid backwards, with the aim of finding 
 * the shortest path back to the starting position.
 *
 * @param {Array} ad Distance array.
 * @param {number} si Start index.
 * @param {Array} ap Path array.
 * @param {boolean} [md=false] Whether diagonal calculations should be used.
 *
 * @returns {undefined}
 * @private
 */
rune.tilemap.TilemapLayer.prototype.m_walk = function(ad, si, ap, md) {
    var wt = this.m_map['widthInTiles'];
    var ht = this.m_map['heightInTiles'];
    var tw = this.m_map['tileWidth'];
    var th = this.m_map['tileHeight'];
    
    ap.push(new rune.geom.Point(
        parseInt(si % wt, 10) * tw + tw * 0.5, 
        parseInt(si / wt, 10) * th + th * 0.5
    ));
    
    if (ad[si] == 0) return;
    
    var dl = (si % wt > 0);
    var dr = (si % wt < wt - 1);
    var du = (si / wt > 0);
    var dd = (si / wt < ht - 1);
    
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