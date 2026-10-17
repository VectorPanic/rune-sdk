//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a camera glitch subsystem. Buffers are allocated on first use.
 *
 * @constructor
 * @class
 * @classdesc
 * Applies intermittent horizontal band displacement to a camera pixel buffer.
 */
rune.camera.CameraGlitch = function() {
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

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
     * Maximum horizontal displacement in camera buffer pixels.
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
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Starts or restarts the effect. Displacements use camera buffer pixels.
 *
 * @param {number} [duration=300] Effect duration in milliseconds.
 * @param {number} [amount=8] Maximum horizontal displacement in pixels.
 *
 * @return {undefined}
 */
rune.camera.CameraGlitch.prototype.start = function(duration, amount) {
    duration = (typeof duration === "number" && isFinite(duration)) ? duration : 300;
    amount = (typeof amount === "number" && isFinite(amount)) ? amount : 8;
    this.m_remaining = Math.max(0, duration);
    this.m_amount = Math.floor(Math.max(0, amount));
    this.m_elapsed = 0;
    this.m_refresh = true;
};

/**
 * Stops the effect, retaining its buffer for later reuse.
 *
 * @return {undefined}
 */
rune.camera.CameraGlitch.prototype.stop = function() {
    this.m_remaining = 0;
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
rune.camera.CameraGlitch.prototype.update = function(step) {
    if (this.m_remaining <= 0 || !isFinite(step) || step <= 0) return;
    this.m_remaining = Math.max(0, this.m_remaining - step);
    this.m_elapsed += step;
    if (this.m_elapsed >= 60) {
        this.m_elapsed %= 60;
        this.m_refresh = true;
    }
};

/**
 * Displaces four non-overlapping bands, wrapping pixels across horizontal edges.
 * The camera must render a fresh image before each call.
 *
 * @param {rune.display.Canvas} canvas The freshly rendered camera buffer.
 * @return {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraGlitch.prototype.render = function(canvas) {
    if (this.m_remaining <= 0 || this.m_amount <= 0 || canvas == null) return;
    var source = canvas['element'];
    var width = source.width;
    var height = source.height;
    if (width < 2 || height < 1) return;
    if (this.m_canvas == null) {
        this.m_canvas = new rune.display.Canvas(width, height);
        this.m_refresh = true;
    } else if (this.m_canvas['element'].width != width || this.m_canvas['element'].height != height) {
        this.m_canvas.resize(width, height);
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

/**
 * Stops the effect and releases its pixel buffer.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraGlitch.prototype.dispose = function() {
    this.stop();
    if (this.m_canvas != null) {
        this.m_canvas.dispose();
        this.m_canvas = null;
    }
    this.m_bands.length = 0;
};
