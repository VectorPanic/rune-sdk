//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a scalable frame from nine regions of a bitmap texture.
 *
 * @constructor
 * @extends rune.display.DisplayObject
 *
 * @param {number} x Horizontal position.
 * @param {number} y Vertical position.
 * @param {number} width Initial width, greater than zero.
 * @param {number} height Initial height, greater than zero.
 * @param {string|HTMLImageElement} resource Texture resource name or loaded image.
 * @param {number} [left=0] Left border width in source pixels.
 * @param {number} [top=0] Top border height in source pixels.
 * @param {number} [right=0] Right border width in source pixels.
 * @param {number} [bottom=0] Bottom border height in source pixels.
 * @throws {Error} If the image, initial dimensions or insets are invalid.
 *
 * @class
 * @classdesc
 *
 * Resizes a pixel frame while preserving its corners. Borders and the center
 * stretch by default, or repeat when mode is MODE_REPEAT. Insets are nonnegative
 * integers and must leave a positive center in the source image. Small panels
 * proportionally shrink opposing borders to fit, rounding the left/top down.
 * Change width/height to resize the panel; scaleX/scaleY scale the entire result.
 * Pixels are cached until size, insets, mode or texture content changes. Each
 * instance owns a Texture wrapper so recoloring does not affect other panels.
 */
rune.display.NineSlice = function(x, y, width, height, resource, left, top, right, bottom) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Per-instance texture wrapper with shared source pixels until modified.
     * @type {rune.display.Texture}
     * @private
     */
    this.m_texture = null;

    /**
     * How borders and the center fill their destination regions.
     * @type {string}
     * @private
     */
    this.m_mode = rune.display.NineSlice.MODE_STRETCH;

    /**
     * Source left border width in pixels.
     * @type {number}
     * @private
     */
    this.m_insetLeft = 0;

    /**
     * Source top border height in pixels.
     * @type {number}
     * @private
     */
    this.m_insetTop = 0;

    /**
     * Source right border width in pixels.
     * @type {number}
     * @private
     */
    this.m_insetRight = 0;

    /**
     * Source bottom border height in pixels.
     * @type {number}
     * @private
     */
    this.m_insetBottom = 0;

    //--------------------------------------------------------------------------
    // Default arguments
    //--------------------------------------------------------------------------

    /**
     * Validate before allocating the destination canvas.
     */
    if (typeof width !== "number" || !isFinite(width) || width <= 0 ||
        typeof height !== "number" || !isFinite(height) || height <= 0) {
        throw new Error("NineSlice requires positive initial dimensions.");
    }
    var image = resource;
    if (typeof resource === "string") {
        var entry = this['application']['resources'].get(resource);
        image = entry != null ? entry['data'] : null;
    }
    if (!(image instanceof HTMLImageElement) || image.width <= 0 || image.height <= 0 ||
        (typeof image.naturalWidth === "number" && image.naturalWidth <= 0)) {
        throw new Error("NineSlice requires a loaded image texture.");
    }
    this.m_texture = new rune.display.Texture(this, image);
    this.m_setInsets(left, top, right, bottom);

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

rune.display.NineSlice.prototype = Object.create(rune.display.DisplayObject.prototype);
rune.display.NineSlice.prototype.constructor = rune.display.NineSlice;

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Stretches borders and the center, requiring at most nine image draws.
 * @const {string}
 */
rune.display.NineSlice.MODE_STRETCH = "stretch";

/**
 * Repeats borders along their length and tiles the center. Partial tiles are
 * cropped at the destination boundary. Corners are never repeated.
 * @const {string}
 */
rune.display.NineSlice.MODE_REPEAT = "repeat";

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Border and center fill mode, MODE_STRETCH (default) or MODE_REPEAT.
 *
 * @member {string} mode
 * @memberof rune.display.NineSlice
 * @instance
 * @throws {Error} If the mode is unsupported.
 */
Object.defineProperty(rune.display.NineSlice.prototype, "mode", {
    /**
     * @this rune.display.NineSlice
     * @ignore
     */
    get : function() {
        return this.m_mode;
    },
    /**
     * @this rune.display.NineSlice
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        if (value !== rune.display.NineSlice.MODE_STRETCH && value !== rune.display.NineSlice.MODE_REPEAT) {
            throw new Error("Invalid NineSlice mode.");
        }
        if (this.m_mode !== value) {
            this.m_mode = value;
            this.breakCache();
        }
    }
});

/**
 * Texture wrapper supporting independent replaceColor() and reset().
 *
 * @member {rune.display.Texture} texture
 * @memberof rune.display.NineSlice
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.NineSlice.prototype, "texture", {
    /**
     * @this rune.display.NineSlice
     * @ignore
     */
    get : function() {
        return this.m_texture;
    }
});

/**
 * Source left border width in pixels; change through setInsets().
 *
 * @member {number} insetLeft
 * @memberof rune.display.NineSlice
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.NineSlice.prototype, "insetLeft", {
    /**
     * @this rune.display.NineSlice
     * @ignore
     */
    get : function() {
        return this.m_insetLeft;
    }
});

/**
 * Source top border height in pixels; change through setInsets().
 *
 * @member {number} insetTop
 * @memberof rune.display.NineSlice
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.NineSlice.prototype, "insetTop", {
    /**
     * @this rune.display.NineSlice
     * @ignore
     */
    get : function() {
        return this.m_insetTop;
    }
});

/**
 * Source right border width in pixels; change through setInsets().
 *
 * @member {number} insetRight
 * @memberof rune.display.NineSlice
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.NineSlice.prototype, "insetRight", {
    /**
     * @this rune.display.NineSlice
     * @ignore
     */
    get : function() {
        return this.m_insetRight;
    }
});

/**
 * Source bottom border height in pixels; change through setInsets().
 *
 * @member {number} insetBottom
 * @memberof rune.display.NineSlice
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.NineSlice.prototype, "insetBottom", {
    /**
     * @this rune.display.NineSlice
     * @ignore
     */
    get : function() {
        return this.m_insetBottom;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Replaces all source insets together. Validation is atomic: invalid values do
 * not change the existing frame. Omitted insets default to zero.
 *
 * @param {number} [left=0] Left border width.
 * @param {number} [top=0] Top border height.
 * @param {number} [right=0] Right border width.
 * @param {number} [bottom=0] Bottom border height.
 *
 * @return {undefined}
 * @throws {Error} If insets are invalid or leave no positive source center.
 * @suppress {accessControls}
 */
rune.display.NineSlice.prototype.setInsets = function(left, top, right, bottom) {
    if (this.m_setInsets(left, top, right, bottom)) this.breakCache();
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 * @suppress {accessControls}
 */
rune.display.NineSlice.prototype.render = function() {
    if (this.m_cached === false) {
        var version = this.m_cacheVersion;
        this.m_renderBackgroundColor();
        this.m_renderTexture();
        this.m_renderStates();
        this.restoreCache(version);
    }
};

/**
 * @inheritDoc
 */
rune.display.NineSlice.prototype.dispose = function() {
    this.m_disposeTexture();
    rune.display.DisplayObject.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Splits source and destination into nine regions. Uses local canvas dimensions
 * so object scaling does not affect the source border widths.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.NineSlice.prototype.m_renderTexture = function() {
    if (this.m_texture == null || this.m_canvas == null) return;
    var image = this.m_texture['data'];
    var width = this.m_canvas['width'];
    var height = this.m_canvas['height'];
    if (image == null || width <= 0 || height <= 0) return;
    var left = this.m_insetLeft;
    var top = this.m_insetTop;
    var right = this.m_insetRight;
    var bottom = this.m_insetBottom;
    var sourceWidth = image.width - left - right;
    var sourceHeight = image.height - top - bottom;
    var dl = width < left + right ? Math.floor(width * left / (left + right)) : left;
    var dr = width < left + right ? width - dl : right;
    var dt = height < top + bottom ? Math.floor(height * top / (top + bottom)) : top;
    var db = height < top + bottom ? height - dt : bottom;
    var middleWidth = width - dl - dr;
    var middleHeight = height - dt - db;

    var context = this.m_canvas['context'];
    context.save();
    context.imageSmoothingEnabled = false;

    this.m_renderSlice(image, 0, 0, left, top, 0, 0, dl, dt, false, false);
    this.m_renderSlice(image, left, 0, sourceWidth, top, dl, 0, middleWidth, dt, true, false);
    this.m_renderSlice(image, image.width - right, 0, right, top, width - dr, 0, dr, dt, false, false);
    this.m_renderSlice(image, 0, top, left, sourceHeight, 0, dt, dl, middleHeight, false, true);
    this.m_renderSlice(image, left, top, sourceWidth, sourceHeight, dl, dt, middleWidth, middleHeight, true, true);
    this.m_renderSlice(image, image.width - right, top, right, sourceHeight, width - dr, dt, dr, middleHeight, false, true);
    this.m_renderSlice(image, 0, image.height - bottom, left, bottom, 0, height - db, dl, db, false, false);
    this.m_renderSlice(image, left, image.height - bottom, sourceWidth, bottom, dl, height - db, middleWidth, db, true, false);
    this.m_renderSlice(image, image.width - right, image.height - bottom, right, bottom, width - dr, height - db, dr, db, false, false);

    context.restore();
};

/**
 * Draws one region, stretching it or repeating and cropping its partial tiles.
 * Zero-sized source or destination regions are skipped before calling Canvas.
 *
 * @param {Object} image Source bitmap.
 * @param {number} sx Source x.
 * @param {number} sy Source y.
 * @param {number} sw Source width.
 * @param {number} sh Source height.
 * @param {number} dx Destination x.
 * @param {number} dy Destination y.
 * @param {number} dw Destination width.
 * @param {number} dh Destination height.
 * @param {boolean} repeatX Whether the region may repeat horizontally.
 * @param {boolean} repeatY Whether the region may repeat vertically.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.NineSlice.prototype.m_renderSlice = function(image, sx, sy, sw, sh, dx, dy, dw, dh, repeatX, repeatY) {
    if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
    if (this.m_mode === rune.display.NineSlice.MODE_STRETCH || (!repeatX && !repeatY)) {
        this.m_canvas['context'].drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        return;
    }
    var stepX = repeatX ? sw : dw;
    var stepY = repeatY ? sh : dh;
    for (var y = 0; y < dh; y += stepY) {
        var h = Math.min(stepY, dh - y);
        for (var x = 0; x < dw; x += stepX) {
            var w = Math.min(stepX, dw - x);
            this.m_canvas['context'].drawImage(image, sx, sy, repeatX ? w : sw, repeatY ? h : sh, dx + x, dy + y, w, h);
        }
    }
};

/**
 * Releases the texture wrapper while retaining the shared resource image.
 *
 * @return {undefined}
 * @protected
 * @ignore
 * @suppress {accessControls}
 */
rune.display.NineSlice.prototype.m_disposeTexture = function() {
    if (this.m_texture != null) {
        this.m_texture.dispose();
        this.m_texture = null;
    }
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Validates and assigns all insets without touching the render cache. Used
 * before the base constructor and by the public setInsets method.
 *
 * @param {number} [left=0] Left border width.
 * @param {number} [top=0] Top border height.
 * @param {number} [right=0] Right border width.
 * @param {number} [bottom=0] Bottom border height.
 *
 * @return {boolean} Whether any inset changed.
 * @throws {Error} If an inset is not a nonnegative integer or the center is empty.
 * @private
 */
rune.display.NineSlice.prototype.m_setInsets = function(left, top, right, bottom) {
    left = left === undefined ? 0 : left;
    top = top === undefined ? 0 : top;
    right = right === undefined ? 0 : right;
    bottom = bottom === undefined ? 0 : bottom;
    if (typeof left !== "number" || !isFinite(left) || left < 0 || left !== Math.floor(left) ||
        typeof top !== "number" || !isFinite(top) || top < 0 || top !== Math.floor(top) ||
        typeof right !== "number" || !isFinite(right) || right < 0 || right !== Math.floor(right) ||
        typeof bottom !== "number" || !isFinite(bottom) || bottom < 0 || bottom !== Math.floor(bottom) ||
        left + right >= this.m_texture['width'] || top + bottom >= this.m_texture['height']) {
        throw new Error("Invalid NineSlice insets; a positive source center is required.");
    }
    var changed = this.m_insetLeft !== left || this.m_insetTop !== top ||
        this.m_insetRight !== right || this.m_insetBottom !== bottom;
    this.m_insetLeft = left;
    this.m_insetTop = top;
    this.m_insetRight = right;
    this.m_insetBottom = bottom;
    return changed;
};
