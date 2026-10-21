//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates navigation for an actor without owning its update lifecycle.
 *
 * @constructor
 *
 * @param {Object} actor Object with x, y and optional radius in tile units.
 * @param {rune.raycast.World} [world] World; defaults to the actor's parent.
 *
 * @class
 * @classdesc
 *
 * Follows a target, flees a threat, or wanders through walkable cells. Game code
 * chooses the behavior, calls update(step), and handles animation using moving.
 */
rune.raycast.Navigator = function(actor, world) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Actor moved by this navigator.
     *
     * @type {Object}
     */
    this.actor = actor;

    /**
     * Explicit world, or null to use the actor parent.
     *
     * @type {?rune.raycast.World}
     */
    this.world = world || null;

    /**
     * Point or actor to follow, or the threat selected by flee(). Null disables
     * target-based navigation; use follow(), flee() or wander() to select behavior.
     *
     * @type {?Object}
     */
    this.target = null;

    /**
     * Travel speed in tiles per second.
     *
     * @type {number}
     */
    this.speed = 0.7;

    /**
     * Distance to keep from the target, in tiles.
     *
     * @type {number}
     */
    this.stopDistance = 0.75;

    /**
     * Distance from the threat at which fleeing stops, in tiles.
     *
     * @type {number}
     */
    this.safeDistance = 5;

    /**
     * Maximum route length explored when choosing a flee destination, in cells.
     *
     * @type {number}
     */
    this.searchDistance = 12;

    /**
     * Whether navigation advances. Disabling preserves the current route.
     *
     * @type {boolean}
     */
    this.enabled = true;

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Current route through cell centers.
     *
     * @type {?rune.util.Path}
     * @private
     */
    this.m_path = null;

    /**
     * Next route point.
     *
     * @type {number}
     * @private
     */
    this.m_pathIndex = 0;

    /**
     * Milliseconds before another route may be requested.
     *
     * @type {number}
     * @private
     */
    this.m_pathTime = 0;

    /**
     * Target associated with the current route.
     *
     * @type {?Object}
     * @private
     */
    this.m_target = null;

    /**
     * World associated with the current route.
     *
     * @type {?rune.raycast.World}
     * @private
     */
    this.m_world = null;

    /**
     * Whether the last update moved the actor.
     *
     * @type {boolean}
     * @private
     */
    this.m_moving = false;

    /**
     * Whether the current target-based navigation goal has been reached.
     *
     * @type {boolean}
     * @private
     */
    this.m_arrived = false;

    /**
     * Whether a route or movement attempt could not make further progress.
     *
     * @type {boolean}
     * @private
     */
    this.m_blocked = false;

    /**
     * Whether continuous random wandering is selected.
     *
     * @type {boolean}
     * @private
     */
    this.m_wandering = false;

    /**
     * Whether target is a threat to flee rather than a destination to follow.
     *
     * @type {boolean}
     * @private
     */
    this.m_fleeing = false;

    /**
     * Next wandering cell center.
     *
     * @type {?rune.geom.Point}
     * @private
     */
    this.m_destination = null;

    /**
     * Previously visited wandering cell.
     *
     * @type {?rune.geom.Point}
     * @private
     */
    this.m_previous = null;

    /**
     * Last actual movement direction, retained while stationary.
     *
     * @type {rune.geom.Point}
     * @private
     */
    this.m_direction = new rune.geom.Point(1, 0);
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether navigation moved the actor during its last update.
 *
 * @member {boolean} moving
 * @memberof rune.raycast.Navigator
 * @instance
 * @readonly
 */
Object.defineProperty(rune.raycast.Navigator.prototype, "moving", {
    /**
     * @this rune.raycast.Navigator
     * @ignore
     */
    get : function() {
        return this.m_moving;
    }
});

/**
 * Whether the last active update reached stopDistance when following or
 * safeDistance when fleeing. Always false for wandering, stopped, paused or
 * unbound navigation. Moving targets are evaluated again on the next update.
 *
 * @member {boolean} arrived
 * @memberof rune.raycast.Navigator
 * @instance
 * @readonly
 */
Object.defineProperty(rune.raycast.Navigator.prototype, "arrived", {
    /**
     * @this rune.raycast.Navigator
     * @ignore
     */
    get : function() {
        return this.m_arrived;
    }
});

/**
 * Whether a route is unavailable or movement cannot continue. Remains true
 * while retrying a failed route. False on arrival, pause, stop or mode change;
 * ordinary route refreshes do not count as blocked. Reports the last update,
 * not a permanent failure: doors and moving targets may restore progress.
 *
 * @member {boolean} blocked
 * @memberof rune.raycast.Navigator
 * @instance
 * @readonly
 */
Object.defineProperty(rune.raycast.Navigator.prototype, "blocked", {
    /**
     * @this rune.raycast.Navigator
     * @ignore
     */
    get : function() {
        return this.m_blocked;
    }
});

/**
 * Last movement direction. Reused Point; callers should treat it as read-only.
 * Assign it to Billboard.direction to connect navigation and directional frames.
 *
 * @member {rune.geom.Point} direction
 * @memberof rune.raycast.Navigator
 * @instance
 * @readonly
 */
Object.defineProperty(rune.raycast.Navigator.prototype, "direction", {
    /**
     * @this rune.raycast.Navigator
     * @ignore
     */
    get : function() {
        return this.m_direction;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Follows a point or actor, replacing any wandering or fleeing behavior.
 * Assigning target directly remains supported for ordinary following.
 *
 * @param {Object} target Point or actor with x and y in tiles.
 *
 * @returns {undefined}
 */
rune.raycast.Navigator.prototype.follow = function(target) {
    this.stop();
    this.target = target;
};

/**
 * Flees from a point or actor until safeDistance is reached. A bounded search
 * selects a reachable safer cell, allowing temporary travel toward the threat
 * to escape dead ends. Navigation resumes if the threat approaches again.
 * No damage, animation, perception or threat selection is applied.
 *
 * @param {Object} target Threat with x and y in tiles.
 *
 * @returns {undefined}
 */
rune.raycast.Navigator.prototype.flee = function(target) {
    this.stop();
    this.target = target;
    this.m_fleeing = true;
};

/**
 * Starts continuous random wandering through neighboring walkable cells.
 * Avoids turning back except at dead ends. Has no built-in idle pauses.
 * Setting target switches back to following; stop() disables navigation.
 *
 * @returns {undefined}
 */
rune.raycast.Navigator.prototype.wander = function() {
    this.stop();
    this.m_wandering = true;
};

/**
 * Clears the target and route, retaining the last facing direction.
 * Use enabled=false instead to pause and later resume the current behavior.
 *
 * @returns {undefined}
 */
rune.raycast.Navigator.prototype.stop = function() {
    this.target = null;
    this.m_wandering = this.m_fleeing = false;
    this.m_path = this.m_destination = this.m_previous = null;
    this.m_pathTime = 0;
    this.m_moving = this.m_arrived = this.m_blocked = false;
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Advances navigation using World movement and pathfinding. Blocked routes are
 * retried at most twice per second. Routes refresh at cell centers to avoid
 * cutting wall corners. No input, animation or combat behavior is applied.
 *
 * @param {number} step Elapsed time in milliseconds.
 *
 * @throws {RangeError} If timing or navigation settings are invalid.
 * @returns {undefined}
 */
rune.raycast.Navigator.prototype.update = function(step) {
    if (typeof step !== "number" || !isFinite(step) || step < 0 ||
        typeof this.speed !== "number" || !isFinite(this.speed) || this.speed < 0 ||
        typeof this.stopDistance !== "number" || !isFinite(this.stopDistance) || this.stopDistance < 0 ||
        typeof this.safeDistance !== "number" || !isFinite(this.safeDistance) || this.safeDistance < 0 ||
        typeof this.searchDistance !== "number" || !isFinite(this.searchDistance) ||
        this.searchDistance < 1 || this.searchDistance !== Math.floor(this.searchDistance)) {
        throw new RangeError("Navigation requires finite non-negative settings and a positive integer search distance.");
    }
    
    var travelBudget = this.speed * (step / 1000);
    if (!isFinite(travelBudget)) {
        throw new RangeError("Navigation travel distance must be finite.");
    }
    
    this.m_moving = this.m_arrived = false;
    var actor = this.actor;
    var world = this.world || (actor && actor.parent);
    if (this.target != null) {
        this.m_wandering = false;
    }
    
    if (this.m_target !== this.target || this.m_world !== world) {
        this.m_path = this.m_destination = this.m_previous = null;
        this.m_pathTime = 0;
        this.m_blocked = false;
        this.m_target = this.target;
        this.m_world = world;
    }
    
    this.m_pathTime = Math.max(0, this.m_pathTime - step);
    if (actor == null || !(world instanceof rune.raycast.World)) {
        this.m_path = this.m_destination = null;
        this.m_blocked = false;
        return;
    }
    
    if (!this.enabled || step === 0 || this.speed === 0) {
        this.m_blocked = false;
        return;
    }
    
    if (this.m_wandering) {
        this.m_updateWandering(world, travelBudget);
        return;
    }
    
    if (this.target == null) {
        this.m_path = null;
        this.m_blocked = false;
        return;
    }
    
    if (this.m_hasArrived()) {
        this.m_arrived = true;
        this.m_blocked = false;
        this.m_path = null;
        this.m_pathTime = 0;
        return;
    }
    
    if (this.m_fleeing) {
        this.m_updateFleeing(world, travelBudget);
    } else {
        this.m_updateFollowing(world, travelBudget);
    }
    
    this.m_arrived = this.m_hasArrived();
    if (this.m_arrived) {
        this.m_blocked = false;
    }
};

/**
 * Releases references without disposing the actor, target or world.
 *
 * @returns {undefined}
 */
rune.raycast.Navigator.prototype.dispose = function() {
    this.stop();
    this.actor = this.world = null;
    this.m_target = this.m_world = this.m_path = null;
    this.m_moving = false;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Follows the current target using the shared path and movement rules.
 *
 * @param {rune.raycast.World} world Movement world.
 * @param {number} travelBudget Travel budget in tiles.
 *
 * @returns {undefined}
 * @private
 */
rune.raycast.Navigator.prototype.m_updateFollowing = function(world, travelBudget) {
    var actor = this.actor;
    var distance = Math.sqrt(rune.geom.Point.distanceSquared(actor.x, actor.y, this.target.x, this.target.y));
    if (this.m_path == null && this.m_pathTime === 0) {
        this.m_path = world.getPathBetweenPoints(actor, this.target);
        this.m_pathIndex = 0;
        this.m_pathTime = 500;
        this.m_blocked = false;
    }
    
    if (this.m_path == null) {
        this.m_blocked = true;
        return;
    }
    
    var point = this.m_getWaypoint();
    if (point == null) {
        return;
    }
    
    var travel = Math.min(travelBudget, Math.max(0, distance - this.stopDistance));
    this.m_move(world, point, travel);
    if (!this.m_moving) {
        this.m_path = null;
    }
};

/**
 * Follows a bounded escape route, replanning at cell centers as the threat moves.
 * If no safer reachable cell exists, waits and retries rather than entering walls.
 *
 * @param {rune.raycast.World} world Movement world.
 * @param {number} distance Travel budget in tiles.
 *
 * @returns {undefined}
 * @private
 */
rune.raycast.Navigator.prototype.m_updateFleeing = function(world, distance) {
    if (this.m_path == null && this.m_pathTime === 0) {
        this.m_path = this.m_findEscapePath(world);
        this.m_pathIndex = 0;
        this.m_pathTime = 500;
        this.m_blocked = false;
    }
    
    if (this.m_path == null) {
        this.m_blocked = true;
        return;
    }
    
    var point = this.m_getWaypoint();
    if (point != null) {
        this.m_move(world, point, distance);
        if (!this.m_moving) {
            this.m_path = null;
        }
    }
};

/**
 * Spends the current movement budget across cell centers without timed pauses.
 * Rechecks destinations so closing doors and changing maps remain obstacles.
 *
 * @param {rune.raycast.World} world Movement world.
 * @param {number} remaining Travel budget in tiles.
 *
 * @returns {undefined}
 * @private
 */
rune.raycast.Navigator.prototype.m_updateWandering = function(world, remaining) {
    while (remaining > 0) {
        if (this.m_destination == null && !this.m_chooseDestination(world)) {
            this.m_blocked = true;
            return;
        }
        
        if (world.isBlocked(Math.floor(this.m_destination.x), Math.floor(this.m_destination.y))) {
            this.m_destination = null;
            this.m_blocked = true;
            return;
        }
        
        var traveled = this.m_move(world, this.m_destination, remaining);
        if (traveled === 0) {
            this.m_destination = null;
            this.m_blocked = true;
            return;
        }
        
        remaining = Math.max(0, remaining - traveled);
        if (rune.geom.Point.distanceSquared(this.actor.x, this.actor.y,
            this.m_destination.x, this.m_destination.y) < 0.00000001) {
            this.m_destination = null;
        } else {
            return;
        }
    }
};

/**
 * Evaluates the current distance goal with a small movement precision tolerance.
 *
 * @returns {boolean}
 * @private
 */
rune.raycast.Navigator.prototype.m_hasArrived = function() {
    if (this.m_wandering || this.target == null) {
        return false;
    }
    
    var distance = rune.geom.Point.distance(this.actor.x, this.actor.y, this.target.x, this.target.y);
    return isFinite(distance) && (this.m_fleeing ?
        distance + 0.00000001 >= this.safeDistance : distance <= this.stopDistance + 0.00000001);
};

/**
 * Skips reached cell centers and requests a fresh route at safe turning points.
 * Following approaches the target directly only in the final route cell.
 * Fleeing ends at its chosen safe destination without approaching the threat.
 *
 * @returns {?Object} Next point to approach, or null while replanning.
 * @private
 */
rune.raycast.Navigator.prototype.m_getWaypoint = function() {
    while (this.m_pathIndex < this.m_path.length) {
        var point = this.m_path.getAt(this.m_pathIndex);
        if (rune.geom.Point.distanceSquared(this.actor.x, this.actor.y, point.x, point.y) > 0.00000001) {
            return point;
        }
        
        this.m_pathIndex++;
        if (this.m_pathTime === 0) {
            this.m_path = null;
            return null;
        }
    }
    if (this.m_fleeing) {
        this.m_path = null;
        return null;
    }
    
    var last = this.m_path.length > 0 ? this.m_path.getAt(this.m_path.length - 1) : null;
    if (last != null && Math.floor(last.x) === Math.floor(this.target.x) &&
        Math.floor(last.y) === Math.floor(this.target.y)) {
        return this.target;
    }
    
    this.m_path = null;
    return null;
};

/**
 * Searches reachable cells in breadth-first order. Prefers the shortest route
 * reaching safeDistance, otherwise the cell farthest from the threat. Each cell
 * is visited once and the search is limited to searchDistance route steps.
 * Uses World.isBlocked without changing map data or adding game-specific rules.
 *
 * @param {rune.raycast.World} world Movement world.
 *
 * @returns {?rune.util.Path} Route to a safer cell, or null when none was found.
 * @private
 */
rune.raycast.Navigator.prototype.m_findEscapePath = function(world) {
    var column = Math.floor(this.actor.x);
    var row = Math.floor(this.actor.y);
    if (!world.layer.containsCell(column, row) || world.isBlocked(column, row)) {
        return null;
    }
    
    var nodes = [{column: column, row: row, parent: -1, depth: 0}];
    var visited = {};
    visited[column + ":" + row] = true;
    var directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    var best = -1;
    var bestDistance = rune.geom.Point.distanceSquared(this.actor.x, this.actor.y,
        this.target.x, this.target.y);
    var safeDistance = this.safeDistance * this.safeDistance;
    
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var distance = rune.geom.Point.distanceSquared(node.column + 0.5, node.row + 0.5,
            this.target.x, this.target.y);
        if (distance > bestDistance) {
            best = i;
            bestDistance = distance;
        }
        
        if (distance >= safeDistance) {
            best = i;
            break;
        }
        
        if (node.depth >= this.searchDistance) {
            continue;
        }
        
        for (var j = 0; j < directions.length; j++) {
            var x = node.column + directions[j][0];
            var y = node.row + directions[j][1];
            var key = x + ":" + y;
            if (visited[key]) {
                continue;
            }
            visited[key] = true;
            if (world.layer.containsCell(x, y) && !world.isBlocked(x, y)) {
                nodes.push({column: x, row: y, parent: i, depth: node.depth + 1});
            }
        }
    }
    
    if (best < 0) {
        return null;
    }
    
    var route = [];
    while (best >= 0) {
        route.push(nodes[best]);
        best = nodes[best].parent;
    }
    
    var path = new rune.util.Path();
    for (var k = route.length - 1; k >= 0; k--) {
        path.add(route[k].column + 0.5, route[k].row + 0.5);
    }
    
    return path;
};

/**
 * Centers an off-center actor before choosing a random open neighboring cell.
 * Remembers the previous cell to avoid repeatedly reversing in open corridors.
 *
 * @param {rune.raycast.World} world Movement world.
 *
 * @returns {boolean} Whether a destination was found.
 * @private
 */
rune.raycast.Navigator.prototype.m_chooseDestination = function(world) {
    var column = Math.floor(this.actor.x);
    var row = Math.floor(this.actor.y);
    var center = new rune.geom.Point(column + 0.5, row + 0.5);
    if (rune.geom.Point.distanceSquared(this.actor.x, this.actor.y, center.x, center.y) > 0.00000001) {
        this.m_destination = center;
        return true;
    }
    
    var directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    var choices = [];
    var back = null;
    for (var i = 0; i < directions.length; i++) {
        var x = column + directions[i][0];
        var y = row + directions[i][1];
        if (world.isBlocked(x, y)) {
            continue;
        }
        var point = new rune.geom.Point(x + 0.5, y + 0.5);
        if (this.m_previous != null && point.x === this.m_previous.x && point.y === this.m_previous.y) {
            back = point;
        } else {
            choices.push(point);
        }
    }
    
    this.m_destination = choices.length > 0 ? choices[Math.floor(Math.random() * choices.length)] : back;
    this.m_previous = center;
    return this.m_destination != null;
};

/**
 * Moves through World and records the actual direction, independently of visuals.
 *
 * @param {rune.raycast.World} world Movement world.
 * @param {Object} point Destination in tile units.
 * @param {number} distance Maximum travel distance.
 *
 * @returns {number} Actual distance traveled.
 * @private
 */
rune.raycast.Navigator.prototype.m_move = function(world, point, distance) {
    var previousX = this.actor.x;
    var previousY = this.actor.y;
    world.moveTowards(this.actor, point, distance);
    var dx = this.actor.x - previousX;
    var dy = this.actor.y - previousY;
    var traveled = Math.sqrt(dx * dx + dy * dy);
    if (traveled > 0.00000001) {
        this.m_direction.x = dx / traveled;
        this.m_direction.y = dy / traveled;
        this.m_moving = true;
        this.m_blocked = false;
        return traveled;
    }
    
    this.m_blocked = true;
    return 0;
};
