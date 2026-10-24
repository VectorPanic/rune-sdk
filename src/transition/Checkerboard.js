//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Shrinks alternating tiles of the old image to reveal the new image.
 *
 * @constructor
 * @extends rune.transition.Transition
 *
 * @param {Object} [options] Effect settings; duration defaults to 600 milliseconds.
 *
 * @class
 * @classdesc
 *
 * Shrinks alternating tiles of the old image to reveal the new image.
 */
rune.transition.Checkerboard = function(options) {
    
    //--------------------------------------------------------------------------
    // Default arguments
    //--------------------------------------------------------------------------
    
    /**
     * @ignore
     */
    options = options || {};

    //--------------------------------------------------------------------------
    // PUBLIC PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Tile size in internal pixels, a positive integer.
     *
     * @type {number}
     */
    this.tileSize = options.tileSize == null ? 16 : Number(options.tileSize);

    if (!isFinite(this.tileSize) || this.tileSize < 1 || this.tileSize !== Math.floor(this.tileSize)) {
        throw new RangeError("Checkerboard tile size must be a positive integer.");
    }

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Number of tile columns, computed once per operation.
     *
     * @type {number}
     * @private
     */
    this.m_columns = 0;

    /**
     * Number of tile rows, computed once per operation.
     *
     * @type {number}
     * @private
     */
    this.m_rows = 0;

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

rune.transition.Checkerboard.prototype = Object.create(rune.transition.Transition.prototype);
rune.transition.Checkerboard.prototype.constructor = rune.transition.Checkerboard;

//------------------------------------------------------------------------------
// OVERRIDE PUBLIC PROTOTYPE METHODS (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.transition.Checkerboard.prototype.init = function(width, height) {
    this.m_columns = Math.ceil(width / this.tileSize);
    this.m_rows = Math.ceil(height / this.tileSize);
};

/**
 * @inheritDoc
 */
rune.transition.Checkerboard.prototype.render = function(canvas, from, to, progress) {
    canvas.drawImage(to['element'], 0, 0, canvas['width'], canvas['height']);

    for (var row = 0; row < this.m_rows; row++) {
        for (var column = 0; column < this.m_columns; column++) {
            var amount = Math.max(0, Math.min(1, progress * 2 - (row + column) % 2));
            
            if (amount >= 1) {
                continue;
            }
            
            var x = column * this.tileSize;
            var y = row * this.tileSize;
            
            var width = Math.min(this.tileSize, canvas['width'] - x);
            var height = Math.min(this.tileSize, canvas['height'] - y);
            
            var w = width * (1 - amount);
            var h = height * (1 - amount);
            
            canvas.drawImage(
                from['element'],
                x + (width - w) / 2,
                y + (height - h) / 2,
                w,
                h,
                x,
                y,
                width,
                height
            );
        }
    }
};
