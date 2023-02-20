//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Astronaut instance.
 *
 * @constructor
 * @extends rune.display.Sprite
 *
 * @param {number} [x] The x position of the object.
 * @param {number} [y] The y position of the object.
 * 
 * @class
 * @classdesc
 * 
 * The Astronaut class represents an animated astronaut sprite.
 */
demo.entity.Astronaut = function(x, y) {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.display.Sprite.
     */
    rune.display.Sprite.call(this, x || 0, y || 0, 48, 48, "demo_astronaut_48x48");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Astronaut.prototype = Object.create(rune.display.Sprite.prototype);
demo.entity.Astronaut.prototype.constructor = demo.entity.Astronaut;

//--------------------------------------------------------------------------
// Override public prototype methods
//--------------------------------------------------------------------------

/**
 * @override
 */
demo.entity.Astronaut.prototype.init = function() {
    rune.display.Sprite.prototype.init.call(this);
    this.m_initBounds();
    this.m_initVelocity();
    this.m_initAnimation();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Configures the size of the astronaut's hitbox.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Astronaut.prototype.m_initBounds = function() {
    this.hitbox.set(
        14,
        14,
        20,
        20
    );
};

/**
 * Configures the astronaut's velocity.
 *
 * @returns {undefined}
 * @private
 */
demo.entity.Astronaut.prototype.m_initVelocity = function() {
    this.movable = true;
    this.velocity.x = rune.util.Math.random(-1.125, 1.125);
    this.velocity.y = rune.util.Math.random(-1.125, 1.125);
    this.velocity.angular = rune.util.Math.random(-1, 1);
    this.elasticity = rune.util.Math.random(0.0, 0.8);
};

/**
 * Configures the astronaut's animation sequence.
 * 
 * @returns {undefined}
 * @private
 */
demo.entity.Astronaut.prototype.m_initAnimation = function() {
    this.animation.create("idle", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], Math.abs(5 * this.velocity.angular), true);
};