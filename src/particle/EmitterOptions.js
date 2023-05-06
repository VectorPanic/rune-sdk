//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new object.
 * 
 * @constructor
 * @package
 *
 * @param {Object} [data] Settings for particles.
 * 
 * @class
 * @classdesc
 * 
 * The EmitterOptions class contains settings for an Emitter. These settings 
 * are applied to all particles created by the emitter.
 */
rune.particle.EmitterOptions = function(data) {
    
    //--------------------------------------------------------------------------
    // Default arguments
    //--------------------------------------------------------------------------

    /**
     * @ignore
     */
    data = data || {};

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Force (in x- and y-direction) that represents the acceleration of 
     * particles, i.e. their increasing speed of movement.
     *
     * @type {rune.geom.Point}
     */
    this.acceleration = new rune.geom.Point(data.accelerationX || 0, data.accelerationY || 0);
    
    /**
     * The emitter's capacity, i.e. the maximum number of particles it can 
     * handle.
     *
     * @type {number}
     */
    this.capacity = data.capacity || 64;

    /**
     * Force (in x- and y-direction) that counteracts the particles' velocity, 
     * i.e. slows down their speed of movement.
     *
     * @type {rune.geom.Point}
     */
    this.drag = new rune.geom.Point(data.dragX || 0, data.dragY || 0);
    
    /**
     * The maximum lifetime of a particle (in milliseconds).
     *
     * @type {number}
     */
    this.maxLifespan = data.maxLifespan || 5000;
    
    /**
     * A particle's maximum angular velocity.
     *
     * @type {number}
     */
    this.maxRotation = data.maxRotation || 0;
    
    /**
     * A particle's maximum velocity.
     *
     * @type {rune.geom.Point}
     */
    this.maxVelocity = new rune.geom.Point(data.maxVelocityX || 0, data.maxVelocityY || 0);
    
    /**
     * The minimum lifetime of a particle (in milliseconds).
     *
     * @type {number}
     */
    this.minLifespan = data.minLifespan || 2500;
    
    /**
     * A particle's minimum angular velocity.
     *
     * @type {number}
     */
    this.minRotation = data.minRotation || 0;
    
    /**
     * A particle's minimum velocity.
     *
     * @type {rune.geom.Point}
     */
    this.minVelocity = new rune.geom.Point(data.minVelocityX || 0, data.minVelocityY || 0);
    
    /**
     * A list of classes to use as particles. When a new particle is to be 
     * created, a random class is chosen from this list. Note that the list 
     * contains references to classes, not instantiated objects.
     *
     * @type {Array.<Function>}
     */
    this.particles = data.particles || [rune.particle.Particle];
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Deallocates memory allocated by this object.
 *
 * @returns {undefined}
 * @ignore
 */
rune.particle.EmitterOptions.prototype.dispose = function() {
    this.acceleration = null;
    this.drag = null;
    this.maxVelocity = null;
    this.minVelocity = null;
    this.particles = null;
};