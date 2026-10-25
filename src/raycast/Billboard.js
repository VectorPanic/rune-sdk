//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Billboard object.
 *
 * @constructor
 * @extends rune.display.Sprite
 *
 * @param {number} [x=0] Horizontal position in tiles.
 * @param {number} [y=0] Vertical position in tiles.
 * @param {number} [width=0] Sprite frame width in pixels.
 * @param {number} [height=0] Sprite frame height in pixels.
 * @param {string} [resource=""] Sprite texture resource name.
 *
 * @class
 * @classdesc
 *
 * An upright world object using the normal Sprite animation and update lifecycle.
 * World dimensions use tiles; animation frames remain pixel rectangles.
 */
rune.raycast.Billboard = function(x, y, width, height, resource) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Projected width in tiles.
     *
     * @type {number}
     */
    this.worldWidth = 1;

    /**
     * Projected height in tiles.
     *
     * @type {number}
     */
    this.worldHeight = 1;

    /**
     * Height above the floor in tiles.
     *
     * @type {number}
     */
    this.elevation = 0;

    /**
     * Collision radius in tiles, used by movement, ray and actor overlap queries.
     *
     * @type {number}
     */
    this.radius = 0.25;

    /**
     * Whether the object can be selected by World.pick().
     *
     * @type {boolean}
     */
    this.interactive = false;

    /**
     * Facing direction on the map, independent of movement. Positive X is east,
     * positive Y is south. May reference Navigator.direction for automatic facing.
     *
     * @type {rune.geom.Point}
     */
    this.direction = new rune.geom.Point(1, 0);

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Owned direction for manual facing, independent of a shared navigator Point.
     *
     * @type {rune.geom.Point}
     * @private
     */
    this.m_facingDirection = this.direction;

    /**
     * Optional right, down, up and left Sprite animation names.
     *
     * @type {?Array.<string>}
     * @private
     */
    this.m_directionalAnimations = null;

    /**
     * Reusable per-camera source rectangle; never changes animation.frame.
     *
     * @type {rune.geom.Rectangle}
     * @private
     */
    this.m_directionalFrame = new rune.geom.Rectangle();

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.display.Sprite.
     */
    rune.display.Sprite.call(this, x, y, width, height, resource);

    //--------------------------------------------------------------------------
    // Override public properties
    //--------------------------------------------------------------------------

    /**
     * @inheritDoc
     */
    this.movable = false;
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.raycast.Billboard.prototype = Object.create(rune.display.Sprite.prototype);
rune.raycast.Billboard.prototype.constructor = rune.raycast.Billboard;

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Faces a point or actor without moving or changing animation playback.
 * Updates direction to a unit vector used by directional frames and sight cones.
 * Coincident positions leave the previous direction unchanged.
 *
 * Uses an owned Point so a direction shared with Navigator is never modified.
 * To resume automatic facing, assign direction = navigator.direction again.
 *
 * @param {Object} target Point or actor with finite x and y in tile units.
 *
 * @throws {RangeError} If this position or the target position is invalid.
 * @returns {undefined}
 */
rune.raycast.Billboard.prototype.faceTowards = function(target) {
    if (target == null || typeof target.x !== "number" || typeof target.y !== "number" ||
        !isFinite(target.x) || !isFinite(target.y) || typeof this.x !== "number" ||
        typeof this.y !== "number" || !isFinite(this.x) || !isFinite(this.y)) {
        throw new RangeError("Facing requires finite observer and target positions.");
    }
    
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    
    if (dx === 0 && dy === 0) {
        return;
    }
    
    var scale = Math.max(Math.abs(dx), Math.abs(dy));
    if (!isFinite(scale)) {
        dx = target.x / 2 - this.x / 2;
        dy = target.y / 2 - this.y / 2;
        scale = Math.max(Math.abs(dx), Math.abs(dy));
    }

    dx /= scale;
    dy /= scale;

    var length = Math.sqrt(dx * dx + dy * dy);
    this.m_facingDirection.x = dx / length;
    this.m_facingDirection.y = dy / length;
    this.direction = this.m_facingDirection;
};

/**
 * Maps existing Sprite animations to observer-relative directions. Down faces
 * the observer; up faces away. The active mapped animation supplies playback
 * timing; its normalized phase selects a frame in the observed sequence.
 * Unmapped animations use ordinary Sprite frames. Call without arguments to clear.
 *
 * Pass an object with right/down/up/left names to avoid positional arguments.
 *
 * @example
 * actor.setDirectionalAnimations({right: "walkRight", down: "walkDown",
 *     up: "walkUp", left: "walkLeft"});
 *
 * @param {(string|Object)} [right] Direction map, or right-facing animation name.
 * @param {string} [down] Front-facing animation name.
 * @param {string} [up] Back-facing animation name.
 * @param {string} [left] Left-facing animation name.
 *
 * @throws {Error} If a supplied animation is missing or empty.
 * @returns {undefined}
 */
rune.raycast.Billboard.prototype.setDirectionalAnimations = function(right, down, up, left) {
    if (arguments.length === 0) {
        this.m_directionalAnimations = null;
        return;
    }
    
    var names = right != null && typeof right === "object" ?
        [right.right, right.down, right.up, right.left] : [right, down, up, left];
        
    for (var i = 0; i < names.length; i++) {
        var animation = typeof names[i] === "string" ? this.animation.find(names[i]) : null;
        if (animation == null || animation.frames.length === 0) {
            throw new Error("Directional animations must name existing non-empty Sprite animations.");
        }
    }
    
    this.m_directionalAnimations = names;
};

/**
 * Returns the frame seen by the observer without advancing animation time.
 * Uses the Sprite frame unless a registered directional animation is active.
 * Subclasses may return a reusable custom frame without changing animation.frame.
 *
 * @param {rune.raycast.Camera} camera Observer used for directional frame selection.
 *
 * @returns {rune.geom.Rectangle}
 */
rune.raycast.Billboard.prototype.getFrame = function(camera) {
    var frame = this.animation.frame;
    var current = this.animation.current;
    var names = this.m_directionalAnimations;
    
    if (names == null || camera == null || current == null || current.frames.length === 0) {
        return frame;
    }
    
    var mapped = false;
    for (var i = 0; i < names.length; i++) {
        if (this.animation.find(names[i]) === current) {
            mapped = true;
            break;
        }
    }
    
    if (!mapped) {
        return frame;
    }
    
    var viewX = this.x - camera.x;
    var viewY = this.y - camera.y;
    if (viewX === 0 && viewY === 0) {
        viewX = Math.cos(camera.angle);
        viewY = Math.sin(camera.angle);
    }
    
    var sideways = this.direction.y * viewX - this.direction.x * viewY;
    var away = this.direction.x * viewX + this.direction.y * viewY;
    var side = Math.abs(sideways) >= Math.abs(away) ?
        (sideways > 0 ? 0 : 3) : (away > 0 ? 2 : 1);
    
    var selected = this.animation.find(names[side]);
    if (selected == null || selected.frames.length === 0 || frame.width <= 0 || frame.height <= 0) {
        return frame;
    }
    
    var columns = Math.floor(this['texture'].width / frame.width);
    if (columns < 1) {
        return frame;
    }
    
    var phase = current['index'] / current.frames.length;
    var index = selected.frames[Math.floor(phase * selected.frames.length)];
    this.m_directionalFrame.x = index % columns * frame.width;
    this.m_directionalFrame.y = Math.floor(index / columns) * frame.height;
    this.m_directionalFrame.width = frame.width;
    this.m_directionalFrame.height = frame.height;
    return this.m_directionalFrame;
};
