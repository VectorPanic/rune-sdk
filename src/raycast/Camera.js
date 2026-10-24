//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new raycast Camera object.
 *
 * @constructor
 * @extends rune.geom.Point
 *
 * @param {number} [x=0] Horizontal position in tiles.
 * @param {number} [y=0] Vertical position in tiles.
 * @param {number} [angle=0] Heading in radians, with zero pointing east.
 *
 * @class
 * @classdesc
 *
 * A world-space observer using Point coordinates. Positive angles turn clockwise.
 * Navigation delegates collision to World; input and timing belong to game code.
 */
rune.raycast.Camera = function(x, y, angle) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Heading in radians, increasing clockwise.
     *
     * @type {number}
     */
    this.angle = angle || 0;

    /**
     * Horizontal field of view in radians.
     *
     * @type {number}
     */
    this.fov = Math.PI / 3;

    /**
     * Collision radius in tiles, shared by movement and actor overlap queries.
     *
     * @type {number}
     * @default 0.2
     */
    this.radius = 0.2;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.geom.Point.
     */
    rune.geom.Point.call(this, x, y);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.raycast.Camera.prototype = Object.create(rune.geom.Point.prototype);
rune.raycast.Camera.prototype.constructor = rune.raycast.Camera;

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Turns clockwise by the supplied angle, keeping the heading within [0, 2 pi).
 *
 * @param {number} angle Angle in radians.
 *
 * @returns {undefined}
 */
rune.raycast.Camera.prototype.turn = function(angle) {
    this.angle = rune.util.Math.normalizeAngle(this.angle + angle);
};

/**
 * Moves forward/backward and sideways relative to the camera heading.
 * Diagonal input cannot increase movement speed; smaller analog input is retained.
 *
 * @param {rune.raycast.World} world Collision world.
 * @param {number} strafe Positive input moves right.
 * @param {number} forward Positive input moves ahead.
 * @param {number} distance Travel distance in tiles.
 * @param {number} [radius] Overrides this camera's collision radius for this move.
 *
 * @returns {undefined}
 */
rune.raycast.Camera.prototype.move = function(world, strafe, forward, distance, radius) {
    var inputLength = Math.max(1, Math.sqrt(strafe * strafe + forward * forward));
    var headingX = Math.cos(this.angle);
    var headingY = Math.sin(this.angle);
    var dx = (headingX * forward - headingY * strafe) * distance / inputLength;
    var dy = (headingY * forward + headingX * strafe) * distance / inputLength;

    this.m_move(world, dx, dy, radius == null ? this.radius : radius);
};

/**
 * Returns the nearest visible interactive billboard or doorway ahead of the observer.
 *
 * @param {rune.raycast.World} world World to query.
 * @param {number} [range=64] Maximum distance in tiles.
 *
 * @returns {?(rune.raycast.Billboard|rune.raycast.Door)}
 */
rune.raycast.Camera.prototype.pick = function(world, range) {
    return world.pick(this.x, this.y, Math.cos(this.angle), Math.sin(this.angle), range);
};

/**
 * Traces a shot or sight line straight ahead without changing the world.
 * The result uses the same format and filtering as World.trace().
 *
 * @param {rune.raycast.World} world World to query.
 * @param {number} [range=64] Maximum distance in tiles.
 * @param {Object} [output] Reusable hit result.
 * @param {Function} [filter] Object eligibility callback.
 * @param {Object} [scope] Callback scope.
 *
 * @returns {Object}
 */
rune.raycast.Camera.prototype.trace = function(world, range, output, filter, scope) {
    return world.trace(this.x, this.y, Math.cos(this.angle), Math.sin(this.angle),
        range, output, filter, scope);
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Delegates already converted world-space displacements to World.move().
 *
 * @param {rune.raycast.World} world Collision world.
 * @param {number} dx Horizontal displacement in tiles.
 * @param {number} dy Vertical displacement in tiles.
 * @param {number} [radius=0.2] Collision radius in tiles.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.raycast.Camera.prototype.m_move = function(world, dx, dy, radius) {
    world.move(this, dx, dy, radius);
};
