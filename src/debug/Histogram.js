//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Histogram class.
 *
 * @constructor
 * @extends rune.display.DisplayObject
 * @package
 *
 * @param {number} [x] The position of the object in the x direction.
 * @param {number} [y] The position of the object in the y direction.
 * @param {number} [width] The width of the object.
 * @param {number} [height] The height of the object.
 *
 * @class
 * @classdesc
 * 
 * The Histogram class represents a histogram of the current application's 
 * frame rate over time.
 */
rune.debug.Histogram = function(x, y, width, height) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Histogram values.
     *
     * @type {Array.<number>}
     * @private
     */
    this.m_values = [];

    /**
     * Update interval delay.
     *
     * @type {number}
     * @private
     */
    this.m_delay = 0.0;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend DisplayObject.
     */
    rune.display.DisplayObject.call(this, x, y, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.debug.Histogram.prototype = Object.create(rune.display.DisplayObject.prototype);
rune.debug.Histogram.prototype.constructor = rune.debug.Histogram;

//------------------------------------------------------------------------------
// Override public methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.debug.Histogram.prototype.init = function() {
    rune.display.DisplayObject.prototype.init.call(this);
    this['backgroundColor'] = rune.util.Palette.GRAY;
};

/**
 * @inheritDoc
 */
rune.debug.Histogram.prototype.update = function(step) {
    rune.display.DisplayObject.prototype.update.call(this, step);
    this.m_updateInterval(step);
};

/**
 * @inheritDoc
 * @suppress {accessControls}
 */
rune.debug.Histogram.prototype.render = function() {
    if (this.m_cached == false) {
        this.m_renderBackgroundColor();
        this.m_renderValues();
        
        this.restoreCache();
    }
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Updates the update interval.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 * @suppress {accessControls}
 */
rune.debug.Histogram.prototype.m_updateInterval = function(step) {
    this.m_delay += step;
    if (this.m_delay >= 1000) {
        this.m_delay  = 0;
        
        this.m_updateValues(step);
        this.breakCache();
    }
};

/**
 * Updates the histogram values.
 *
 * @returns {undefined}
 * @private
 * @suppress {accessControls}
 */
rune.debug.Histogram.prototype.m_updateValues = function(step) {
    this.m_values.unshift(this['application']['time']['quotient']);
    if (this.m_values.length > this['width']) {
        this.m_values.pop();
    }
};

/**
 * Renders the histogram values.
 *
 * @returns {undefined}
 * @private
 */
rune.debug.Histogram.prototype.m_renderValues = function() {
    for (var i = 0, len = this.m_values.length; i < len; i++) {
        var h = parseInt(this['height'] * this.m_values[i], 10);
        this.m_canvas.drawRectFill(
            i,
            this['height'] - h,
            1,
            h,
            this.m_getColor(this.m_values[i]),
            1
        );
    }
};

/**
 * Retrieves a color code depending on a value.
 *
 * @returns {string}
 * @private
 */
rune.debug.Histogram.prototype.m_getColor = function(value) {
    if (value < 0.6) return rune.util.Palette.RED;
    if (value < 0.8) return rune.util.Palette.ORANGE;
    
    return rune.util.Palette.GREEN;
};