//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates a reusable effect that combines two frozen screen images.
 *
 * @constructor
 * @abstract
 *
 * @param {Object} [options] Effect settings; duration defaults to 600 milliseconds.
 *
 * @class
 * @classdesc
 *
 * Subclass render() in game code to draw from and to into the supplied Canvas.
 * Progress ranges from zero to one. Images use internal screen pixels and must
 * not be modified or retained. Transitions owns their lifetime. No pixel readback
 * is required. Effects are initialized once and disposed when finished/cancelled.
 */
rune.transition.Transition = function(options) {
    
    //--------------------------------------------------------------------------
    // DEFAULT ARGUMENTS
    //--------------------------------------------------------------------------

    /**
     * @ignore
     */
    options = options || {};

    //--------------------------------------------------------------------------
    // PUBLIC PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Effect duration in milliseconds, excluding scene initialization.
     * Configure before starting an effect; must be finite and greater than zero.
     *
     * @type {number}
     * @default 600
     */
    this.duration = options.duration == null ? 600 : Number(options.duration);

    if (!isFinite(this.duration) || this.duration <= 0) {
        throw new RangeError("Transition duration must be finite and positive.");
    }
};

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE METHODS (ENGINE)
//------------------------------------------------------------------------------

/**
 * Prepares an effect for the supplied screen size. Override for precomputation.
 *
 * @param {number} width Screen width in pixels.
 * @param {number} height Screen height in pixels.
 *
 * @returns {undefined}
 * @ignore
 */
rune.transition.Transition.prototype.init = function(width, height) {
};

/**
 * Draws an effect frame. The target is cleared before each call.
 *
 * @param {rune.display.Canvas} canvas Output canvas.
 * @param {rune.display.Canvas} from Frozen previous image.
 * @param {rune.display.Canvas} to Frozen next image.
 * @param {number} progress Normalized progress from zero to one.
 *
 * @returns {undefined}
 */
rune.transition.Transition.prototype.render = function(canvas, from, to, progress) {
    throw new Error("Transition.render() must be overridden.");
};

/**
 * Releases effect-owned resources. Screen images remain owned by Transitions.
 * Override when a custom effect allocates additional resources.
 *
 * @returns {undefined}
 * @ignore
 */
rune.transition.Transition.prototype.dispose = function() {
};
