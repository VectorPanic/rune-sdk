//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new demo particle instance.
 *
 * @constructor
 * @extends rune.particle.Particle
 *
 * @class
 * @classdesc
 *
 * A colored menu particle that flickers near the end of its lifespan.
 */
demo.entity.Particle = function() {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.particle.Particle.
     */
    rune.particle.Particle.call(this, 0, 0, 8, 8, "demo_particle_8x8");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Particle.prototype = Object.create(rune.particle.Particle.prototype);
demo.entity.Particle.prototype.constructor = demo.entity.Particle;

//------------------------------------------------------------------------------
// Private static constants
//------------------------------------------------------------------------------

/**
 * Flicker time of the particle.
 *
 * @const {number}
 * @private
 */
demo.entity.Particle.LIFESPAN_FLICKERING = 750;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.entity.Particle.prototype.init = function() {
    rune.particle.Particle.prototype.init.call(this);
    this.m_initTexture();
};

/**
 * @inheritDoc
 */
demo.entity.Particle.prototype.update = function(step) {
    rune.particle.Particle.prototype.update.call(this, step);
    this.m_updateLifespan(step);
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Repaints the particle texture in a random color.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
demo.entity.Particle.prototype.m_initTexture = function() {
    this.flicker.stop();
    var c1 = rune.color.Color24.fromHex("#FFFFFF");
    var c2 = rune.color.Color24.fromHex("#FFFFFF");
    c2.random();

    this.texture.replaceColor(
        c1,
        c2
    );
};

/**
 * Updates the particle's lifespan and starts flickering before it expires.
 *
 * @param {number} step Elapsed time in milliseconds.
 *
 * @returns {undefined}
 * @protected
 * @inheritDoc
 * @ignore
 */
demo.entity.Particle.prototype.m_updateLifespan = function(step) {
    rune.particle.Particle.prototype.m_updateLifespan.call(this, step);
    if (this.lifespan < demo.entity.Particle.LIFESPAN_FLICKERING && this.flicker.active == false) {
        this.flicker.start(demo.entity.Particle.LIFESPAN_FLICKERING, 60);
    }
};
