//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new World object.
 *
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {rune.tilemap.Tilemap} map Caller-owned tilemap.
 * @param {rune.tilemap.TilemapDataLayer} [layer] Wall layer; defaults to map.back.
 *
 * @class
 * @classdesc
 *
 * Owns world objects through the normal display container lifecycle. Add each
 * world to one update hierarchy; several viewports may observe it. The caller
 * owns the tilemap. Rays, movement and paths share isBlocked().
 */
rune.raycast.World = function(map, layer) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Tilemap supplying wall graphics, geometry and map properties.
     *
     * @type {rune.tilemap.Tilemap}
     */
    this.map = map;

    /**
     * Tilemap layer supplying wall values and collision flags.
     *
     * @type {rune.tilemap.TilemapDataLayer}
     */
    this.layer = layer || map.back;

    /**
     * Whether to project a flat ceiling instead of the sky.
     *
     * @type {boolean}
     */
    this.ceilingEnabled = map.getProperty("ceilingEnabled", true) !== false;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.display.DisplayObjectContainer.
     */
    rune.display.DisplayObjectContainer.call(this, 0, 0, 1, 1);

    //--------------------------------------------------------------------------
    // Override public properties
    //--------------------------------------------------------------------------

    /**
     * @inheritDoc
     */
    this.visible = false;
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.raycast.World.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.raycast.World.prototype.constructor = rune.raycast.World;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Floor image selected by the map.
 *
 * @member {?HTMLImageElement} floorTexture
 * @memberof rune.raycast.World
 * @instance
 * @readonly
 */
Object.defineProperty(rune.raycast.World.prototype, "floorTexture", {
    /**
     * @this rune.raycast.World
     * @ignore
     */
    get : function() {
        return this.m_getSurfaceTexture("floorTexture");
    }
});

/**
 * Ceiling image selected by the map.
 *
 * @member {?HTMLImageElement} ceilingTexture
 * @memberof rune.raycast.World
 * @instance
 * @readonly
 */
Object.defineProperty(rune.raycast.World.prototype, "ceilingTexture", {
    /**
     * @this rune.raycast.World
     * @ignore
     */
    get : function() {
        return this.m_getSurfaceTexture("ceilingTexture");
    }
});

/**
 * Panorama image selected by the map.
 *
 * @member {?HTMLImageElement} skyTexture
 * @memberof rune.raycast.World
 * @instance
 * @readonly
 */
Object.defineProperty(rune.raycast.World.prototype, "skyTexture", {
    /**
     * @this rune.raycast.World
     * @ignore
     */
    get : function() {
        return this.m_getSurfaceTexture("skyTexture");
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Checks whether a cell blocks rays, movement and pathfinding.
 * Any tile collision flags block the entire cell. Out-of-bounds cells block.
 *
 * @param {number} column Cell column.
 * @param {number} row Cell row.
 *
 * @returns {boolean}
 */
rune.raycast.World.prototype.isBlocked = function(column, row) {
    if (!this.layer.containsCell(column, row) ||
        this.layer.getTileAt(row * this.map['widthInTiles'] + column)['allowCollisions'] !== 0) {
        return true;
    }
    
    var door = this.getDoorAt(column, row);
    return door != null && !door['isOpen'];
};

/**
 * Casts against blocking wall and door cells using grid traversal.
 * Every documented field is overwritten when reusing the output object.
 * Rays touching a blocked grid corner are stopped by either adjacent cell.
 *
 * @param {number} x Ray origin in tile units.
 * @param {number} y Ray origin in tile units.
 * @param {number} dx Ray direction x.
 * @param {number} dy Ray direction y.
 * @param {number} [range=64] Maximum ray parameter; use a unit direction for tile distances.
 * @param {Object} [output] Reusable hit result.
 *
 * @throws {RangeError} Ray arguments must be finite.
 * @returns {Object}
 */
rune.raycast.World.prototype.cast = function(x, y, dx, dy, range, output) {
    return this.m_castCells(x, y, dx, dy, range, output, false);
};

/**
 * Finds a door placed at the specified cell, regardless of its opening state.
 *
 * @param {number} column Cell column.
 * @param {number} row Cell row.
 *
 * @returns {?rune.raycast.Door}
 */
rune.raycast.World.prototype.getDoorAt = function(column, row) {
    var children = this.getChildren();
    for (var i = 0; i < children.length; i++) {
        var object = children[i];
        if (object instanceof rune.raycast.Door && object.x === column && object.y === row) {
            return object;
        }
    }
    
    return null;
};

/**
 * Returns the nearest blocking cell or active billboard hit. Cells win distance ties.
 * Billboards use floor-plane radii; Surfaces use their fixed plane segments.
 * Both are independent of visual size along Y, elevation and image transparency.
 *
 * @param {number} x Ray origin in tile units.
 * @param {number} y Ray origin in tile units.
 * @param {number} dx Ray direction x.
 * @param {number} dy Ray direction y.
 * @param {number} [range=64] Maximum ray parameter; use a unit direction for tile distances.
 * @param {Object} [output] Reusable hit result.
 * @param {Function} [filter] Object eligibility callback.
 * @param {Object} [scope] Callback scope.
 *
 * @returns {Object}
 */
rune.raycast.World.prototype.trace = function(x, y, dx, dy, range, output, filter, scope) {
    var hit = this.cast(x, y, dx, dy, range, output);
    var children = this.getChildren();
    for (var i = 0; i < children.length; i++) {
        var object = children[i];
        if (!(object instanceof rune.raycast.Billboard) || !object.active ||
            (filter && !filter.call(scope, object))) {
            continue;
        }
        
        var distance = this.m_getObjectDistance(object, x, y, dx, dy);
        if (distance >= 0 && distance <= hit.distance && (!hit.hit || distance < hit.distance)) {
            this.m_resetHit(hit, x, y, dx, dy, distance);
            hit.hit = true;
            hit.object = object;
        }
    }
    return hit;
};

/**
 * Picks a visible interactive billboard or doorway, respecting wall occlusion.
 *
 * @param {number} x Ray origin in tile units.
 * @param {number} y Ray origin in tile units.
 * @param {number} dx Ray direction x.
 * @param {number} dy Ray direction y.
 * @param {number} [range=64] Maximum ray parameter; use a unit direction for tile distances.
 *
 * @returns {?(rune.raycast.Billboard|rune.raycast.Door)}
 */
rune.raycast.World.prototype.pick = function(x, y, dx, dy, range) {
    var hit = this.trace(x, y, dx, dy, range, null, this.m_isInteractive, this);
    var target = hit.object;
    if (target != null && !this.m_isInteractive(target)) {
        target = null;
    }
    
    var children = this.getChildren();
    for (var i = 0; i < children.length; i++) {
        var door = children[i];
        if (!(door instanceof rune.raycast.Door) || !this.m_isInteractive(door)) {
            continue;
        }
        var distance = door.getRayDistance(x, y, dx, dy);
        if (distance >= 0 && (distance < hit.distance || (!hit.hit && distance === hit.distance))) {
            hit.hit = true;
            hit.distance = distance;
            target = door;
        }
    }
    
    return target;
};

/**
 * Checks center-to-center distance on the map, including the range boundary.
 * Ignores object radii, elevation, activity and walls. Points do not need to be
 * world children, so caller-owned player cameras can be queried directly.
 *
 * @param {Object} a First actor or point with x and y in tiles.
 * @param {Object} b Second actor or point with x and y in tiles.
 * @param {number} range Maximum distance in tiles.
 *
 * @throws {RangeError} If positions or range are invalid.
 * @returns {boolean}
 */
rune.raycast.World.prototype.isWithinDistance = function(a, b, range) {
    if (!this.m_hasPosition(a) || !this.m_hasPosition(b) ||
        typeof range !== "number" || !isFinite(range) || range < 0) {
        throw new RangeError("Distance queries require finite positions and a non-negative range.");
    }
    
    var dx = Math.abs(a.x - b.x);
    var dy = Math.abs(a.y - b.y);
    if (dx > range || dy > range) {
        return false;
    }
    
    var squaredRange = range * range;
    if (range > 0 && (squaredRange === 0 || !isFinite(squaredRange))) {
        dx /= range;
        dy /= range;
        return dx * dx + dy * dy <= 1;
    }
    
    return dx * dx + dy * dy <= squaredRange;
};

/**
 * Checks the map-plane segment between two actors or points. Walls, closed and
 * partly open doors, out-of-map cells and custom isBlocked() rules obstruct it.
 * An optional field of view checks facing before casting. Omitting it retains
 * an unrestricted sight query. Elevation and visual transparency are ignored.
 *
 * An optional filter selects active direct-child Billboards that also obstruct
 * sight, using the same circle/Surface intersection hook as trace(). Source and
 * target are always excluded. Visibility and interactive flags do not affect blockers.
 * Without a filter, Billboards never obstruct this query.
 *
 * @param {Object} source Observer or point with x and y in tiles.
 * @param {Object} target Target actor or point with x and y in tiles.
 * @param {Function|number} [filter] Object blocker callback, or field of view in radians.
 * @param {Object} [scope] Callback scope when filter is a function.
 * @param {number} [fov] Full cone width in radians, greater than zero and at most 2*PI.
 * Uses source.angle (radians) when present, otherwise source.direction (x/y).
 * A full circle or coincident points do not require a heading. Camera.fov is
 * never applied implicitly; pass it explicitly to opt in.
 *
 * @throws {RangeError} If positions, field of view or a required heading are invalid.
 * @returns {boolean} Whether the complete segment, including endpoints, is clear.
 */
rune.raycast.World.prototype.hasLineOfSight = function(source, target, filter, scope, fov) {
    if (!this.m_hasPosition(source) || !this.m_hasPosition(target)) {
        throw new RangeError("Sight queries require finite positions.");
    }
    
    if (typeof filter === "number" && fov == null) {
        fov = filter;
        filter = null;
    }
    
    var dx = target.x - source.x;
    var dy = target.y - source.y;
    if (fov != null && !this.m_isInFieldOfView(source, dx, dy, fov)) {
        return false;
    }
    
    if (this.cast(source.x, source.y, dx, dy, 1).hit) {
        return false;
    }
    
    if (filter) {
        var children = this.getChildren();
        for (var i = 0; i < children.length; i++) {
            var object = children[i];
            if (object === source || object === target ||
                !(object instanceof rune.raycast.Billboard) || !object.active ||
                !filter.call(scope, object)) {
                continue;
            }
            var distance = this.m_getObjectDistance(object, source.x, source.y, dx, dy);
            if (distance >= 0 && distance <= 1) {
                return false;
            }
        }
    }
    
    return true;
};

/**
 * Returns active direct children whose x/y positions lie within a tile radius.
 * The boundary is included. Visibility, interaction flags, object size and walls
 * do not affect the query. Results retain child order and contain original objects.
 *
 * Also accepts (position, radius, filter, scope, output), where position is a
 * point or actor. Like the coordinate form, this includes the query actor itself;
 * use a filter when it should be excluded.
 *
 * @example
 * var nearby = world.getObjectsInRadius(player, 3, function(object) {
 *     return object !== player && object instanceof Enemy;
 * });
 *
 * @param {(number|Object)} x Query center X, or point/actor in tiles.
 * @param {number} y Query center y in tiles.
 * @param {number} radius Non-negative radius in tiles.
 * @param {Function} [filter] Optional eligibility callback receiving each object in range.
 * @param {Object} [scope] Callback scope.
 * @param {Array.<rune.display.DisplayObject>} [output] Caller-owned array to clear and reuse.
 *
 * @returns {Array.<rune.display.DisplayObject>}
 * @throws {RangeError} If coordinates or radius are non-finite, or radius is negative.
 */
rune.raycast.World.prototype.getObjectsInRadius = function(x, y, radius, filter, scope, output) {
    if (x != null && typeof x === "object") {
        output = /** @type {Array.<rune.display.DisplayObject>} */ (scope);
        scope = filter;
        filter = /** @type {Function} */ (/** @type {*} */ (radius));
        radius = y;
        y = x.y;
        x = x.x;
    }
    if (!isFinite(x) || !isFinite(y) || !isFinite(radius) || radius < 0) {
        throw new RangeError("A radius query requires finite coordinates and a non-negative radius.");
    }
    var objects = output || [];
    objects.length = 0;
    var children = this.getChildren();
    var distanceSquared = radius * radius;
    for (var i = 0; i < children.length; i++) {
        var object = children[i];
        if (object['active'] && rune.geom.Point.distanceSquared(x, y, object.x, object.y) <= distanceSquared &&
            (!filter || filter.call(scope, object))) {
            objects.push(object);
        }
    }
    
    return objects;
};

/**
 * Returns the nearest active direct child within range, or null when none match.
 * Uses center positions in tiles and includes the range boundary. The position
 * object itself is excluded. Equal distances retain the first child in order.
 * Visibility, interaction flags, object radii, elevation and walls are ignored.
 *
 * @param {Object} position Query point or actor with x and y in tiles.
 * @param {number} range Maximum distance in tiles.
 * @param {Function} [filter] Eligibility callback receiving each object in range.
 * @param {Object} [scope] Callback scope.
 *
 * @throws {RangeError} If position or range is invalid.
 * @returns {?rune.display.DisplayObject} Original world object, not a copy.
 */
rune.raycast.World.prototype.getNearestObject = function(position, range, filter, scope) {
    if (!this.m_hasPosition(position) || typeof range !== "number" || !isFinite(range) || range < 0) {
        throw new RangeError("Nearest-object queries require a finite position and non-negative range.");
    }
    
    var nearest = null;
    var nearestDistance = Infinity;
    var children = this.getChildren();
    for (var i = 0; i < children.length; i++) {
        var object = children[i];
        if (object === position || !object.active || !this.m_hasPosition(object) ||
            !this.isWithinDistance(position, object, range) || (filter && !filter.call(scope, object))) {
            continue;
        }
        var distance = rune.geom.Point.distanceSquared(position.x, position.y, object.x, object.y);
        if (nearest == null || distance < nearestDistance) {
            nearest = object;
            nearestDistance = distance;
        }
    }
    
    return nearest;
};

/**
 * Checks floor-plane circle contact without moving or separating the objects.
 * Objects need finite x/y positions and non-negative finite radii in tile units.
 * Self-contact, inactive objects, invalid circles and doors return false.
 * Visibility, interactive flags, elevation and walls do not affect the test.
 * Objects do not need to belong to this world; caller-owned players also work.
 *
 * @param {Object} a First actor with x, y and radius.
 * @param {Object} b Second actor with x, y and radius.
 *
 * @returns {boolean}
 */
rune.raycast.World.prototype.overlaps = function(a, b) {
    if (a === b || !this.m_hasRadius(a) || !this.m_hasRadius(b) ||
        a['active'] === false || b['active'] === false ||
        a instanceof rune.raycast.Door || b instanceof rune.raycast.Door) {
        return false;
    }
    
    var radius = a.radius + b.radius;
    return rune.geom.Point.distanceSquared(a.x, a.y, b.x, b.y) <= radius * radius;
};

/**
 * Checks an actor's circular footprint against a unit cell, including contact
 * with its edges or corners. Uses x, y and radius in tile units without moving
 * the actor. Activity, visibility, elevation, cell contents and map bounds are
 * ignored, making the query suitable for door occupancy and trigger cells.
 *
 * @param {Object} actor Actor or point with finite x/y and non-negative radius.
 * @param {number} column Integer cell column.
 * @param {number} row Integer cell row.
 *
 * @returns {boolean} False for invalid actor geometry or cell coordinates.
 */
rune.raycast.World.prototype.overlapsCell = function(actor, column, row) {
    if (!this.m_hasRadius(actor) || typeof column !== "number" || typeof row !== "number" ||
        !isFinite(column) || !isFinite(row) || column !== Math.floor(column) || row !== Math.floor(row)) {
        return false;
    }
    
    return this.m_overlapsCell(actor.x, actor.y, actor.radius, column, row);
};

/**
 * Returns active direct children whose floor-plane circles touch the actor.
 * The actor itself and doors are excluded. Uses overlaps() for contact rules.
 * Results retain child order; the query never applies damage or separation.
 * Filter, scope and reusable output work like getObjectsInRadius().
 *
 * @param {Object} actor Actor with x, y and radius in tile units.
 * @param {Function} [filter] Optional eligibility callback receiving each overlapping object.
 * @param {Object} [scope] Callback scope.
 * @param {Array.<rune.display.DisplayObject>} [output] Caller-owned array to clear and reuse.
 *
 * @returns {Array.<rune.display.DisplayObject>}
 */
rune.raycast.World.prototype.getOverlappingObjects = function(actor, filter, scope, output) {
    var objects = output || [];
    objects.length = 0;
    var children = this.getChildren();
    for (var i = 0; i < children.length; i++) {
        var object = children[i];
        if (this.overlaps(actor, object) && (!filter || filter.call(scope, object))) {
            objects.push(object);
        }
    }
    return objects;
};

/**
 * Checks whether an actor fits at a position without moving it. Uses the actor's
 * radius (default 0.2 tiles) and the same circle/cell collision as move(). Walls,
 * closed or partly open doors, solid surfaces, map bounds and custom isBlocked() rules apply.
 * Other actors, activity, visibility, elevation and visual size are ignored.
 * Only the destination is tested; this does not check the route to that position.
 *
 * @param {Object} actor Actor supplying an optional collision radius in tiles.
 * @param {Object} position Destination point with x and y in tiles.
 *
 * @throws {RangeError} If the actor is missing, position is invalid or radius is invalid.
 * @returns {boolean} Whether the destination can accommodate the actor.
 */
rune.raycast.World.prototype.canOccupy = function(actor, position) {
    var radius = actor != null && actor.radius != null ? actor.radius : 0.2;
    if (actor == null || !this.m_hasPosition(position) ||
        typeof radius !== "number" || !isFinite(radius) || radius < 0) {
        throw new RangeError("Occupancy queries require an actor, finite position and non-negative radius.");
    }
    if (!this.layer.containsCell(Math.floor(position.x - radius), Math.floor(position.y - radius)) ||
        !this.layer.containsCell(Math.floor(position.x + radius), Math.floor(position.y + radius))) {
        return false;
    }
    return !this.m_overlapsWall(position.x, position.y, radius) &&
        !this.m_overlapsSurfaces(this.m_getSolidSurfaces(actor), position.x, position.y, 0, 0, radius);
};

/**
 * Moves an object with circular wall/surface collision and axis sliding.
 * Small displacement steps prevent tunneling through blocked cells.
 *
 * @param {Object} object Actor whose x and y coordinates are updated.
 * @param {number} dx Horizontal displacement in tiles.
 * @param {number} dy Vertical displacement in tiles.
 * @param {number} [radius] Collision radius; defaults to object.radius, otherwise 0.2.
 *
 * @throws {RangeError} Position, displacement and radius must be finite.
 * @returns {Object} The moved actor.
 */
rune.raycast.World.prototype.move = function(object, dx, dy, radius) {
    if (radius == null) {
        radius = object != null && object.radius != null ? object.radius : 0.2;
    }
    radius = Math.max(0, radius);
    if (object == null || typeof object.x !== "number" || typeof object.y !== "number" ||
        typeof dx !== "number" || typeof dy !== "number" ||
        !isFinite(object.x) || !isFinite(object.y) || !isFinite(dx) || !isFinite(dy) || !isFinite(radius)) {
        throw new RangeError("Movement requires finite positions, displacements and radius.");
    }
    var steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.1));
    if (!isFinite(steps)) {
        throw new RangeError("Movement displacement is too large.");
    }
    var surfaces = this.m_getSolidSurfaces(object);
    dx /= steps;
    dy /= steps;
    for (var i = 0; i < steps; i++) {
        if (!this.m_overlapsWall(object.x + dx, object.y, radius) &&
            !this.m_overlapsSurfaces(surfaces, object.x, object.y, dx, 0, radius)) {
            object.x += dx;
        }
        if (!this.m_overlapsWall(object.x, object.y + dy, radius) &&
            !this.m_overlapsSurfaces(surfaces, object.x, object.y, 0, dy, radius)) {
            object.y += dy;
        }
    }
    return object;
};

/**
 * Moves an actor toward a point by at most distance tiles, without overshooting.
 * Uses normal wall and door collision and the actor's radius. This method does
 * not find a path; use Navigator to travel around obstacles.
 *
 * @param {Object} actor Actor whose x and y coordinates are updated.
 * @param {Object} destination Point or actor with x and y in tile units.
 * @param {number} distance Maximum travel distance in tiles.
 * @param {number} [radius] Optional collision radius override.
 *
 * @throws {RangeError} If positions or distance are invalid.
 * @returns {boolean} Whether the actor changed position.
 * @suppress {checkTypes}
 */
rune.raycast.World.prototype.moveTowards = function(actor, destination, distance, radius) {
    if (actor == null || destination == null || typeof distance !== "number" ||
        !isFinite(distance) || distance < 0 ||
        typeof actor.x !== "number" || typeof actor.y !== "number" ||
        typeof destination.x !== "number" || typeof destination.y !== "number" ||
        !isFinite(actor.x) || !isFinite(actor.y) || !isFinite(destination.x) || !isFinite(destination.y)) {
        throw new RangeError("Movement requires finite positions and a non-negative distance.");
    }
    var dx = destination.x - actor.x;
    var dy = destination.y - actor.y;
    var length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0 || distance === 0) {
        return false;
    }
    var scale = Math.min(distance / length, 1);
    var previousX = actor.x;
    var previousY = actor.y;
    this.move(actor, dx * scale, dy * scale, radius);
    return actor.x !== previousX || actor.y !== previousY;
};

/**
 * Uses the tilemap layer search and returns cell centers in tile units.
 * The query uses isBlocked() without changing the layer collision data.
 *
 * @param {number} startX Start x in tiles.
 * @param {number} startY Start y in tiles.
 * @param {number} goalX Goal x in tiles.
 * @param {number} goalY Goal y in tiles.
 * @param {boolean} [diagonal=false] Whether diagonal steps are allowed.
 *
 * @returns {?rune.util.Path}
 */
rune.raycast.World.prototype.getPath = function(startX, startY, goalX, goalY, diagonal) {
    if (!this.layer.containsCell(Math.floor(startX), Math.floor(startY)) ||
        !this.layer.containsCell(Math.floor(goalX), Math.floor(goalY))) {
        return null;
    }
    var tileWidth = this.map['tileWidth'];
    var tileHeight = this.map['tileHeight'];
    var path = this.layer.getPath(startX * tileWidth, startY * tileHeight, goalX * tileWidth, goalY * tileHeight,
        diagonal, this.isBlocked, this);
    if (path != null) {
        for (var i = 0; i < path.length; i++) {
            var point = path.getAt(i);
            point.x /= tileWidth;
            point.y /= tileHeight;
        }
    }
    return path;
};

/**
 * Finds a path between actors or points without extracting their coordinates.
 * Uses the same blocking rules and tile-unit cell centers as getPath().
 *
 * @param {Object} start Starting actor or point with x and y in tiles.
 * @param {Object} goal Target actor or point with x and y in tiles.
 * @param {boolean} [diagonal=false] Whether diagonal steps are allowed.
 *
 * @returns {?rune.util.Path} Path, or null when no route is available.
 */
rune.raycast.World.prototype.getPathBetweenPoints = function(start, goal, diagonal) {
    return this.getPath(start.x, start.y, goal.x, goal.y, diagonal);
};

//------------------------------------------------------------------------------
// Override public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds a normal display child. Doors require an unoccupied, empty wall cell.
 *
 * @param {rune.display.DisplayObject} child World object to add.
 * @param {number} index Child index.
 *
 * @returns {rune.display.DisplayObject}
 * @throws {Error} If a door is outside the map, in a wall, or overlaps a door.
 * @inheritDoc
 */
rune.raycast.World.prototype.addChildAt = function(child, index) {
    if (child instanceof rune.raycast.Door) {
        var existing = this.getDoorAt(child.x, child.y);
        if (!this.layer.containsCell(child.x, child.y) ||
            this.layer.getTileAt(child.y * this.map['widthInTiles'] + child.x)['allowCollisions'] !== 0 ||
            (existing != null && existing !== child)) {
            throw new Error("A door requires an empty wall cell without another door.");
        }
    }
    return rune.display.DisplayObjectContainer.prototype.addChildAt.call(this, child, index);
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Keeps the world out of ordinary 2D rendering. Children update normally.
 *
 * @returns {undefined}
 * @inheritDoc
 */
rune.raycast.World.prototype.render = function() {
};

/**
 * Disposes the display children and releases references to the caller-owned map.
 *
 * @returns {undefined}
 * @inheritDoc
 */
rune.raycast.World.prototype.dispose = function() {
    rune.display.DisplayObjectContainer.prototype.dispose.call(this);
    this.map = null;
    this.layer = null;
};

//------------------------------------------------------------------------------
// Package prototype methods (RENDERING)
//------------------------------------------------------------------------------

/**
 * Casts against visible wall and door surfaces for perspective rendering.
 * Unlike cast(), a partly open door reveals its opening visually; gameplay
 * queries deliberately keep its entire cell blocked until it is fully open.
 *
 * @param {number} x Ray origin x.
 * @param {number} y Ray origin y.
 * @param {number} dx Ray direction x.
 * @param {number} dy Ray direction y.
 * @param {number} [range=64] Maximum ray parameter.
 * @param {Object} [output] Reusable hit result.
 *
 * @throws {RangeError} Ray arguments must be finite.
 * @returns {Object}
 * @package
 * @ignore
 */
rune.raycast.World.prototype.castView = function(x, y, dx, dy, range, output) {
    var hit = this.m_castCells(x, y, dx, dy, range, output, true);
    var children = this.getChildren();
    for (var i = 0; i < children.length; i++) {
        var door = children[i];
        if (!(door instanceof rune.raycast.Door) || door['isOpen'] || !door.visible) {
            continue;
        }
        var distance = door.getRayDistance(x, y, dx, dy);
        if (distance < 0 || distance > hit.distance || (hit.hit && distance === hit.distance)) {
            continue;
        }
        var px = x + dx * distance;
        var py = y + dy * distance;
        var u = door.getTextureOffset(px, py);
        if (u < 0 || u >= 1) {
            continue;
        }
        this.m_resetHit(hit, x, y, dx, dy, distance);
        hit.hit = true;
        hit.object = door;
        hit.column = door.x;
        hit.row = door.y;
        hit.side = door.orientation === rune.raycast.Door.VERTICAL ? 0 : 1;
        hit.u = u;
    }
    return hit;
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Intersects a ray with a billboard circle or fixed Surface segment on the map.
 * Override this method to use a custom interaction shape.
 *
 * @param {rune.raycast.Billboard} object Billboard to intersect.
 * @param {number} x Ray origin in tile units.
 * @param {number} y Ray origin in tile units.
 * @param {number} dx Ray direction x.
 * @param {number} dy Ray direction y.
 *
 * @returns {number}
 * @protected
 * @ignore
 */
rune.raycast.World.prototype.m_getObjectDistance = function(object, x, y, dx, dy) {
    if (object instanceof rune.raycast.Surface) {
        return object.getRayDistance(x, y, dx, dy);
    }
    
    if (!this.m_hasRadius(object)) {
        return -1;
    }
    
    var ox = x - object.x;
    var oy = y - object.y;
    var a = dx * dx + dy * dy;
    var offsetSquared = ox * ox + oy * oy - object.radius * object.radius;
    if (offsetSquared <= 0) {
        return 0;
    }
    
    if (a === 0) {
        return -1;
    }
    
    var b = ox * dx + oy * dy;
    var discriminant = b * b - a * offsetSquared;
    return discriminant < 0 ? -1 : (-b - Math.sqrt(discriminant)) / a;
};

/**
 * Checks whether a world object is eligible for interaction.
 * Override to add game-specific rules for both billboards and doors.
 *
 * @param {rune.display.DisplayObject} object Object to evaluate.
 *
 * @returns {boolean}
 * @protected
 * @ignore
 */
rune.raycast.World.prototype.m_isInteractive = function(object) {
    return object['active'] && object.visible && object['alpha'] > 0 && object['interactive'];
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Checks an observer-relative cone without changing position or facing.
 * Uses a small angular tolerance to include points exactly on the boundary.
 *
 * @param {Object} source Observer with angle or direction.
 * @param {number} dx Target displacement along X.
 * @param {number} dy Target displacement along Y.
 * @param {number} fov Full field of view in radians.
 *
 * @throws {RangeError} If field of view or a required heading is invalid.
 * @returns {boolean}
 * @private
 */
rune.raycast.World.prototype.m_isInFieldOfView = function(source, dx, dy, fov) {
    if (typeof fov !== "number" || !isFinite(fov) || fov <= 0 || fov > Math.PI * 2) {
        throw new RangeError("Field of view must be greater than zero and at most 2*PI radians.");
    }
    
    if (fov === Math.PI * 2 || (dx === 0 && dy === 0)) {
        return true;
    }
    
    var angle = source.angle;
    if (angle == null) {
        var direction = source.direction;
        if (!this.m_hasPosition(direction) || (direction.x === 0 && direction.y === 0)) {
            throw new RangeError("Sight cones require an observer angle or non-zero direction.");
        }
        
        angle = Math.atan2(direction.y, direction.x);
    } else if (typeof angle !== "number" || !isFinite(angle)) {
        throw new RangeError("Observer angle must be finite radians.");
    }
    
    var difference = rune.util.Math.angleDifference(angle, Math.atan2(dy, dx));
    return Math.abs(difference) <= fov / 2 + 0.000000000001;
};

/**
 * Checks the finite tile coordinates used by point-based world queries.
 *
 * @param {Object} object Actor or point to evaluate.
 *
 * @returns {boolean}
 * @private
 */
rune.raycast.World.prototype.m_hasPosition = function(object) {
    return object != null && typeof object.x === "number" && typeof object.y === "number" &&
        isFinite(object.x) && isFinite(object.y);
};

/**
 * Checks the world-space position and radius used by actor contact and ray hits.
 *
 * @param {Object} object Actor to evaluate.
 *
 * @returns {boolean}
 * @private
 */
rune.raycast.World.prototype.m_hasRadius = function(object) {
    return this.m_hasPosition(object) && typeof object.radius === "number" &&
        isFinite(object.radius) && object.radius >= 0;
};

/**
 * Resolves an optional map image through the normal resource library.
 *
 * @param {string} name Map property naming an image resource.
 *
 * @returns {?HTMLImageElement}
 * @private
 */
rune.raycast.World.prototype.m_getSurfaceTexture = function(name) {
    var key = this.map.getProperty(name);
    var resource = key && this['application'].resources.get(key);
    return resource ? resource.data : null;
};

/**
 * Overwrites every query result field for a miss at the supplied distance.
 *
 * @param {Object} hit Reusable result.
 * @param {number} x Ray origin in tile units.
 * @param {number} y Ray origin in tile units.
 * @param {number} dx Ray direction x.
 * @param {number} dy Ray direction y.
 * @param {number} distance Ray parameter at the endpoint.
 *
 * @returns {Object}
 * @private
 */
rune.raycast.World.prototype.m_resetHit = function(hit, x, y, dx, dy, distance) {
    hit.hit = false;
    hit.distance = distance;
    hit.x = x + dx * distance;
    hit.y = y + dy * distance;
    hit.object = null;
    hit.column = -1;
    hit.row = -1;
    hit.side = -1;
    hit.tile = 0;
    hit.u = 0;
    return hit;
};

/**
 * Selects active solid planes once for a movement or occupancy query.
 * The list is local to the query so adding, removing or changing surfaces
 * requires no persistent collision cache or invalidation rules.
 *
 * @param {Object} actor Moving object to exclude.
 *
 * @returns {Array.<rune.raycast.Surface>}
 * @private
 */
rune.raycast.World.prototype.m_getSolidSurfaces = function(actor) {
    var children = this.getChildren();
    var surfaces = [];
    for (var i = 0; i < children.length; i++) {
        var object = children[i];
        if (object !== actor && object instanceof rune.raycast.Surface && object.active && object.solid) {
            surfaces.push(object);
        }
    }
    return surfaces;
};

/**
 * Tests a displacement against the selected solid planes.
 *
 * @param {Array.<rune.raycast.Surface>} surfaces Collision candidates.
 * @param {number} x Start X in tiles.
 * @param {number} y Start Y in tiles.
 * @param {number} dx Displacement X in tiles.
 * @param {number} dy Displacement Y in tiles.
 * @param {number} radius Circle radius in tiles.
 *
 * @returns {boolean}
 * @private
 */
rune.raycast.World.prototype.m_overlapsSurfaces = function(surfaces, x, y, dx, dy, radius) {
    for (var i = 0; i < surfaces.length; i++) {
        if (surfaces[i].blocksMovement(x, y, dx, dy, radius)) {
            return true;
        }
    }
    return false;
};

/**
 * Tests a circle against the nearest points on blocked cells.
 *
 * @param {number} x Center x in tiles.
 * @param {number} y Center y in tiles.
 * @param {number} radius Circle radius in tiles.
 *
 * @returns {boolean}
 * @private
 */
rune.raycast.World.prototype.m_overlapsWall = function(x, y, radius) {
    for (var row = Math.floor(y - radius); row <= Math.floor(y + radius); row++) {
        for (var column = Math.floor(x - radius); column <= Math.floor(x + radius); column++) {
            if (!this.isBlocked(column, row)) {
                continue;
            }
            if (this.m_overlapsCell(x, y, radius, column, row)) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Tests circle-to-cell contact for occupancy queries and movement collision.
 *
 * @param {number} x Circle center X in tiles.
 * @param {number} y Circle center Y in tiles.
 * @param {number} radius Circle radius in tiles.
 * @param {number} column Cell column.
 * @param {number} row Cell row.
 *
 * @returns {boolean}
 * @private
 */
rune.raycast.World.prototype.m_overlapsCell = function(x, y, radius, column, row) {
    var nearestX = Math.max(column, Math.min(x, column + 1));
    var nearestY = Math.max(row, Math.min(y, row + 1));
    return rune.geom.Point.distanceSquared(x, y, nearestX, nearestY) <= radius * radius;
};

/**
 * Traverses blocking cells. Rendering can skip door cells to project their planes.
 * Doors must be placed in empty wall-layer cells.
 *
 * @param {number} x Ray origin x.
 * @param {number} y Ray origin y.
 * @param {number} dx Ray direction x.
 * @param {number} dy Ray direction y.
 * @param {number|undefined} range Maximum ray parameter.
 * @param {Object|undefined} output Reusable result.
 * @param {boolean} ignoreDoors Whether to skip door cells.
 *
 * @returns {Object}
 * @private
 */
rune.raycast.World.prototype.m_castCells = function(x, y, dx, dy, range, output, ignoreDoors) {
    range = range == null ? 64 : Math.max(0, range);
    if (typeof x !== "number" || typeof y !== "number" || typeof dx !== "number" || typeof dy !== "number" ||
        !isFinite(x) || !isFinite(y) || !isFinite(dx) || !isFinite(dy) || !isFinite(range)) {
        throw new RangeError("Ray queries require finite positions, directions and range.");
    }
    
    var hit = this.m_resetHit(output || {}, x, y, dx, dy, range);
    var column = Math.floor(x);
    var row = Math.floor(y);
    var stepX = dx < 0 ? -1 : 1;
    var stepY = dy < 0 ? -1 : 1;
    var deltaX = dx === 0 ? Infinity : Math.abs(1 / dx);
    var deltaY = dy === 0 ? Infinity : Math.abs(1 / dy);
    var sideX = dx === 0 ? Infinity : (dx < 0 ? x - column : column + 1 - x) * deltaX;
    var sideY = dy === 0 ? Infinity : (dy < 0 ? y - row : row + 1 - y) * deltaY;
    var distance = 0;
    var side = 0;
    while (distance <= range) {
        if (this.m_isBlockingCell(column, row, ignoreDoors)) {
            var door = this.getDoorAt(column, row);
            hit.object = door != null && !door['isOpen'] && this.layer.containsCell(column, row) &&
                this.layer.getTileAt(row * this.map['widthInTiles'] + column)['allowCollisions'] === 0 ? door : null;
            hit.hit = true;
            hit.distance = distance;
            hit.x = x + dx * distance;
            hit.y = y + dy * distance;
            hit.column = column;
            hit.row = row;
            hit.side = side;
            hit.tile = this.layer.getTileValueAtCell(column, row);
            hit.u = side === 0 ? hit.y - Math.floor(hit.y) : hit.x - Math.floor(hit.x);
            if ((side === 0 && dx > 0) || (side === 1 && dy < 0)) {
                hit.u = 1 - hit.u;
            }
            return hit;
        }
        
        if (sideX === Infinity && sideY === Infinity) {
            break;
        }
        
        // At a grid corner, either adjacent wall must stop the ray.
        if (sideX < sideY || (sideX === sideY && this.m_isBlockingCell(column + stepX, row, ignoreDoors))) {
            distance = sideX;
            sideX += deltaX;
            column += stepX;
            side = 0;
        } else {
            distance = sideY;
            sideY += deltaY;
            row += stepY;
            side = 1;
        }
    }
    return hit;
};

/**
 * Applies the world blocking rule while optionally replacing a door cell with
 * its visual plane. Real walls and custom blockers at open doors stay solid.
 *
 * @param {number} column Cell column.
 * @param {number} row Cell row.
 * @param {boolean} ignoreDoors Whether to project door surfaces separately.
 *
 * @returns {boolean}
 * @private
 */
rune.raycast.World.prototype.m_isBlockingCell = function(column, row, ignoreDoors) {
    if (!this.isBlocked(column, row)) {
        return false;
    }
    
    var door = ignoreDoors ? this.getDoorAt(column, row) : null;
    return door == null || door['isOpen'] || !this.layer.containsCell(column, row) ||
        this.layer.getTileAt(row * this.map['widthInTiles'] + column)['allowCollisions'] !== 0;
};
