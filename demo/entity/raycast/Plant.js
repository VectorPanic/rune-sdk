//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Plant actor.
 *
 * @constructor
 * @extends demo.entity.Actor
 *
 * @param {number} x Horizontal position in tiles.
 * @param {number} y Vertical position in tiles.
 *
 * @class
 * @classdesc
 *
 * A stationary potted plant using the shared raycast actor dimensions and interaction.
 */
demo.entity.Plant = function(x, y) {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend demo.entity.Actor.
     */
    demo.entity.Actor.call(this, x, y, 16, 16, "demo_raycast_billboard_plant_16x16");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Plant.prototype = Object.create(demo.entity.Actor.prototype);
demo.entity.Plant.prototype.constructor = demo.entity.Plant;
