//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Slides the old image out while the new image enters from the opposite edge.
 *
 * @constructor
 * @extends rune.transition.Transition
 *
 * @param {Object} [options] Effect settings; duration defaults to 600 milliseconds.
 *
 * @class
 * @classdesc
 *
 * Uses two image draws and whole-pixel positions to avoid seams between images.
 * Direction describes image movement: left, right, up or down.
 */
rune.transition.Slide = function(options) {
    
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
     * Movement direction, configured before starting the effect.
     *
     * @type {string}
     * @default "left"
     */
    this.direction = options.direction == null ? "left" : options.direction;

    if (this.direction !== "left" && this.direction !== "right" &&
        this.direction !== "up" && this.direction !== "down") {
        throw new RangeError("Slide direction must be left, right, up or down.");
    }

    //--------------------------------------------------------------------------
    // SUPER CALL
    //--------------------------------------------------------------------------

    /**
     * Extend rune.transition.Transition.
     */
    rune.transition.Transition.call(this, options);
};

//------------------------------------------------------------------------------
// INHERITANCE
//------------------------------------------------------------------------------

rune.transition.Slide.prototype = Object.create(rune.transition.Transition.prototype);
rune.transition.Slide.prototype.constructor = rune.transition.Slide;

//------------------------------------------------------------------------------
// OVERRIDE PUBLIC PROTOTYPE METHODS (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.transition.Slide.prototype.render = function(canvas, from, to, progress) {
    var width = canvas['width'];
    var height = canvas['height'];

    var horizontal = this.direction === "left" || this.direction === "right";
    var sign = this.direction === "left" || this.direction === "up" ? -1 : 1;

    var x = horizontal ? sign * Math.round(width * progress) : 0;
    var y = horizontal ? 0 : sign * Math.round(height * progress);

    canvas.drawImage(from['element'], x, y, width, height);
    canvas.drawImage(
        to['element'],
        horizontal ? x - sign * width : 0,
        horizontal ? 0 : y - sign * height,
        width,
        height
    );
};
