//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates an interactive raycast actor with shared world dimensions.
 * Subclasses select their texture, animations and movement.
 *
 * @constructor
 * @extends rune.raycast.Billboard
 *
 * @param {number} x Horizontal position in tiles.
 * @param {number} y Vertical position in tiles.
 * @param {number} [width=48] Animation frame width in pixels.
 * @param {number} [height=48] Animation frame height in pixels.
 * @param {string} [resource="demo_astronaut_48x48"] Texture resource name.
 *
 * @class
 * @classdesc
 *
 * Shared world dimensions and interaction settings for raycast demo actors.
 * Subclasses define their own animation and behavior.
 */
demo.entity.Actor = function(x, y, width, height, resource) {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.raycast.Billboard.
     */
    rune.raycast.Billboard.call(
        this, x, y, width || 48, height || 48, resource || "demo_astronaut_48x48"
    );

    //--------------------------------------------------------------------------
    // Override public properties
    //--------------------------------------------------------------------------

    /**
     * @inheritDoc
     */
    this.worldWidth = 0.65;

    /**
     * @inheritDoc
     */
    this.worldHeight = 0.65;

    /**
     * @inheritDoc
     */
    this.interactive = true;
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Actor.prototype = Object.create(rune.raycast.Billboard.prototype);
demo.entity.Actor.prototype.constructor = demo.entity.Actor;
