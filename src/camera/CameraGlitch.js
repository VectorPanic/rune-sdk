//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a camera glitch subsystem, reusing display band displacement.
 *
 * @constructor
 *
 * @extends rune.display.Glitch
 * @class
 * @classdesc
 *
 * Applies glitch directly to the camera's freshly rendered image before its
 * overlays. The existing camera.glitch API and rendering order are preserved.
 */
rune.camera.CameraGlitch = function() {
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Create an ownerless effect; the camera manages its render pass.
     */
    rune.display.Glitch.call(this);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.camera.CameraGlitch.prototype = Object.create(rune.display.Glitch.prototype);
rune.camera.CameraGlitch.prototype.constructor = rune.camera.CameraGlitch;

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Displaces bands in a freshly rendered camera image before tint, flash and fade.
 * @param {rune.display.Canvas} canvas Camera buffer to modify.
 * @return {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraGlitch.prototype.render = function(canvas) {
    this.m_renderBands(canvas);
};
