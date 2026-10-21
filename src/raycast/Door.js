//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Door object in an empty wall-layer cell.
 *
 * @constructor
 * @extends rune.display.Graphic
 *
 * @param {number} column Cell column.
 * @param {number} row Cell row.
 * @param {string} resource Door image resource name.
 * @param {string} [orientation="vertical"] Direction of the door surface.
 *
 * @throws {RangeError} If cell coordinates or orientation are invalid.
 *
 * @class
 * @classdesc
 *
 * A fixed surface sliding toward the positive end of its cell. The normal
 * display update lifecycle advances opening and closing. For simple collision,
 * the entire cell blocks movement and shots until the door is fully open.
 * Activation, locks and occupancy rules belong to game code.
 */
rune.raycast.Door = function(column, row, resource, orientation) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Surface orientation; VERTICAL lies along Y, HORIZONTAL along X.
     *
     * @type {string}
     */
    this.orientation = orientation || rune.raycast.Door.VERTICAL;
    if (this.orientation !== rune.raycast.Door.VERTICAL && this.orientation !== rune.raycast.Door.HORIZONTAL) {
        throw new RangeError("Invalid door orientation.");
    }
    if (column !== Math.floor(column) || row !== Math.floor(row) || !isFinite(column) || !isFinite(row)) {
        throw new RangeError("Door coordinates must be integer cells.");
    }

    /**
     * Opening or closing speed, in complete openings per second.
     *
     * @type {number}
     * @default 1
     */
    this.speed = 1;

    /**
     * Whether World.pick() can select the doorway, including when open.
     *
     * @type {boolean}
     */
    this.interactive = true;

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Current opening fraction, from zero (closed) to one (open).
     *
     * @type {number}
     * @private
     */
    this.m_openness = 0;

    /**
     * Target opening fraction.
     *
     * @type {number}
     * @private
     */
    this.m_target = 0;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.display.Graphic. The world-space cell is one tile square.
     */
    rune.display.Graphic.call(this, column, row, 1, 1, resource);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.raycast.Door.prototype = Object.create(rune.display.Graphic.prototype);
rune.raycast.Door.prototype.constructor = rune.raycast.Door;

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Door surface extending along the Y axis through the cell center.
 *
 * @type {string}
 * @const
 */
rune.raycast.Door.VERTICAL = "vertical";

/**
 * Door surface extending along the X axis through the cell center.
 *
 * @type {string}
 * @const
 */
rune.raycast.Door.HORIZONTAL = "horizontal";

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Current opening fraction, from zero to one.
 *
 * @member {number} openness
 * @memberof rune.raycast.Door
 * @instance
 * @readonly
 */
Object.defineProperty(rune.raycast.Door.prototype, "openness", {
    /**
     * @this rune.raycast.Door
     * @ignore
     */
    get : function() {
        return this.m_openness;
    }
});

/**
 * Whether the entire cell is passable.
 *
 * @member {boolean} isOpen
 * @memberof rune.raycast.Door
 * @instance
 * @readonly
 */
Object.defineProperty(rune.raycast.Door.prototype, "isOpen", {
    /**
     * @this rune.raycast.Door
     * @ignore
     */
    get : function() {
        return this.m_openness === 1;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Starts or resumes opening the door.
 *
 * @returns {undefined}
 */
rune.raycast.Door.prototype.open = function() {
    this.m_target = 1;
};

/**
 * Starts or resumes closing the door, subject to canClose().
 *
 * @returns {undefined}
 */
rune.raycast.Door.prototype.close = function() {
    this.m_target = 0;
};

/**
 * Reverses the target state, including during an opening or closing movement.
 *
 * @returns {undefined}
 */
rune.raycast.Door.prototype.toggle = function() {
    this.m_target = 1 - this.m_target;
};

/**
 * Allows closing by default. Override to check players, actors or game rules.
 * Returning false pauses closing without changing the target state.
 *
 * @returns {boolean}
 */
rune.raycast.Door.prototype.canClose = function() {
    return true;
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Advances the door toward its target using the normal world update hierarchy.
 *
 * @param {number} step Elapsed time in milliseconds.
 *
 * @throws {RangeError} If speed or elapsed time is not finite.
 * @returns {undefined}
 * @inheritDoc
 */
rune.raycast.Door.prototype.update = function(step) {
    if (!isFinite(this.speed) || !isFinite(step)) {
        throw new RangeError("Door updates require finite speed and elapsed time.");
    }
    rune.display.Graphic.prototype.update.call(this, step);
    if (this.m_target === this.m_openness || (this.m_target === 0 && !this.canClose())) {
        return;
    }
    var distance = Math.max(0, this.speed) * Math.max(0, step) / 1000;
    this.m_openness = this.m_target === 1 ?
        Math.min(1, this.m_openness + distance) : Math.max(0, this.m_openness - distance);
};

//------------------------------------------------------------------------------
// Package prototype methods (RENDERING)
//------------------------------------------------------------------------------

/**
 * Intersects the full doorway plane, including when its door is open.
 * Used for interaction and visual projection, independently of cell collision.
 *
 * @param {number} x Ray origin in tiles.
 * @param {number} y Ray origin in tiles.
 * @param {number} dx Ray direction x.
 * @param {number} dy Ray direction y.
 *
 * @returns {number} Ray parameter, or -1 when the doorway is missed.
 * @package
 * @ignore
 */
rune.raycast.Door.prototype.getRayDistance = function(x, y, dx, dy) {
    var vertical = this.orientation === rune.raycast.Door.VERTICAL;
    var direction = vertical ? dx : dy;
    if (direction === 0) {
        return -1;
    }
    var distance = vertical ? (this.x + 0.5 - x) / direction : (this.y + 0.5 - y) / direction;
    var position = vertical ? y + dy * distance - this.y : x + dx * distance - this.x;
    return distance >= 0 && position >= 0 && position < 1 ? distance : -1;
};

/**
 * Returns the moving door texture coordinate at a world position.
 * Coordinates outside zero to one lie beyond the visible door surface.
 *
 * @param {number} x World x in tiles.
 * @param {number} y World y in tiles.
 *
 * @returns {number}
 * @package
 * @ignore
 */
rune.raycast.Door.prototype.getTextureOffset = function(x, y) {
    return (this.orientation === rune.raycast.Door.VERTICAL ? y - this.y : x - this.x) - this.m_openness;
};
