//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates an optional display glitch subsystem. Buffers are allocated on 
 * first use.
 *
 * @constructor
 *
 * @param {rune.display.DisplayObject} [owner] Object owning the effect.
 *
 * @class
 * @classdesc
 *
 * Applies horizontal band displacement without changing the owner's cached 
 * image.CameraGlitch reuses the same displacement operation on its freshly 
 * drawn image.
 */
rune.display.Glitch = function(owner) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Owner used to invalidate parent containers when the effect changes.
     * @type {rune.display.DisplayObject}
     * @private
     */
    this.m_owner = owner || null;

    /**
     * Separate effect image; the original owner buffer remains untouched.
     * @type {rune.display.Canvas}
     * @private
     */
    this.m_output = null;

    /**
     * Source element used to build the cached effect image.
     * @type {Element}
     * @private
     */
    this.m_source = null;

    /**
     * Whether the effect image needs rebuilding.
     * @type {boolean}
     * @private
     */
    this.m_dirty = true;

    /**
     * Source height used for the current band pattern.
     * @type {number}
     * @private
     */
    this.m_height = 0;

    /**
     * Reusable scratch buffer, created only while the effect is active.
     *
     * @type {rune.display.Canvas}
     * @private
     */
    this.m_canvas = null;

    /**
     * Remaining effect duration in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_remaining = 0;

    /**
     * Maximum horizontal displacement in local buffer pixels.
     *
     * @type {number}
     * @private
     */
    this.m_amount = 8;

    /**
     * Elapsed time since the last pattern refresh, in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_elapsed = 0;

    /**
     * Reusable triples containing band y, height and horizontal displacement.
     * @type {Array.<number>}
     * @private
     */
    this.m_bands = [];

    /**
     * Whether the band pattern must be regenerated before rendering.
     *
     * @type {boolean}
     * @private
     */
    this.m_refresh = true;
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether a nonzero displacement effect is active.
 * @member {boolean} running
 * @memberof rune.display.Glitch
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Glitch.prototype, "running", {
    /**
     * @this rune.display.Glitch
     * @ignore
     */
    get : function() {
        return this.m_remaining > 0 && this.m_amount > 0;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Starts or restarts the effect. Displacements use local buffer pixels.
 *
 * @param {number} [duration=300] Effect duration in milliseconds.
 * @param {number} [amount=8] Maximum horizontal displacement in pixels.
 *
 * @return {undefined}
 */
rune.display.Glitch.prototype.start = function(duration, amount) {
    duration = (typeof duration === "number" && isFinite(duration)) ? duration : 300;
    amount = (typeof amount === "number" && isFinite(amount)) ? amount : 8;
    this.m_remaining = Math.max(0, duration);
    this.m_amount = Math.floor(Math.max(0, amount));
    this.m_elapsed = 0;
    this.m_refresh = true;
    this.m_invalidateParent();
};

/**
 * Stops the effect, retaining its buffer for later reuse.
 *
 * @return {undefined}
 */
rune.display.Glitch.prototype.stop = function() {
    var running = this.m_remaining > 0;
    this.m_remaining = 0;
    if (running) this.m_invalidateParent();
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Advances the effect and requests a new pattern every 60 milliseconds.
 *
 * @param {number} step Elapsed time in milliseconds.
 * @return {undefined}
 * @package
 * @ignore
 */
rune.display.Glitch.prototype.update = function(step) {
    if (this.m_remaining <= 0 || typeof step !== "number" || !isFinite(step) || step <= 0) return;
    this.m_remaining = Math.max(0, this.m_remaining - step);
    this.m_elapsed += step;
    if (this.m_elapsed >= 60) {
        this.m_elapsed %= 60;
        this.m_refresh = true;
    }
    if (this.m_refresh || this.m_remaining === 0) this.m_invalidateParent();
};

/**
 * Marks the separate effect image stale after the owner renders new content.
 * @return {undefined}
 * @package
 * @ignore
 */
rune.display.Glitch.prototype.invalidate = function() {
    this.m_dirty = true;
};

/**
 * Returns the original image while idle, or a reusable displaced copy. Rebuilds
 * only when content, dimensions or the band pattern changes. Ownerless instances
 * are camera effects, applied before overlays in Camera.render instead.
 *
 * @param {rune.display.Canvas} canvas The original object buffer.
 * @return {rune.display.Canvas} The buffer to composite.
 * @package
 * @ignore
 */
rune.display.Glitch.prototype.getCanvas = function(canvas) {
    if (this.m_owner == null || !this['running'] || canvas == null) return canvas;
    var source = canvas['element'];
    var width = source.width;
    var height = source.height;
    if (width < 2 || height < 1) return canvas;
    if (this.m_output == null) {
        this.m_output = new rune.display.Canvas(width, height);
        this.m_dirty = true;
    } else if (this.m_output['element'].width !== width || this.m_output['element'].height !== height) {
        this.m_output.resize(width, height);
        this.m_refresh = true;
        this.m_dirty = true;
    }
    if (this.m_dirty || this.m_refresh || this.m_source !== source) {
        this.m_output.clear();
        this.m_output['context'].drawImage(source, 0, 0);
        this.m_renderBands(this.m_output);
        this.m_source = source;
        this.m_dirty = false;
    }
    return this.m_output;
};

/**
 * Stops the effect and releases its pixel buffer.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.display.Glitch.prototype.dispose = function() {
    this.stop();
    if (this.m_canvas != null) {
        this.m_canvas.dispose();
        this.m_canvas = null;
    }
    if (this.m_output != null) {
        this.m_output.dispose();
        this.m_output = null;
    }
    this.m_source = null;
    this.m_owner = null;
    this.m_bands.length = 0;
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Displaces four non-overlapping bands, wrapping pixels across horizontal edges.
 * The destination must contain a fresh source image before each call.
 *
 * @param {rune.display.Canvas} canvas The destination image to displace.
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Glitch.prototype.m_renderBands = function(canvas) {
    if (this.m_remaining <= 0 || this.m_amount <= 0 || canvas == null) return;
    var source = canvas['element'];
    var width = source.width;
    var height = source.height;
    if (width < 2 || height < 1) return;
    if (this.m_height !== height) {
        this.m_height = height;
        this.m_refresh = true;
    }
    
    var scratchHeight = Math.min(8, height);
    if (this.m_canvas == null) {
        this.m_canvas = new rune.display.Canvas(width, scratchHeight);
        this.m_refresh = true;
    } else if (this.m_canvas['element'].width != width || this.m_canvas['element'].height != scratchHeight) {
        this.m_canvas.resize(width, scratchHeight);
        this.m_refresh = true;
    }
    
    var count = Math.min(4, height);
    var limit = Math.min(this.m_amount, width - 1);
    var i;
    if (this.m_refresh) {
        for (i = 0; i < count; i++) {
            var top = Math.floor(i * height / count);
            var bottom = Math.floor((i + 1) * height / count);
            var size = 1 + Math.floor(Math.random() * Math.min(8, bottom - top));
            this.m_bands[i * 3] = top + Math.floor(Math.random() * (bottom - top - size + 1));
            this.m_bands[i * 3 + 1] = size;
            this.m_bands[i * 3 + 2] = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * limit));
        }
        this.m_refresh = false;
    }
    
    var scratch = this.m_canvas['context'];
    var context = canvas['context'];
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
    for (i = 0; i < count; i++) {
        var y = this.m_bands[i * 3];
        var h = this.m_bands[i * 3 + 1];
        var offset = (this.m_bands[i * 3 + 2] + width) % width;
        scratch.clearRect(0, 0, width, h);
        scratch.drawImage(source, 0, y, width, h, 0, 0, width, h);
        context.clearRect(0, y, width, h);
        context.drawImage(this.m_canvas['element'], 0, 0, width - offset, h, offset, y, width - offset, h);
        context.drawImage(this.m_canvas['element'], width - offset, 0, offset, h, 0, y, offset, h);
    }
    
    context.restore();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Invalidates ancestor composites without repainting the owner's original image.
 * @return {undefined}
 * @private
 */
rune.display.Glitch.prototype.m_invalidateParent = function() {
    if (this.m_owner != null && this.m_owner['parent'] != null) {
        this.m_owner['parent'].breakCache();
    }
};
