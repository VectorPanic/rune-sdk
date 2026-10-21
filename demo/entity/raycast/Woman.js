//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Woman actor.
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
 * Demonstrates alternating random walks and idle pauses with wall collision.
 */
demo.entity.Woman = function(x, y) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Wandering and movement settings, updated through this actor's lifecycle.
     *
     * @type {rune.raycast.Navigator}
     */
    this.navigator = null;

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Time remaining before the next walk or pause, in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_wanderTime = 0;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend demo.entity.Actor.
     */
    demo.entity.Actor.call(this, x, y, 16, 16, "demo_raycast_billboard_woman_16x16");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Woman.prototype = Object.create(demo.entity.Actor.prototype);
demo.entity.Woman.prototype.constructor = demo.entity.Woman;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.entity.Woman.prototype.init = function() {
    demo.entity.Actor.prototype.init.call(this);
    this.m_initNavigator();
    this.m_initAnimation();
};

/**
 * @inheritDoc
 */
demo.entity.Woman.prototype.update = function(step) {
    demo.entity.Actor.prototype.update.call(this, step);
    this.m_updateWandering(step);
    this.animation.gotoAndPlay(this.navigator.moving ? "walk" : "idle");
};

/**
 * @inheritDoc
 */
demo.entity.Woman.prototype.dispose = function() {
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
 * Creates the navigator and starts wandering with an initial idle pause.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Woman.prototype.m_initNavigator = function() {
    this.navigator = new rune.raycast.Navigator(this);
    this.navigator.speed = 0.6;
    this.navigator.wander();
    this.navigator.enabled = false;
    this.m_wanderTime = rune.util.Math.random(500, 2000);
};

/**
 * Creates this actor's idle and walk sequences and starts idle playback.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Woman.prototype.m_initAnimation = function() {
    this.animation.create("idle", [0, 0, 0, 1, 2, 2, 3, 3, 3, 0, 0, 0, 4, 4, 5, 5, 5], 6, true);
    this.animation.create("walk", [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 6, true);
    this.animation.gotoAndPlay("idle");
};

/**
 * Alternates walking for one to three seconds and pausing for half a second to
 * two seconds. Navigator handles directions, travel distance and wall collision.
 *
 * @param {number} step Elapsed time in milliseconds.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Woman.prototype.m_updateWandering = function(step) {
    var elapsed = Math.min(Math.max(0, step), this.m_wanderTime);
    this.navigator.update(elapsed);
    this.m_wanderTime -= elapsed;

    if (this.m_wanderTime <= 0) {
        this.navigator.enabled = !this.navigator.enabled;
        this.m_wanderTime = this.navigator.enabled ?
            rune.util.Math.random(1000, 3000) : rune.util.Math.random(500, 2000);
    }
};
