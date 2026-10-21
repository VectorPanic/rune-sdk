//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a small actor with navigation and observer-relative running frames.
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
 * Demonstrates fleeing or wandering with observer-relative running animations.
 */
demo.entity.Rat = function(x, y) {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend demo.entity.Actor.
     */
    demo.entity.Actor.call(this, x, y, 16, 16, "demo_raycast_billboard_rat_16x16");

    //--------------------------------------------------------------------------
    // Override public properties
    //--------------------------------------------------------------------------

    /**
     * @inheritDoc
     */
    this.worldWidth = 0.3;

    /**
     * @inheritDoc
     */
    this.worldHeight = 0.3;

    /**
     * @inheritDoc
     */
    this.radius = 0.1;

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Movement settings; wanders by default and can be set to flee or follow.
     *
     * @type {rune.raycast.Navigator}
     */
    this.navigator = null;
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Rat.prototype = Object.create(demo.entity.Actor.prototype);
demo.entity.Rat.prototype.constructor = demo.entity.Rat;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.entity.Rat.prototype.init = function() {
    demo.entity.Actor.prototype.init.call(this);
    this.m_initNavigator();
    this.m_initAnimation();
};

/**
 * @inheritDoc
 */
demo.entity.Rat.prototype.update = function(step) {
    demo.entity.Actor.prototype.update.call(this, step);
    this.navigator.update(step);
    this.animation.gotoAndPlay(this.navigator.moving ? "right" : "idle");
};

/**
 * @inheritDoc
 */
demo.entity.Rat.prototype.dispose = function() {
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
 * Creates the navigator, configures running speed and starts wandering.
 * Shares its movement direction with the billboard's directional rendering.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Rat.prototype.m_initNavigator = function() {
    this.navigator = new rune.raycast.Navigator(this);
    this.navigator.speed = 1.4;
    this.direction = this.navigator.direction;
    this.navigator.wander();
};

/**
 * Defines the atlas sequences; Billboard selects frames for each observer.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Rat.prototype.m_initAnimation = function() {
    this.animation.create("idle", [0, 1], 6, true);
    this.animation.create("right", [2, 3], 6, true);
    this.animation.create("down", [8, 9], 6, true);
    this.animation.create("up", [6, 7], 6, true);
    this.animation.create("left", [4, 5], 6, true);
    this.setDirectionalAnimations("right", "down", "up", "left");
    this.animation.gotoAndPlay("idle");
};
