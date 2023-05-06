//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new particle object.
 * 
 * @constructor
 * @extends rune.display.Sprite
 * @abstract
 *
 * @param {number} [x=0.0] The x coordinate of the top-left corner of the rectangle.
 * @param {number} [y=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [width=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [height=0.0] The height of the rectangle, in pixels.
 * @param {string} [resource=""] Name of the resource to be used as texture data.
 *
 * @class
 * @classdesc
 * 
 * The rune.particle.Particle class represents a single particle emitted by an 
 * Emitter (rune.particle.Emitter). Particles must inherit from this class and be 
 * added to an Emitter via its configuration object. New instances of the class 
 * are automatically created when the emitter emits particles.
 */
rune.particle.Particle = function(x, y, width, height, resource) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * The time, in milliseconds, that the particle object will exist, starting 
     * from when it was emitted. When the object's lifespan is over, it is 
     * removed and thus no longer visible.
     *
     * @type {number}
     */
    this.lifespan = 0;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.display.Sprite.
     */
    rune.display.Sprite.call(this, x, y, width, height, resource);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.particle.Particle.prototype = Object.create(rune.display.Sprite.prototype);
rune.particle.Particle.prototype.constructor = rune.particle.Particle;

//------------------------------------------------------------------------------
// Override public methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.particle.Particle.prototype.postUpdate = function(step) {
    rune.display.Sprite.prototype.postUpdate.call(this, step);
    this.m_updateLifespan(step);
};

//------------------------------------------------------------------------------
// Protected methods
//------------------------------------------------------------------------------

/**
 * Updates the object's life span.
 *
 * @param {number} step Fixed time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.particle.Particle.prototype.m_updateLifespan = function(step) {
    if (this.lifespan <= 0 && this['parent'] != null) this['parent'].removeChild(this);
    else this.lifespan -= step;
};