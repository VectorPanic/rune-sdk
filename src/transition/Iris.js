//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Closes a circular window over the old image and opens it over the new image.
 *
 * @constructor
 * @extends rune.transition.Transition
 *
 * @param {Object} [options] Effect settings; duration defaults to 600 milliseconds.
 *
 * @class
 * @classdesc
 *
 * Closes a circular window over the old image and opens it over the new image.
 */
rune.transition.Iris = function(options) {
    
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
     * Color outside the window.
     *
     * @type {string}
     */
    this.color = options.color || "#000000";

    /**
     * Horizontal center in internal pixels; null centers it.
     *
     * @type {?number}
     */
    this.centerX = options.centerX == null ? null : Number(options.centerX);

    /**
     * Vertical center in internal pixels; null centers it.
     *
     * @type {?number}
     */
    this.centerY = options.centerY == null ? null : Number(options.centerY);

    if ((this.centerX != null && !isFinite(this.centerX)) ||
        (this.centerY != null && !isFinite(this.centerY))) {
        throw new RangeError("Iris center must be finite.");
    }

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Resolved horizontal window center in pixels.
     *
     * @type {number}
     * @private
     */
    this.m_x = 0;

    /**
     * Resolved vertical window center in pixels.
     *
     * @type {number}
     * @private
     */
    this.m_y = 0;

    /**
     * Radius needed to cover every screen corner.
     *
     * @type {number}
     * @private
     */
    this.m_radius = 0;

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

rune.transition.Iris.prototype = Object.create(rune.transition.Transition.prototype);
rune.transition.Iris.prototype.constructor = rune.transition.Iris;

//------------------------------------------------------------------------------
// OVERRIDE PUBLIC PROTOTYPE METHODS (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.transition.Iris.prototype.init = function(width, height) {
    this.m_x = this.centerX == null ? width / 2 : this.centerX;
    this.m_y = this.centerY == null ? height / 2 : this.centerY;

    var dx = Math.max(Math.abs(this.m_x), Math.abs(width - this.m_x));
    var dy = Math.max(Math.abs(this.m_y), Math.abs(height - this.m_y));

    this.m_radius = Math.sqrt(dx * dx + dy * dy);
};

/**
 * @inheritDoc
 */
rune.transition.Iris.prototype.render = function(canvas, from, to, progress) {
    if (progress <= 0 || progress >= 1) {
        var complete = progress <= 0 ? from : to;
        canvas.drawImage(complete['element'], 0, 0, canvas['width'], canvas['height']);
        
        return;
    }

    var context = canvas['context'];
    var image = progress < 0.5 ? from : to;
    var radius = this.m_radius * Math.abs(1 - progress * 2);

    canvas.drawFill(this.color);

    if (radius <= 0) {
        return;
    }

    context.save();
    context.beginPath();
    context.arc(this.m_x, this.m_y, radius, 0, Math.PI * 2);
    context.clip();

    canvas.drawImage(image['element'], 0, 0, canvas['width'], canvas['height']);

    context.restore();
};
