//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates an upright textured surface with a fixed orientation in the world.
 *
 * @constructor
 * @extends rune.raycast.Billboard
 *
 * @param {number} [x=0] Center position X in tiles.
 * @param {number} [y=0] Center position Y in tiles.
 * @param {number} [width=0] Sprite frame width in pixels.
 * @param {number} [height=0] Sprite frame height in pixels.
 * @param {string} [resource=""] Texture resource name.
 * @param {number} [angle=0] Surface direction in radians; zero runs along X.
 *
 * @throws {RangeError} If angle is not a finite number.
 *
 * @class
 * @classdesc
 *
 * A fixed plane using Billboard world dimensions, elevation and Sprite animation.
 * The x/y position anchors its horizontal center and elevation anchors its bottom.
 * Several surfaces may cross to form vegetation. Set solid to block movement;
 * trace and filtered sight queries intersect the complete plane, not image alpha.
 * Rotation/scale properties from Sprite do not orient or resize this plane; use
 * angle, worldWidth and worldHeight. Animation, alpha, flicker and flips apply.
 *
 * @example
 * var surface = new rune.raycast.Surface(4.5, 3.5, 16, 16, "leaves");
 * surface.worldWidth = 1.5;
 * surface.worldHeight = 2;
 * surface.angle = Math.PI / 2;
 * surface.doubleSided = true;
 * world.addChild(surface);
 */
rune.raycast.Surface = function(x, y, width, height, resource, angle) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Direction along the surface width, in radians, increasing clockwise.
     * At zero the surface extends along X; its front faces positive Y.
     * This is independent of Sprite.rotation and Billboard.direction.
     *
     * @type {number}
     */
    this.angle = angle == null ? 0 : angle;
    if (typeof this.angle !== "number" || !isFinite(this.angle)) {
        throw new RangeError("Surface angle must be finite radians.");
    }

    /**
     * Whether to render the back face as well as the front. Back faces show the
     * reverse side of the same texture. Ray queries always test both sides.
     *
     * @type {boolean}
     */
    this.doubleSided = true;

    /**
     * Whether the complete plane blocks circular movement from either side.
     * Visibility, image alpha and elevation do not affect collision.
     * Tile-based path searches do not include these planes.
     *
     * @type {boolean}
     */
    this.solid = false;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.raycast.Billboard, retaining normal Sprite animation/lifecycle.
     */
    rune.raycast.Billboard.call(this, x, y, width, height, resource);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.raycast.Surface.prototype = Object.create(rune.raycast.Billboard.prototype);
rune.raycast.Surface.prototype.constructor = rune.raycast.Surface;

//------------------------------------------------------------------------------
// Package prototype methods (COLLISION)
//------------------------------------------------------------------------------

/**
 * Tests a swept circle against the finite plane, including its endpoints.
 * Starting contact permits sliding or moving away from the surface.
 *
 * @param {number} x Start X in tiles.
 * @param {number} y Start Y in tiles.
 * @param {number} dx Displacement X in tiles.
 * @param {number} dy Displacement Y in tiles.
 * @param {number} radius Circle radius in tiles.
 *
 * @returns {boolean}
 * @package
 * @ignore
 */
rune.raycast.Surface.prototype.blocksMovement = function(x, y, dx, dy, radius) {
    if (!isFinite(this.angle) || !isFinite(this.worldWidth) || this.worldWidth <= 0 ||
        !isFinite(this.x) || !isFinite(this.y)) {
        return false;
    }
    
    var halfX = Math.cos(this.angle) * this.worldWidth / 2;
    var halfY = Math.sin(this.angle) * this.worldWidth / 2;
    var ax = this.x - halfX;
    var ay = this.y - halfY;
    var bx = this.x + halfX;
    var by = this.y + halfY;
    var end = this.m_distanceToSegmentSquared(x + dx, y + dy, ax, ay, bx, by);
    if (dx === 0 && dy === 0) {
        return end <= radius * radius;
    }
    
    var hit = this.getRayDistance(x, y, dx, dy);
    if (hit > 0 && hit <= 1) {
        return true;
    }
    
    var start = this.m_distanceToSegmentSquared(x, y, ax, ay, bx, by);
    var nearest = Math.min(start, end,
        this.m_distanceToSegmentSquared(ax, ay, x, y, x + dx, y + dy),
        this.m_distanceToSegmentSquared(bx, by, x, y, x + dx, y + dy));
    if (start <= radius * radius && nearest >= start - 0.000000000001 && end >= start) {
        return false;
    }
    
    return nearest <= radius * radius;
};

//------------------------------------------------------------------------------
// Package prototype methods (RENDERING)
//------------------------------------------------------------------------------

/**
 * Intersects a ray with the finite horizontal plane segment on the map.
 * Both sides participate regardless of doubleSided, visibility or image alpha.
 *
 * @param {number} x Ray origin X in tiles.
 * @param {number} y Ray origin Y in tiles.
 * @param {number} dx Ray direction X.
 * @param {number} dy Ray direction Y.
 *
 * @returns {number} Ray parameter, or -1 for a miss or invalid surface geometry.
 * @package
 * @ignore
 */
rune.raycast.Surface.prototype.getRayDistance = function(x, y, dx, dy) {
    if (!isFinite(this.angle) || !isFinite(this.worldWidth) || this.worldWidth <= 0 ||
        !isFinite(this.x) || !isFinite(this.y)) {
        return -1;
    }
    
    var axisX = Math.cos(this.angle);
    var axisY = Math.sin(this.angle);
    var denominator = dx * axisY - dy * axisX;
    if (Math.abs(denominator) <= 0.000000000001 * Math.sqrt(dx * dx + dy * dy)) {
        return -1;
    }
    
    var offsetX = this.x - x;
    var offsetY = this.y - y;
    var distance = (offsetX * axisY - offsetY * axisX) / denominator;
    var along = (offsetX * dy - offsetY * dx) / denominator;
    
    return distance >= 0 && Math.abs(along) <= this.worldWidth / 2 ? distance : -1;
};

/**
 * Returns the horizontal texture fraction at a point on the surface.
 *
 * @param {number} x World X in tiles.
 * @param {number} y World Y in tiles.
 *
 * @returns {number}
 * @package
 * @ignore
 */
rune.raycast.Surface.prototype.getTextureOffset = function(x, y) {
    return 0.5 + ((x - this.x) * Math.cos(this.angle) +
        (y - this.y) * Math.sin(this.angle)) / this.worldWidth;
};

/**
 * Checks whether a position lies on the front side of the plane.
 *
 * @param {number} x Observer X in tiles.
 * @param {number} y Observer Y in tiles.
 *
 * @returns {boolean}
 * @package
 * @ignore
 */
rune.raycast.Surface.prototype.isFrontFacing = function(x, y) {
    return (y - this.y) * Math.cos(this.angle) - (x - this.x) * Math.sin(this.angle) > 0;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Returns the squared distance from a point to a finite segment.
 *
 * @param {number} x Point X.
 * @param {number} y Point Y.
 * @param {number} ax Segment start X.
 * @param {number} ay Segment start Y.
 * @param {number} bx Segment end X.
 * @param {number} by Segment end Y.
 *
 * @returns {number}
 * @private
 */
rune.raycast.Surface.prototype.m_distanceToSegmentSquared = function(x, y, ax, ay, bx, by) {
    var dx = bx - ax;
    var dy = by - ay;
    var length = dx * dx + dy * dy;
    var along = length === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length));
    return rune.geom.Point.distanceSquared(x, y, ax + along * dx, ay + along * dy);
};
