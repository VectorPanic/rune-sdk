//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Desk actor.
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
 * A stationary desk using the shared raycast actor dimensions and interaction.
 */
demo.entity.Desk = function(x, y) {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend demo.entity.Actor.
     */
    demo.entity.Actor.call(this, x, y, 16, 16, "demo_raycast_billboard_desk_16x16");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Desk.prototype = Object.create(demo.entity.Actor.prototype);
demo.entity.Desk.prototype.constructor = demo.entity.Desk;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.entity.Desk.prototype.init = function() {
    demo.entity.Actor.prototype.init.call(this);
    this.m_initAnimation();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates this actor's idle sequences and starts idle playback.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Desk.prototype.m_initAnimation = function() {
    this.animation.create("idle", [0, 1], 8, true);
    this.animation.gotoAndPlay("idle");
};