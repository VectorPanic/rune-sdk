//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Emitter object.
 * 
 * @constructor
 * @extends rune.display.DisplayObject
 *
 * @param {number} [x] The emitter x-position.
 * @param {number} [y] The emitter y-position.
 * @param {number} [width] The emitter width.
 * @param {number} [height] The emitter height.
 * @param {Object} [options] Emitter settings.
 *
 * @class
 * @classdesc
 * 
 * The Emitter class represents an emitter of particles; which can be used to 
 * create visual effects (such as smoke, explosions, etc.). An emitter is 
 * represented by a display object that can be added to the display list, each 
 * particle is its own display object, which is added to the same display list 
 * (parent object) as the emitter.
 */
rune.particle.Emitter = function(x, y, width, height, options) {
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * Emitter settings (for particles).
     *
     * @type {rune.particle.EmitterOptions}
     * @protected
     * @ignore
     */
    this.m_options = new rune.particle.EmitterOptions(options);
    
    /**
     * List containing current particles, i.e. particles created by the emitter. 
     * Note that the list includes inactive (and thus invisible) particles.
     *
     * @type {Array.<rune.particle.Particle>}
     * @protected
     * @ignore
     */
    this.m_particles = [];
    
    /**
     * Timer object for interval functionality.
     *
     * @type {rune.timer.Timer}
     * @protected
     * @ignore
     */
    this.m_timer = null;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.display.DisplayObject.
     */
    rune.display.DisplayObject.call(this, x, y, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.particle.Emitter.prototype = Object.create(rune.display.DisplayObject.prototype);
rune.particle.Emitter.prototype.constructor = rune.particle.Emitter;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether the emitter creates particles via a predetermined time interval.
 *
 * @member {boolean} interval
 * @memberof rune.particle.Emitter
 * @instance
 * @readonly
 */
Object.defineProperty(rune.particle.Emitter.prototype, "interval", {
    /**
     * @this rune.particle.Emitter
     * @ignore
     */
    get : function() {
        return (this.m_timer != null);
    }
});

/**
 * The number of active particles, i.e. particles visible on the screen.
 *
 * @member {number} numParticles
 * @memberof rune.particle.Emitter
 * @instance
 * @readonly
 */
Object.defineProperty(rune.particle.Emitter.prototype, "numParticles", {
    /**
     * @this rune.particle.Emitter
     * @ignore
     */
    get : function() {
        var n = 0;
        var i = this.m_particles.length;
        
        while (i--) {
            if (this.m_particles[i]['parent']) {
                n++;
            }
        }
        
        return n;
    }
});

/**
 * Reference to the settings object.
 *
 * @member {number} options
 * @memberof rune.particle.Emitter
 * @instance
 * @readonly
 */
Object.defineProperty(rune.particle.Emitter.prototype, "options", {
    /**
     * @this rune.particle.Emitter
     * @ignore
     */
    get : function() {
        return this.m_options;
    }
});

//------------------------------------------------------------------------------
// Override public methods (API)
//------------------------------------------------------------------------------

/**
 * Removes current (active) particles.
 *
 * @param {boolean} [dispose=false] Whether the particles are to be destroyed.
 *
 * @returns {undefined}
 */
rune.particle.Emitter.prototype.clear = function(dispose) {
    var i = this.m_particles.length;
    var p = null;
    
    while (i--) {
        p = this.m_particles[i];
        if (p.parent !== null) {
            p.parent.removeChild(p, dispose);
        }
    }
    
    if (dispose == true) {
        this.m_particles.length = 0;
    }
};

/**
 * Stops the current time interval.
 *
 * @param {boolean} [cleanup=false] Whether or not current particles should be removed when the interval is stopped.
 * @param {boolean} [dispose=false] Whether the particle objects should be destroyed when they are removed.
 *
 * @returns {undefined}
 * @suppress {accessControls}
 */
rune.particle.Emitter.prototype.clearInterval = function(cleanup, dispose) {
    if (this.m_timer instanceof rune.timer.Timer) {
        this.m_timer.dispose();
        this.m_timer = null;
    }
    
    if (cleanup == true) {
        this.clear(dispose);
    }
};

/**
 * Emits new particles.
 *
 * @param {number} [ammount=1] The number of particles to be emitted.
 *
 * @returns {undefined}
 */
rune.particle.Emitter.prototype.emit = function(ammount) {
    ammount = rune.util.Math.clamp(ammount || 0, 1, this.m_options.capacity);
    while (ammount-- > 0) {
        this.m_emit();
    }
};

/**
 * Gets a list of the emitter's particles. This is useful if, for example, 
 * you want to collision test if particles collide with other display objects.
 *
 * @param {boolean} [active=false] Whether only active particles should be included in the list, i.e. particles that are currently visible and thus active.
 * @param {Array} [list=null] Reference to existing list where particles can be added. If no reference is specified, a new list is created.
 *
 * @returns {Array.<rune.particle.Particle>}
 */
rune.particle.Emitter.prototype.getParticles = function(active, list) {
    list = list || [];
    for (var i = 0; i < this.m_particles.length; i++) {
        if (active && !this.m_particles[i]['parent']) {
            continue;
        }
        
        list.push(this.m_particles[i]);
    }
    
    return list;
};

/**
 * Emits new particles at a fixed time interval.
 *
 * @param {number} ammount The number of particles to be emitted.
 * @param {number} delay The time, in milliseconds, between particle emissions.
 * @param {number} repeat The number of repetitions.
 *
 * @returns {undefined}
 */
rune.particle.Emitter.prototype.setInterval = function(ammount, delay, repeat) {
    this.clearInterval();
    this.m_timer = new rune.timer.Timer({
        duration: delay,
        repeat: repeat,
        onTick: function(timer) {
            this.emit(ammount);
        },
        scope: this
    });
    
    this.m_timer.start();
};

//------------------------------------------------------------------------------
// Override public methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.particle.Emitter.prototype.update = function(step) {
    rune.display.DisplayObject.prototype.update.call(this, step);
    this.m_updateTimer(step);
};

/**
 * @inheritDoc
 */
rune.particle.Emitter.prototype.dispose = function() {
    this.clearInterval(true, true);
    this.m_options.dispose();
    rune.display.DisplayObject.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Protected methods
//------------------------------------------------------------------------------

/**
 * Updates the Timer object for time intervals.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 * @suppress {accessControls}
 */
rune.particle.Emitter.prototype.m_updateTimer = function(step) {
    if (this.m_timer != null) {
        if (this.m_timer['complete']) this.clearInterval();
        else this.m_timer.update(step);
    }
};

/**
 * Creates and configures a particle.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.particle.Emitter.prototype.m_emit = function() {
    var particle = this.m_createParticle();
        particle['x'] = this['centerX'] + rune.util.Math.random(-this['width']  >> 1, this['width']  >> 1);
        particle['y'] = this['centerY'] + rune.util.Math.random(-this['height'] >> 1, this['height'] >> 1);
        
        particle['velocity']['y'] = rune.util.Math.random(this.m_options.minVelocity['y'], this.m_options.maxVelocity['y']);
        particle['velocity']['x'] = rune.util.Math.random(this.m_options.minVelocity['x'], this.m_options.maxVelocity['x']);
        particle['velocity'].acceleration['x'] = this.m_options.acceleration['x'];
        particle['velocity'].acceleration['y'] = this.m_options.acceleration['y'];
        particle['velocity'].drag['x'] = this.m_options.drag['x'];
        particle['velocity'].drag['y'] = this.m_options.drag['y'];
        
        particle.lifespan = rune.util.Math.randomInt(this.m_options.minLifespan, this.m_options.maxLifespan);
        particle['velocity'].angular = rune.util.Math.random(this.m_options.minRotation, this.m_options.maxRotation);
        
    if (this['parent'] != null) {
        this['parent'].addChild(particle);
    }
};

/**
 * Creates a new, or reuses an existing particle.
 *
 * @returns {rune.particle.Particle}
 * @protected
 * @ignore
 */
rune.particle.Emitter.prototype.m_createParticle = function() {
    var particle = null;
    
    if (this.m_particles.length < this.m_options.capacity) {
        particle = new this.m_options.particles[Math.floor(Math.random() * this.m_options.particles.length)]();
    } else {
        particle = this.m_particles.shift();
    }
    
    this.m_particles.push(particle);
    return particle;
};