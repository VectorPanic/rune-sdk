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
 * @param {number} [width=1.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [height=1.0] The height of the rectangle, in pixels.
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
    rune.display.Sprite.call(
        this,
        x || 0,
        y || 0,
        width || 1,
        height || 1,
        resource
    );
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.particle.Particle.prototype = Object.create(rune.display.Sprite.prototype);
rune.particle.Particle.prototype.constructor = rune.particle.Particle;

//------------------------------------------------------------------------------
// Public methods (API)
//------------------------------------------------------------------------------

/**
 * Called when the particle is emitted. Override this method to apply custom
 * particle state after the emitter has assigned its standard properties.
 *
 * @param {rune.particle.Emitter} emitter The emitter that emitted the particle.
 *
 * @returns {undefined}
 */
rune.particle.Particle.prototype.onEmit = function(emitter) {};

/**
 * Resets reusable particle state before the emitter assigns its standard
 * properties. Override this method to reset custom particle state.
 *
 * @param {rune.particle.Emitter} emitter The emitter that emits the particle.
 *
 * @returns {undefined}
 */
rune.particle.Particle.prototype.reset = function(emitter) {
    this['alpha'] = 1.0;
    this['visible'] = true;
    this['scaleX'] = 1.0;
    this['scaleY'] = 1.0;
    this['rotation'] = 0.0;
    this['flippedX'] = false;
    this['flippedY'] = false;
    
    this['flicker'].stop(false);
    
    this['velocity'].x = 0.0;
    this['velocity'].y = 0.0;
    this['velocity'].acceleration.x = 0.0;
    this['velocity'].acceleration.y = 0.0;
    this['velocity'].drag.x = 0.0;
    this['velocity'].drag.y = 0.0;
    this['velocity'].max.x = 100.0;
    this['velocity'].max.y = 100.0;
    this['velocity'].angular = 0.0;
    this['velocity'].angularAcceleration = 0.0;
    this['velocity'].angularDrag = 0.0;
    this['velocity'].angularMax = 100.0;
};

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
