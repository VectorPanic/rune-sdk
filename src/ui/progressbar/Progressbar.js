//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Progressbar object.
 *
 * @constructor
 * @extends rune.display.DisplayObject
 *
 * @param {number} [width=16] The width of the progress bar.
 * @param {number} [height=2] The height of the progress bar.
 * @param {string} [backgroundColor="#000000"] The progress bar background color.
 * @param {string} [forgroundColor="#ff004d"] The progress bar fill color.
 * 
 * @class
 * @classdesc
 * 
 * The class represents a simple progress bar.
 */
rune.ui.Progressbar = function(width, height, backgroundColor, forgroundColor) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Used to illustrate the progression and drawn on top of the background 
     * color.
     *
     * @type {string}
     * @default "#ff004d"
     */
    this.forgroundColor = forgroundColor || rune.util.Palette.WHITE;

    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------

    /**
     * Current progression represented by a floating point number between 0 
     * and 1.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_progress = 0.0;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend DisplayObject.
     */
    rune.display.DisplayObject.call(this, 0, 0, width || 16, height || 2);
    
    //--------------------------------------------------------------------------
    // Post super call
    //--------------------------------------------------------------------------
    
    /**
     * Sets the value of the backgroundColor property to that of the 
     * backgroundColor argument.
     *
     * @ignore
     */
    this['backgroundColor'] = backgroundColor || rune.util.Palette.BLACK;
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.ui.Progressbar.prototype = Object.create(rune.display.DisplayObject.prototype);
rune.ui.Progressbar.prototype.constructor = rune.ui.Progressbar;

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Current progression in the form of a floating point number between 0 (0%) 
 * and 1 (100%).
 *
 * @member {number} progress
 * @memberof rune.ui.Progressbar
 * @instance
 */
Object.defineProperty(rune.ui.Progressbar.prototype, "progress", {
    /**
     * @this rune.ui.Progressbar
     * @ignore
     */
    get : function() {
        return this.m_progress;
    },
    
    /**
     * @this rune.ui.Progressbar
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        value = rune.util.Math.clamp(value, 0, 1);
        if (this.m_progress !== value) {
            this.m_progress   = value;
            
            this.breakCache();
        }
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 * @suppress {accessControls}
 */
rune.ui.Progressbar.prototype.render = function() {
    if (this.m_cached == false) {
        this.m_renderBackgroundColor();
        this.m_renderProgress();
        
        this.restoreCache();
    }
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Draws the part that visualizes the progression of the progress bar.
 *
 * @returns {undefined}
 * @private
 */
rune.ui.Progressbar.prototype.m_renderProgress = function() {
    this["canvas"].drawRectFill(
        0,
        0,
        this.m_canvas.width * this.progress,
        this.m_canvas.height,
        this.forgroundColor
    );
};