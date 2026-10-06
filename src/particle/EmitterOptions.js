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
    
    /**
     * @ignore
     */
    var number = function(value, fallback) {
        value = parseFloat(value);
        return isNaN(value) == false ? value : fallback;
    };
    
    /**
     * @ignore
     */
    var integer = function(value, fallback) {
        value = parseInt(value, 10);
        return isNaN(value) == false ? value : fallback;
    };
    
    /**
     * @ignore
     */
    var range = function(a, b) {
        return a <= b ? [a, b] : [b, a];
    };
    
    /**
     * @ignore
     */
    var particles = Array.isArray(data["particles"]) ? data["particles"].slice() : [];
    
    /**
     * @ignore
     */
    particles = particles.filter(function(value) {
        return typeof value == "function";
    });
    
    /**
     * @ignore
     */
    var lifespan = range(
        Math.max(0, integer(data["minLifespan"], 2500)),
        Math.max(0, integer(data["maxLifespan"], 5000))
    );
    
    /**
     * @ignore
     */
    var rotation = range(
        number(data["minRotation"], 0),
        number(data["maxRotation"], 0)
    );
    
    /**
     * @ignore
     */
    var velocityX = range(
        number(data["minVelocityX"], 0),
        number(data["maxVelocityX"], 0)
    );
    
    /**
     * @ignore
     */
    var velocityY = range(
        number(data["minVelocityY"], 0),
        number(data["maxVelocityY"], 0)
    );

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Force (in x- and y-direction) that represents the acceleration of 
     * particles, i.e. their increasing speed of movement.
     *
     * @type {rune.geom.Point}
     */
    this.acceleration = new rune.geom.Point(number(data["accelerationX"], 0), number(data["accelerationY"], 0));
    
    /**
     * The emitter's capacity, i.e. the maximum number of particles it can 
     * handle.
     *
     * @type {number}
     */
    this.capacity = Math.max(1, integer(data["capacity"], 64));

    /**
     * Force (in x- and y-direction) that counteracts the particles' velocity, 
     * i.e. slows down their speed of movement.
     *
     * @type {rune.geom.Point}
     */
    this.drag = new rune.geom.Point(number(data["dragX"], 0), number(data["dragY"], 0));
    
    /**
     * The maximum lifetime of a particle (in milliseconds).
     *
     * @type {number}
     */
    this.maxLifespan = lifespan[1];
    
    /**
     * A particle's maximum angular velocity.
     *
     * @type {number}
     */
    this.maxRotation = rotation[1];
    
    /**
     * A particle's maximum velocity.
     *
     * @type {rune.geom.Point}
     */
    this.maxVelocity = new rune.geom.Point(velocityX[1], velocityY[1]);
    
    /**
     * The minimum lifetime of a particle (in milliseconds).
     *
     * @type {number}
     */
    this.minLifespan = lifespan[0];
    
    /**
     * A particle's minimum angular velocity.
     *
     * @type {number}
     */
    this.minRotation = rotation[0];
    
    /**
     * A particle's minimum velocity.
     *
     * @type {rune.geom.Point}
     */
    this.minVelocity = new rune.geom.Point(velocityX[0], velocityY[0]);
    
    /**
     * A list of classes to use as particles. When a new particle is to be 
     * created, a random class is chosen from this list. Note that the list 
     * contains references to classes, not instantiated objects.
     *
     * @type {Array.<Function>}
     */
    this.particles = particles.length > 0 ? particles : [rune.particle.Particle];
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
