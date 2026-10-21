//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Man actor.
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
 * Demonstrates following a target with Navigator and choosing movement animations.
 */
demo.entity.Man = function(x, y) {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend demo.entity.Actor.
     */
    demo.entity.Actor.call(this, x, y, 16, 16, "demo_raycast_billboard_man_16x16");

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Navigation settings and target, updated through this actor's lifecycle.
     *
     * @type {rune.raycast.Navigator}
     */
    this.navigator = null;

};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Man.prototype = Object.create(demo.entity.Actor.prototype);
demo.entity.Man.prototype.constructor = demo.entity.Man;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.entity.Man.prototype.init = function() {
    demo.entity.Actor.prototype.init.call(this);
    this.m_initNavigator();
    this.m_initAnimation();
};

/**
 * @inheritDoc
 */
demo.entity.Man.prototype.update = function(step) {
    demo.entity.Actor.prototype.update.call(this, step);
    this.navigator.update(step);
    this.animation.gotoAndPlay(this.navigator.moving ? "walk" : "idle");
};

/**
 * @inheritDoc
 */
demo.entity.Man.prototype.dispose = function() {
    if (this.navigator != null) {
        this.navigator.dispose();
        this.navigator = null;
    }
    demo.entity.Actor.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the navigator and configures following speed and stopping distance.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Man.prototype.m_initNavigator = function() {
    this.navigator = new rune.raycast.Navigator(this);
    this.navigator.speed = 0.7;
    this.navigator.stopDistance = 0.75;
};

/**
 * Creates this actor's idle and walk sequences and starts idle playback.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Man.prototype.m_initAnimation = function() {
    this.animation.create("idle", [0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 3, 4, 4, 0, 0, 0, 0, 0, 1, 2, 2, 5, 5, 5, 6, 6], 8, true);
    this.animation.create("walk", [7, 8, 9, 10, 11, 12, 13, 14, 15], 6, true);
    this.animation.gotoAndPlay("idle");
};
